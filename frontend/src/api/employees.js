import { request } from "./client";

export function fetchEmployees() {
  return request("/employees");
}

export function createEmployee(payload) {
  return request("/employees", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

export function deleteEmployee(id) {
  return request(`/employees/${id}`, {
    method: "DELETE",
  });
}

