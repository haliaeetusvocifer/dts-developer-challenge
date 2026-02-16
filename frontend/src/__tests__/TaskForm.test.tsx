import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import TaskForm from "@/components/TaskForm";

describe("TaskForm", () => {
  const mockOnSubmit = jest.fn().mockResolvedValue(undefined);
  const mockOnCancel = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders all form fields", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByLabelText(/title/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/due date/i)).toBeInTheDocument();
  });

  it("shows Create Task button when no task prop", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByRole("button", { name: /create task/i })).toBeInTheDocument();
  });

  it("shows Update Task button when task prop provided", () => {
    const task = {
      id: 1,
      title: "Existing",
      description: null,
      status: "todo" as const,
      due_date: "2026-03-01T10:00:00Z",
      created_at: "2026-01-01T10:00:00Z",
      updated_at: "2026-01-01T10:00:00Z",
    };
    render(<TaskForm task={task} onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    expect(screen.getByRole("button", { name: /update task/i })).toBeInTheDocument();
  });

  it("validates required fields", async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));
    await waitFor(() => {
      expect(screen.getByTestId("error-title")).toBeInTheDocument();
      expect(screen.getByTestId("error-due-date")).toBeInTheDocument();
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("calls onCancel when Cancel is clicked", async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await userEvent.click(screen.getByRole("button", { name: /cancel/i }));
    expect(mockOnCancel).toHaveBeenCalled();
  });

  it("submits valid form data", async () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await userEvent.type(screen.getByLabelText(/title/i), "Test task");
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2030-06-01T10:00" },
    });
    fireEvent.click(screen.getByRole("button", { name: /create task/i }));
    await waitFor(() => {
      expect(mockOnSubmit).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Test task",
          status: "todo",
        })
      );
    });
  });

  it("rejects due date in the past", async () => {
    const { container } = render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    await userEvent.type(screen.getByLabelText(/title/i), "Past task");
    fireEvent.change(screen.getByLabelText(/due date/i), {
      target: { value: "2020-01-01T10:00" },
    });
    // Submit via form element to ensure onSubmit fires
    const form = container.querySelector("form")!;
    fireEvent.submit(form);
    await waitFor(() => {
      expect(screen.getByTestId("error-due-date")).toHaveTextContent(
        "Due date cannot be in the past"
      );
    });
    expect(mockOnSubmit).not.toHaveBeenCalled();
  });

  it("sets min attribute on due date input", () => {
    render(<TaskForm onSubmit={mockOnSubmit} onCancel={mockOnCancel} />);
    const input = screen.getByLabelText(/due date/i);
    expect(input).toHaveAttribute("min");
  });
});
