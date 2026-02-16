import React from "react";
import { render, screen } from "@testing-library/react";
import StatusBadge from "@/components/StatusBadge";

describe("StatusBadge", () => {
  it("renders 'To Do' for todo status", () => {
    render(<StatusBadge status="todo" />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("To Do");
  });

  it("renders 'In Progress' for in_progress status", () => {
    render(<StatusBadge status="in_progress" />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("In Progress");
  });

  it("renders 'Completed' for completed status", () => {
    render(<StatusBadge status="completed" />);
    expect(screen.getByTestId("status-badge")).toHaveTextContent("Completed");
  });

  it("applies correct color class for todo", () => {
    render(<StatusBadge status="todo" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge.className).toContain("blue");
  });

  it("applies correct color class for completed", () => {
    render(<StatusBadge status="completed" />);
    const badge = screen.getByTestId("status-badge");
    expect(badge.className).toContain("green");
  });
});
