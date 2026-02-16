"use client";

import { useState } from "react";
import { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from "@/types/task";
import { formatDateForInput } from "@/lib/utils";

interface TaskFormProps {
  task?: Task;
  onSubmit: (data: CreateTaskPayload | UpdateTaskPayload) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
}

export default function TaskForm({ task, onSubmit, onCancel, isLoading }: TaskFormProps) {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState<TaskStatus>(task?.status || "todo");
  const [dueDate, setDueDate] = useState(
    task?.due_date ? formatDateForInput(task.due_date) : ""
  );
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Minimum datetime for the date picker (current time, formatted for datetime-local)
  const now = new Date();
  const minDateTime = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}T${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = "Title is required";
    if (title.length > 255) newErrors.title = "Title must be 255 characters or fewer";
    if (!dueDate) {
      newErrors.dueDate = "Due date is required";
    } else if (new Date(dueDate) < new Date()) {
      newErrors.dueDate = "Due date cannot be in the past";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const payload: CreateTaskPayload = {
      title: title.trim(),
      description: description.trim() || null,
      status,
      due_date: new Date(dueDate).toISOString(),
    };
    await onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4" data-testid="task-form">
      {/* Title */}
      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter task title"
          maxLength={255}
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="error-title">
            {errors.title}
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          placeholder="Enter task description (optional)"
          maxLength={2000}
        />
      </div>

      {/* Status */}
      <div>
        <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Status
        </label>
        <select
          id="status"
          value={status}
          onChange={(e) => setStatus(e.target.value as TaskStatus)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        >
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Due Date */}
      <div>
        <label htmlFor="due_date" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
          Due Date <span className="text-red-500">*</span>
        </label>
        <input
          id="due_date"
          type="datetime-local"
          value={dueDate}
          min={minDateTime}
          onChange={(e) => setDueDate(e.target.value)}
          className="mt-1 block w-full rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 shadow-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
        />
        {errors.dueDate && (
          <p className="mt-1 text-sm text-red-600 dark:text-red-400" data-testid="error-due-date">
            {errors.dueDate}
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 shadow-sm hover:bg-gray-50 dark:hover:bg-gray-600"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700 disabled:opacity-50"
        >
          {isLoading ? "Saving…" : task ? "Update Task" : "Create Task"}
        </button>
      </div>
    </form>
  );
}
