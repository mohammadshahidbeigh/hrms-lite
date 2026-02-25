import { useEffect, useState } from "react";
import { toast } from "react-toastify";
import { createEmployee, deleteEmployee, fetchEmployees } from "../api/employees";
import { Button } from "../components/Button";
import { EmptyState } from "../components/EmptyState";
import { ErrorBanner } from "../components/ErrorBanner";
import { Input } from "../components/Input";
import { Loader } from "../components/Loader";
import { Table } from "../components/Table";

const initialForm = {
  employee_id: "",
  full_name: "",
  email: "",
  department: "",
};

export function EmployeesPage() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [formErrors, setFormErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [departmentsSummary, setDepartmentsSummary] = useState({});

  async function loadEmployees() {
    try {
      setLoading(true);
      setError("");
      const data = await fetchEmployees();
      setEmployees(data);
      const summary = data.reduce((acc, emp) => {
        acc[emp.department] = (acc[emp.department] || 0) + 1;
        return acc;
      }, {});
      setDepartmentsSummary(summary);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadEmployees();
  }, []);

  function validate() {
    const nextErrors = {};
    if (!form.employee_id.trim()) nextErrors.employee_id = "Employee ID is required";
    if (!form.full_name.trim()) nextErrors.full_name = "Full name is required";
    if (!form.email.trim()) {
      nextErrors.email = "Email is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      nextErrors.email = "Enter a valid email";
    }
    if (!form.department.trim()) nextErrors.department = "Department is required";
    setFormErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!validate()) return;

    try {
      setSubmitting(true);
      setError("");
      await createEmployee(form);
      setForm(initialForm);
      await loadEmployees();
      toast.success("Employee created");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDelete(id) {
    if (!window.confirm("Delete this employee? This will remove their attendance as well.")) {
      return;
    }
    try {
      setError("");
      await deleteEmployee(id);
      setEmployees((prev) => prev.filter((e) => e.id !== id));
      toast.success("Employee deleted");
    } catch (err) {
      setError(err.message);
      toast.error(err.message);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Overview
        </h2>
        <p className="mb-3 text-xs text-slate-500">
          Quick snapshot of your employee directory.
        </p>
        <div className="grid gap-4 sm:grid-cols-3 text-sm">
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Total employees</p>
            <p className="text-lg font-semibold text-slate-900">
              {employees.length}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Departments</p>
            <p className="text-lg font-semibold text-slate-900">
              {Object.keys(departmentsSummary).length}
            </p>
          </div>
          <div className="rounded-md bg-slate-50 px-3 py-2">
            <p className="text-xs text-slate-500">Largest department</p>
            <p className="text-sm font-semibold text-slate-900">
              {Object.keys(departmentsSummary).length === 0
                ? "—"
                : Object.entries(departmentsSummary).sort(
                    (a, b) => b[1] - a[1],
                  )[0][0]}
            </p>
          </div>
        </div>
      </section>

      <section className="rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Add Employee
        </h2>
        <p className="mb-4 text-xs text-slate-500">
          Create a new employee record with a unique employee ID and email.
        </p>
        <form onSubmit={handleSubmit} className="grid gap-4 md:grid-cols-2">
          <Input
            label="Employee ID"
            value={form.employee_id}
            onChange={(e) => setForm({ ...form, employee_id: e.target.value })}
            error={formErrors.employee_id}
            placeholder="E001"
          />
          <Input
            label="Full Name"
            value={form.full_name}
            onChange={(e) => setForm({ ...form, full_name: e.target.value })}
            error={formErrors.full_name}
            placeholder="Jane Doe"
          />
          <Input
            label="Email"
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            error={formErrors.email}
            placeholder="jane.doe@example.com"
          />
          <Input
            label="Department"
            value={form.department}
            onChange={(e) => setForm({ ...form, department: e.target.value })}
            error={formErrors.department}
            placeholder="Engineering"
          />
          <div className="md:col-span-2 flex justify-end pt-2">
            <Button type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Add Employee"}
            </Button>
          </div>
        </form>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Employees
          </h2>
          <Button variant="subtle" onClick={loadEmployees} disabled={loading}>
            Refresh
          </Button>
        </div>

        <ErrorBanner message={error} onDismiss={() => setError("")} />

        {loading ? (
          <Loader />
        ) : employees.length === 0 ? (
          <EmptyState
            title="No employees yet"
            description="Add your first employee using the form above."
          />
        ) : (
          <Table columns={["Employee ID", "Name", "Email", "Department", ""]}>
            {employees.map((employee) => (
              <tr key={employee.id}>
                <td className="px-4 py-2 text-sm text-slate-900">
                  {employee.employee_id}
                </td>
                <td className="px-4 py-2 text-sm text-slate-700">
                  {employee.full_name}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {employee.email}
                </td>
                <td className="px-4 py-2 text-sm text-slate-600">
                  {employee.department}
                </td>
                <td className="px-4 py-2 text-right">
                  <Button
                    variant="danger"
                    className="text-xs"
                    onClick={() => handleDelete(employee.id)}
                  >
                    Delete
                  </Button>
                </td>
              </tr>
            ))}
          </Table>
        )}
      </section>
    </div>
  );
}

