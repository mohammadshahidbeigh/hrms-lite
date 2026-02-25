import { request } from "./client";

export function markAttendance(payload) {
  return request("/attendance", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function fetchAttendanceForEmployee(employeeId) {
  return request(`/attendance/${employeeId}`);
}

export function fetchAttendanceWithFilters(employeeId, startDate, endDate) {
  const params = new URLSearchParams({ employee_id: String(employeeId) });
  if (startDate) params.set("start_date", startDate);
  if (endDate) params.set("end_date", endDate);
  return request(`/attendance?${params.toString()}`);
}

