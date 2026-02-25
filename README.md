## HRMS Lite

A lightweight Human Resource Management System for managing **employees** and **daily attendance**, built as a small but production-flavoured full-stack app.

### Overview

- **Purpose**: Internal-style HR tool for a single admin to:
  - Manage employee records (create, list, delete).
  - Mark and view daily attendance (present/absent).
- **Focus**: Clean architecture, strong backend modelling, simple but professional UI, and deployment readiness.

### Tech Stack

- **Frontend**
  - React (Vite)
  - Tailwind CSS
- **Backend**
  - FastAPI
  - SQLAlchemy ORM
  - Pydantic schemas
- **Database**
  - PostgreSQL (e.g. Neon)
- **Deployment Targets**
  - Frontend: Vercel
  - Backend: Render (Docker or native FastAPI)

### Core Features

- **Employee Management**
  - Add employee with:
    - Employee ID (unique business ID)
    - Full name
    - Email (unique, validated)
    - Department
  - List all employees.
  - Delete an employee (cascades to attendance).

- **Attendance Management**
  - Mark attendance for an employee with:
    - Date
    - Status: `present` / `absent`
  - View attendance records per employee.
  - Prevent duplicate attendance for the same employee on the same date.
  - Show total present days per employee (on the Attendance UI summary).

### Repository Structure

- `backend/`
  - `app/`
    - `main.py` – FastAPI app, CORS, router wiring, health check.
    - `core/config.py` – environment configuration (DATABASE_URL, CORS).
    - `database.py` – SQLAlchemy engine, SessionLocal, Base.
    - `models.py` – `Employee`, `Attendance`, `AttendanceStatus` enum.
    - `schemas.py` – Pydantic request/response models.
    - `deps.py` – shared DB session dependency.
    - `routers/employees.py` – `/employees` CRUD endpoints.
    - `routers/attendance.py` – `/attendance` endpoints.
  - `requirements.txt` – backend Python dependencies.
- `frontend/`
  - Vite + React + Tailwind app:
    - `src/App.jsx`, `src/main.jsx`.
    - `src/api/*` – API client wrappers.
    - `src/components/*` – reusable UI components.
    - `src/pages/EmployeesPage.jsx` – employees UI.
    - `src/pages/AttendancePage.jsx` – attendance UI.
- `.env.example` – example backend environment variables.
- `Dockerfile` – container for FastAPI backend (suitable for Render).

### Database Schema

- **employees**
  - `id` – integer PK.
  - `employee_id` – unique business ID, indexed.
  - `full_name` – required.
  - `email` – required, unique, indexed.
  - `department` – required.
  - `created_at` – timestamp (default `now()`).

- **attendance**
  - `id` – integer PK.
  - `employee_id` – FK → `employees.id`, `ON DELETE CASCADE`.
  - `date` – date, required.
  - `status` – enum `present`/`absent`.
  - `created_at` – timestamp (default `now()`).
  - Constraint: `UNIQUE (employee_id, date)` to prevent double-marking.

### API Endpoints (Backend)

- **Health**
  - `GET /health` – simple `{ "status": "ok" }`.

- **Employees**
  - `POST /employees`
    - Body: `employee_id`, `full_name`, `email`, `department`.
    - Validates email format and required fields.
    - Returns `201 Created` with the employee.
    - Returns `409 Conflict` on duplicate `employee_id` or `email`.
  - `GET /employees`
    - Returns list of all employees.
  - `GET /employees/{id}`
    - Returns a single employee by internal ID or `404` if not found.
  - `DELETE /employees/{id}`
    - Deletes employee and cascades attendance.
    - Returns `204 No Content` or `404` if not found.

- **Attendance**
  - `POST /attendance`
    - Body: `employee_id` (internal FK ID), `date`, `status` (`present`/`absent`).
    - Fails with `404` if employee does not exist.
    - Fails with `409` if attendance for that employee/date already exists.
  - `GET /attendance?employee_id={id}[&start_date=YYYY-MM-DD&end_date=YYYY-MM-DD]`
    - Lists attendance for an employee (optionally filtered by date range).
  - `GET /attendance/{employee_id}`
    - Convenience endpoint to get all attendance records for an employee.

### Frontend Behaviour

