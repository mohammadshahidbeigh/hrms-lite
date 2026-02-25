from datetime import date, datetime

from pydantic import BaseModel, EmailStr

from .models import AttendanceStatus


class EmployeeBase(BaseModel):
    employee_id: str
    full_name: str
    email: EmailStr
    department: str


class EmployeeCreate(EmployeeBase):
    pass


class EmployeeRead(EmployeeBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True


class EmployeeWithStats(EmployeeRead):
    total_present_days: int


class AttendanceBase(BaseModel):
    employee_id: int
    date: date
    status: AttendanceStatus


class AttendanceCreate(AttendanceBase):
    pass


class AttendanceRead(AttendanceBase):
    id: int
    created_at: datetime

    class Config:
        orm_mode = True

