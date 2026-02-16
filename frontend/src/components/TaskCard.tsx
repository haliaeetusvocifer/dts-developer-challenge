"use client";

import { Task, TaskStatus } from "@/types/task";
import StatusBadge from "./StatusBadge";
import { formatDate, isOverdue } from "@/lib/utils";

interface TaskCardProps {
  task: Task;
  onUpdateStatus: (id: number, status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (id: number) => void;
}

export default function TaskCard({ task, onUpdateStatus, onEdit, onDelete }: TaskCardProps) {
  const overdue = task.status !== "completed" && isOverdue(task.due_date);

  return (
    <div
      className={`rounded-lg border bg-white dark:bg-gray-800 p-4 shadow-sm transition hover:shadow-md ${
        overdue ? "border-red-300 dark:border-red-700" : "border-gray-200 dark:border-gray-700"
      }`}
      data-testid="task-card"
    >
      <div className="flex items-start justify-between">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 truncate">
              {task.title}
            </h3>
            <StatusBadge status={task.status} />
          </div>
          {task.description && (
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {task.description}
            </p>
          )}
          <div className="mt-2 flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
            <span className={overdue ? "text-red-600 dark:text-red-400 font-medium" : ""}>
              Due: {formatDate(task.due_date)}
              {overdue && " (Overdue)"}
            </span>
            <span>Created: {formatDate(task.created_at)}</span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="mt-3 flex items-center gap-2 border-t dark:border-gray-700 pt-3">
        {/* Status quick-change buttons */}
        {task.status !== "todo" && (
          <button
            onClick={() => onUpdateStatus(task.id, "todo")}
            className="rounded px-2 py-1 text-xs font-medium text-blue-700 bg-blue-50 hover:bg-blue-100"
          >
            To Do
          </button>
        )}
        {task.status !== "in_progress" && (
          <button
            onClick={() => onUpdateStatus(task.id, "in_progress")}
            className="rounded px-2 py-1 text-xs font-medium text-yellow-700 bg-yellow-50 hover:bg-yellow-100"
          >
            In Progress
          </button>
        )}
        {task.status !== "completed" && (
          <button
            onClick={() => onUpdateStatus(task.id, "completed")}
            className="rounded px-2 py-1 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100"
          >
            Complete
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onEdit(task)}
          className="rounded px-2 py-1 text-xs font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(task.id)}
          className="rounded px-2 py-1 text-xs font-medium text-red-700 bg-red-50 hover:bg-red-100"
          data-testid="delete-button"
        >
          Delete
        </button>
      </div>
    </div>
  );
}
