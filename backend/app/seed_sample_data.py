import random
from datetime import date, timedelta

from .database import Base, SessionLocal, engine
from .models import Attendance, AttendanceStatus, Employee


def create_sample_data(num_employees: int = 30) -> None:
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    departments = ["Engineering", "HR", "Finance", "Operations", "Sales"]

    try:
        # Clear existing data (optional: comment out if you don't want this)
        db.query(Attendance).delete()
        db.query(Employee).delete()
        db.commit()

        employees: list[Employee] = []

        for i in range(1, num_employees + 1):
            emp = Employee(
                employee_id=f"E{i:03d}",
                full_name=f"Employee {i}",
                email=f"employee{i}@example.com",
                department=random.choice(departments),
            )
            db.add(emp)
            employees.append(emp)

        db.commit()

        # Refresh to ensure IDs are loaded
        for emp in employees:
            db.refresh(emp)

        # Create attendance for the last 10 working days
        today = date.today()
        days_back = 10

        for emp in employees:
            for offset in range(days_back):
                day = today - timedelta(days=offset)
                # Simple pattern: more likely present than absent
                status = AttendanceStatus.PRESENT if random.random() < 0.8 else AttendanceStatus.ABSENT
                record = Attendance(
                    employee_id=emp.id,
                    date=day,
                    status=status,
                )
                db.add(record)

        db.commit()
        print(f"Seeded {len(employees)} employees with {len(employees) * days_back} attendance records.")
    finally:
        db.close()


if __name__ == "__main__":
    create_sample_data(40)