- **Employees Page**
  - Add employee form with client-side validation:
    - Required fields.
    - Email pattern check.
  - Employee list with:
    - Employee ID, full name, email, department.
    - Delete button (with confirmation).
  - States handled:
    - Loading (spinner).
    - Empty state when no employees.
    - Error banner with message from backend.

- **Attendance Page**
  - Employee dropdown sourced from `/employees`.
  - Date picker and status select.
  - Mark attendance form wired to `/attendance` `POST`.
  - Attendance table per employee wired to `/attendance/{employee_id}`.
  - Summary:
    - Shows total present days for the selected employee.
  - States handled:
    - Loading employees.
    - Loading attendance.
    - Empty states when no employees or no attendance.
    - Error banner from backend messages.

### Running the Project Locally

#### Prerequisites

- Python 3.11+
- Node.js 18+ and npm
- A running PostgreSQL instance (local or cloud, e.g. Neon)

#### Backend (FastAPI)

1. Navigate to the repo root:

   ```bash
   cd backend
   ```

2. Create and activate a virtual environment (recommended).

3. Install dependencies:

   ```bash
   pip install -r requirements.txt
   ```

4. Set environment variables (or create a `.env` file next to `app/`):

   - `DATABASE_URL` – Postgres connection string (see `.env.example`).
   - `BACKEND_CORS_ORIGINS` – comma-separated list of allowed origins (e.g. `http://localhost:5173`).

5. Run the server:

   ```bash
   uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
   ```

6. Open API docs:

   - Swagger UI: `http://localhost:8000/docs`

#### Frontend (React + Vite)

1. From the repo root:

   ```bash
   cd frontend
   npm install
   ```

2. Create `frontend/.env`:

   ```bash
   echo "VITE_API_BASE_URL=http://localhost:8000" > .env
   ```

3. Run the dev server:

   ```bash
   npm run dev
   ```

4. Open the app at:

   - `http://localhost:5173`

### Deployment Guide

#### 1. Database (Neon)

1. Create a new Neon Postgres project and database.
2. Obtain the connection string and use it as `DATABASE_URL`.
3. The FastAPI app uses SQLAlchemy models and `Base.metadata.create_all` to create tables automatically on startup.

#### 2. Backend (Render)

Option A: **Docker (using provided `Dockerfile`)**

1. Push this repository to GitHub.
2. In Render, create a new **Web Service** from your GitHub repo.
3. Choose:
   - Environment: Docker.
   - Root directory: repo root (where `Dockerfile` lives).
4. Set environment variables in Render:
   - `DATABASE_URL` – Neon connection string.
   - `BACKEND_CORS_ORIGINS` – e.g. `http://localhost:5173,https://your-vercel-frontend-url`.
5. Deploy. Your backend base URL will look like:
   - `https://your-backend.onrender.com`

Option B: **Native FastAPI** (without Docker)

1. Use Render's Python environment.
2. Build command: `pip install -r backend/requirements.txt`.
3. Start command: `uvicorn app.main:app --host 0.0.0.0 --port 8000`.
4. Working directory: `backend`.
5. Set the same environment variables as above.

#### 3. Frontend (Vercel)

1. Import the GitHub repository into Vercel.
2. Set **Framework Preset** to **Vite** (or auto-detected).
3. Configure:
   - Build command: `npm run build`.
   - Output directory: `dist`.
4. Set environment variables:

   - `VITE_API_BASE_URL=https://your-backend.onrender.com`

5. Deploy. Your frontend will be available at:
   - `https://your-frontend.vercel.app`

### Live URLs (to be filled by you)

- **Frontend (Vercel)**: `https://your-frontend.vercel.app`
- **Backend (Render)**: `https://your-backend.onrender.com`

### Assumptions & Limitations

- Single implicit admin, no authentication or authorization.
- No pagination (dataset assumed small for this assignment).
- No advanced HR features (leave, payroll, etc.).
- Basic optimistic UI; no global state management library.

### How to Use for the Assignment

1. Set up Neon, Render, and Vercel using the steps above.
2. Update the README section **Live URLs** with your actual deployed URLs.
3. Provide:
   - Live frontend URL.
   - Live backend URL (base API URL).
   - GitHub repository link (this repo).

