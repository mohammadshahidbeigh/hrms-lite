from datetime import date
from typing import List, Optional

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db


router = APIRouter(prefix="/attendance", tags=["attendance"])


@router.post("", response_model=schemas.AttendanceRead, status_code=status.HTTP_201_CREATED)
def mark_attendance(attendance_in: schemas.AttendanceCreate, db: Session = Depends(get_db)) -> schemas.AttendanceRead:
    employee = db.query(models.Employee).filter(models.Employee.id == attendance_in.employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")

    existing = (
        db.query(models.Attendance)
        .filter(
            models.Attendance.employee_id == attendance_in.employee_id,
            models.Attendance.date == attendance_in.date,
        )
        .first()
    )
    if existing:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Attendance already marked for this employee on this date",
        )

    attendance = models.Attendance(**attendance_in.dict())
    db.add(attendance)
    db.commit()
    db.refresh(attendance)
    return attendance


@router.get("", response_model=List[schemas.AttendanceRead])
def list_attendance(
    employee_id: int = Query(...),
    start_date: Optional[date] = None,
    end_date: Optional[date] = None,
    db: Session = Depends(get_db),
) -> List[schemas.AttendanceRead]:
    query = db.query(models.Attendance).filter(models.Attendance.employee_id == employee_id)

    if start_date:
        query = query.filter(models.Attendance.date >= start_date)
    if end_date:
        query = query.filter(models.Attendance.date <= end_date)

    return query.order_by(models.Attendance.date.desc()).all()


@router.get("/{employee_id}", response_model=List[schemas.AttendanceRead])
def list_attendance_for_employee(
    employee_id: int,
    db: Session = Depends(get_db),
) -> List[schemas.AttendanceRead]:
    return (
        db.query(models.Attendance)
        .filter(models.Attendance.employee_id == employee_id)
        .order_by(models.Attendance.date.desc())
        .all()
    )

