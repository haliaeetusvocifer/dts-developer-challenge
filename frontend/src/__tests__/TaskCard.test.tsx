import React from "react";
import { render, screen } from "@testing-library/react";
import TaskCard from "@/components/TaskCard";
import { Task } from "@/types/task";

describe("TaskCard", () => {
  const mockTask: Task = {
    id: 1,
    title: "Review case documents",
    description: "Check all evidence files",
    status: "todo",
    due_date: "2099-03-01T10:00:00Z",
    created_at: "2026-01-01T10:00:00Z",
    updated_at: "2026-01-01T10:00:00Z",
  };

  const mockHandlers = {
    onUpdateStatus: jest.fn(),
    onEdit: jest.fn(),
    onDelete: jest.fn(),
  };

  beforeEach(() => jest.clearAllMocks());

  it("renders task title", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    expect(screen.getByText("Review case documents")).toBeInTheDocument();
  });

  it("renders task description", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    expect(screen.getByText("Check all evidence files")).toBeInTheDocument();
  });

  it("renders status badge", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("To Do");
  });

  it("shows overdue indicator for past due tasks", () => {
    const overdueTask = { ...mockTask, due_date: "2020-01-01T00:00:00Z" };
    render(<TaskCard task={overdueTask} {...mockHandlers} />);
    expect(screen.getByText(/overdue/i)).toBeInTheDocument();
  });

  it("does not show overdue for completed tasks", () => {
    const completedTask = {
      ...mockTask,
      status: "completed" as const,
      due_date: "2020-01-01T00:00:00Z",
    };
    render(<TaskCard task={completedTask} {...mockHandlers} />);
    expect(screen.queryByText(/overdue/i)).not.toBeInTheDocument();
  });

  it("shows status change buttons excluding current status", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    // Task is "todo", so should not show "To Do" button
    expect(screen.queryByRole("button", { name: /^to do$/i })).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: /in progress/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /complete$/i })).toBeInTheDocument();
  });

  it("has an edit button", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    expect(screen.getByRole("button", { name: /edit/i })).toBeInTheDocument();
  });

  it("has a delete button", () => {
    render(<TaskCard task={mockTask} {...mockHandlers} />);
    expect(screen.getByTestId("delete-button")).toBeInTheDocument();
  });
});
