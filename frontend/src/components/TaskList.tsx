"use client";

import { useState, useEffect, useCallback } from "react";
import { Task, TaskStatus, CreateTaskPayload, UpdateTaskPayload } from "@/types/task";
import { taskApi, ApiError } from "@/lib/api";
import TaskCard from "./TaskCard";
import TaskForm from "./TaskForm";

export default function TaskList() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | undefined>(undefined);
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const fetchTasks = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await taskApi.getAll(statusFilter);
      setTasks(data.tasks);
      setTotal(data.total);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to load tasks");
    } finally {
      setLoading(false);
    }
  }, [statusFilter]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const handleCreate = async (data: CreateTaskPayload | UpdateTaskPayload) => {
    try {
      setSaving(true);
      setError(null);
      await taskApi.create(data as CreateTaskPayload);
      setShowForm(false);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to create task");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdate = async (data: CreateTaskPayload | UpdateTaskPayload) => {
    if (!editingTask) return;
    try {
      setSaving(true);
      setError(null);
      await taskApi.update(editingTask.id, data as UpdateTaskPayload);
      setEditingTask(undefined);
      setShowForm(false);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update task");
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateStatus = async (id: number, status: TaskStatus) => {
    try {
      setError(null);
      await taskApi.updateStatus(id, { status });
      await fetchTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to update status");
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("Are you sure you want to delete this task?")) return;
    try {
      setError(null);
      await taskApi.delete(id);
      await fetchTasks();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Failed to delete task");
    }
  };

  const handleEdit = (task: Task) => {
    setEditingTask(task);
    setShowForm(true);
  };

  const handleCancel = () => {
    setShowForm(false);
    setEditingTask(undefined);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Task Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            {total} task{total !== 1 ? "s" : ""} total
          </p>
        </div>
        <button
          onClick={() => {
            setEditingTask(undefined);
            setShowForm(true);
          }}
          className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
          data-testid="create-task-button"
        >
          + New Task
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="rounded-md bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 p-4" data-testid="error-banner">
          <p className="text-sm text-red-800 dark:text-red-300">{error}</p>
        </div>
      )}

      {/* Form modal / inline */}
      {showForm && (
        <div className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 p-4">
          <h2 className="mb-3 text-lg font-semibold text-gray-900 dark:text-gray-100">
            {editingTask ? "Edit Task" : "Create New Task"}
          </h2>
          <TaskForm
            task={editingTask}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            onCancel={handleCancel}
            isLoading={saving}
          />
        </div>
      )}

      {/* Filter */}
      <div className="flex items-center gap-2">
        <label htmlFor="filter" className="text-sm font-medium text-gray-700 dark:text-gray-300">
          Filter:
        </label>
        <select
          id="filter"
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-1.5 text-sm shadow-sm text-gray-900 dark:text-gray-100"
        >
          <option value="all">All</option>
          <option value="todo">To Do</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex justify-center py-12" data-testid="loading-spinner">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent" />
        </div>
      ) : tasks.length === 0 ? (
        <div className="rounded-lg border-2 border-dashed border-gray-300 dark:border-gray-600 p-12 text-center" data-testid="empty-state">
          <p className="text-gray-500 dark:text-gray-400">No tasks found. Create your first task!</p>
        </div>
      ) : (
        <div className="space-y-3" data-testid="task-list">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onUpdateStatus={handleUpdateStatus}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}
    </div>
  );
}
