import { useEffect, useMemo, useState } from "react";
import { fetchEmployees } from "../api/employees";
import {
  fetchAttendanceWithFilters,
  markAttendance,
} from "../api/attendance";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { Loader } from "../components/Loader";
import { Select } from "../components/Select";
import { Table } from "../components/Table";

const initialForm = {
  employee_id: "",
  date: "",
  status: "present",
};

export function AttendancePage() {
  const [employees, setEmployees] = useState([]);
  const [selectedEmployeeId, setSelectedEmployeeId] = useState("");
  const [form, setForm] = useState(initialForm);
  const [loadingEmployees, setLoadingEmployees] = useState(false);
  const [loadingAttendance, setLoadingAttendance] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attendance, setAttendance] = useState([]);
  const [error, setError] = useState("");
  const [filterStartDate, setFilterStartDate] = useState("");
  const [filterEndDate, setFilterEndDate] = useState("");

  const selectedEmployee = useMemo(
    () =>
      employees.find((e) => String(e.id) === String(selectedEmployeeId)) || null,
    [employees, selectedEmployeeId],
  );

  const totalPresent = useMemo(
    () => attendance.filter((a) => a.status === "present").length,
    [attendance],
  );

  async function loadEmployees() {
    try {
      setLoadingEmployees(true);
      setError("");
      const data = await fetchEmployees();
      setEmployees(data);
      if (data.length > 0 && !selectedEmployeeId) {
        setSelectedEmployeeId(String(data[0].id));
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingEmployees(false);
    }
  }

  async function loadAttendance(employeeId, startDate, endDate) {
    if (!employeeId) {
      setAttendance([]);
      return;
    }
    try {
      setLoadingAttendance(true);
      setError("");
      const data = await fetchAttendanceWithFilters(
        employeeId,
        startDate,
        endDate,
      );
      setAttendance(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoadingAttendance(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  useEffect(() => {
    if (selectedEmployeeId) {
      loadAttendance(selectedEmployeeId, filterStartDate, filterEndDate);
      setForm((prev) => ({ ...prev, employee_id: Number(selectedEmployeeId) }));
    }
  }, [selectedEmployeeId, filterStartDate, filterEndDate]);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.employee_id || !form.date || !form.status) {
      setError("Employee, date, and status are required");
      return;
    }

    try {
      setSubmitting(true);
      setError("");
      const payload = {
        employee_id: Number(form.employee_id),
        date: form.date,
        status: form.status,
      };
      await markAttendance(payload);
      await loadAttendance(form.employee_id, filterStartDate, filterEndDate);
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Mark Attendance
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Choose an employee, date, and status to record daily attendance.
        </p>

        <ErrorBanner message={error} onDismiss={() => setError("")} />

        {loadingEmployees ? (
          <Loader />
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees available"
            description="Add employees first before tracking attendance."
          />
        ) : (
          <form
            onSubmit={handleSubmit}
            className="grid gap-4 md:grid-cols-3 md:items-end"
          >
            <Select
              label="Employee"
              value={selectedEmployeeId}
              onChange={(e) => setSelectedEmployeeId(e.target.value)}
            >
              {employees.map((employee) => (
                <option key={employee.id} value={employee.id}>
                  {employee.employee_id} – {employee.full_name}
                </option>
              ))}
            </Select>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-slate-700">Date</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </label>

            <Select
              label="Status"
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
            >
              <option value="present">Present</option>
              <option value="absent">Absent</option>
            </Select>

            <div className="md:col-span-3 flex justify-end pt-2">
              <Button type="submit" disabled={submitting}>
                {submitting ? "Saving..." : "Mark Attendance"}
              </Button>
            </div>
          </form>
        )}
      </section>

      <section>
        <div className="mb-3 space-y-2">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
                Attendance Records
              </h2>
              {selectedEmployee && (
                <p className="text-xs text-slate-500">
                  {selectedEmployee.full_name} &middot; Total present days:{" "}
                  <span className="font-medium text-slate-700">
                    {totalPresent}
                  </span>
                </p>
              )}
            </div>
            {selectedEmployeeId && (
              <Button
                variant="subtle"
                onClick={() =>
                  loadAttendance(
                    selectedEmployeeId,
                    filterStartDate,
                    filterEndDate,
                  )
                }
                disabled={loadingAttendance}
              >
                Refresh
              </Button>
            )}
          </div>

          <div className="flex flex-wrap items-end gap-3 text-sm">
            <label className="flex flex-col gap-1">
              <span className="font-medium text-slate-700">From date</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                value={filterStartDate}
                onChange={(e) => setFilterStartDate(e.target.value)}
              />
            </label>
            <label className="flex flex-col gap-1">
              <span className="font-medium text-slate-700">To date</span>
              <input
                type="date"
                className="rounded-md border border-slate-300 px-3 py-2 text-sm shadow-sm focus:border-sky-500 focus:outline-none focus:ring-2 focus:ring-sky-500/40"
                value={filterEndDate}
                onChange={(e) => setFilterEndDate(e.target.value)}
              />
            </label>
            <Button
              variant="subtle"
              className="mt-5"
              onClick={() =>
                loadAttendance(
                  selectedEmployeeId,
                  filterStartDate,
                  filterEndDate,
                )
              }
              disabled={loadingAttendance || !selectedEmployeeId}
            >
              Apply filters
            </Button>
          </div>
        </div>

        {loadingAttendance ? (
          <Loader />
        ) : !selectedEmployeeId || attendance.length === 0 ? (
          <EmptyState
            title="No attendance records"
            description="Mark attendance above to see history for this employee."
          />
        ) : (
          <Table columns={["Date", "Status"]}>
            {attendance.map((item) => (
              <tr key={item.id}>
                <td className="px-4 py-2 text-sm text-slate-900">
                  {item.date}
                </td>
                <td className="px-4 py-2 text-sm text-slate-700 capitalize">
                  {item.status}
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}

