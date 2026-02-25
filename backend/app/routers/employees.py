from typing import List

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import or_
from sqlalchemy.orm import Session

from .. import models, schemas
from ..deps import get_db


router = APIRouter(prefix="/employees", tags=["employees"])


@router.post("", response_model=schemas.EmployeeRead, status_code=status.HTTP_201_CREATED)
def create_employee(employee_in: schemas.EmployeeCreate, db: Session = Depends(get_db)) -> schemas.EmployeeRead:
    existing = (
        db.query(models.Employee)
        .filter(
            or_(
                models.Employee.employee_id == employee_in.employee_id,
                models.Employee.email == employee_in.email,
            )
        )
        .first()
    )
    if existing:
        if existing.employee_id == employee_in.employee_id:
            detail = "Employee with this employee_id already exists"
        elif existing.email == employee_in.email:
            detail = "Employee with this email already exists"
        else:
            detail = "Employee already exists"
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=detail)

    employee = models.Employee(**employee_in.dict())
    db.add(employee)
    db.commit()
    db.refresh(employee)
    return employee


@router.get("", response_model=List[schemas.EmployeeRead])
def list_employees(
    db: Session = Depends(get_db),
    limit: int = 100,
    offset: int = 0,
) -> List[schemas.EmployeeRead]:
    query = db.query(models.Employee).order_by(models.Employee.employee_id).offset(offset).limit(limit)
    return query.all()


@router.get("/{employee_id}", response_model=schemas.EmployeeRead)
def get_employee(employee_id: int, db: Session = Depends(get_db)) -> schemas.EmployeeRead:
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    return employee


@router.delete("/{employee_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_employee(employee_id: int, db: Session = Depends(get_db)) -> None:
    employee = db.query(models.Employee).filter(models.Employee.id == employee_id).first()
    if not employee:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Employee not found")
    db.delete(employee)
    db.commit()
    return None

