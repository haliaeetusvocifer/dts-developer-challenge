/**
 * Task type definitions matching the backend API.
 */

export type TaskStatus = "todo" | "in_progress" | "completed";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  due_date: string;
  created_at: string;
  updated_at: string;
}

export interface TaskListResponse {
  tasks: Task[];
  total: number;
}

export interface CreateTaskPayload {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  due_date: string;
}

export interface UpdateTaskPayload {
  title?: string;
  description?: string | null;
  status?: TaskStatus;
  due_date?: string;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}
