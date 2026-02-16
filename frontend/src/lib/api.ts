/**
 * API client for the HMCTS Task Management backend.
 */

import {
  Task,
  TaskListResponse,
  CreateTaskPayload,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from "@/types/task";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiError";
    this.status = status;
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    const message = errorBody.detail || `API error: ${response.status}`;
    throw new ApiError(message, response.status);
  }
  if (response.status === 204) {
    return undefined as T;
  }
  return response.json();
}

export const taskApi = {
  async getAll(status?: string): Promise<TaskListResponse> {
    const params = new URLSearchParams();
    if (status && status !== "all") params.set("status", status);
    const url = `${API_BASE_URL}/api/tasks${params.toString() ? `?${params}` : ""}`;
    const res = await fetch(url, { cache: "no-store" });
    return handleResponse<TaskListResponse>(res);
  },

  async getById(id: number): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      cache: "no-store",
    });
    return handleResponse<Task>(res);
  },

  async create(data: CreateTaskPayload): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async updateStatus(id: number, data: UpdateTaskStatusPayload): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}/status`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async update(id: number, data: UpdateTaskPayload): Promise<Task> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });
    return handleResponse<Task>(res);
  },

  async delete(id: number): Promise<void> {
    const res = await fetch(`${API_BASE_URL}/api/tasks/${id}`, {
      method: "DELETE",
    });
    return handleResponse<void>(res);
  },
};

export { ApiError };
