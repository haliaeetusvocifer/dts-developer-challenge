import { formatDate, getStatusBadgeColor, getStatusLabel, isOverdue } from "@/lib/utils";

describe("utils", () => {
  describe("formatDate", () => {
    it("formats an ISO date string correctly", () => {
      const result = formatDate("2026-03-01T10:00:00Z");
      expect(result).toContain("2026");
      expect(result).toContain("Mar");
    });
  });

  describe("getStatusBadgeColor", () => {
    it("returns blue for todo", () => {
      expect(getStatusBadgeColor("todo")).toContain("blue");
    });

    it("returns yellow for in_progress", () => {
      expect(getStatusBadgeColor("in_progress")).toContain("yellow");
    });

    it("returns green for completed", () => {
      expect(getStatusBadgeColor("completed")).toContain("green");
    });
  });

  describe("getStatusLabel", () => {
    it("returns 'To Do' for todo", () => {
      expect(getStatusLabel("todo")).toBe("To Do");
    });

    it("returns 'In Progress' for in_progress", () => {
      expect(getStatusLabel("in_progress")).toBe("In Progress");
    });

    it("returns 'Completed' for completed", () => {
      expect(getStatusLabel("completed")).toBe("Completed");
    });
  });

  describe("isOverdue", () => {
    it("returns true for a past date", () => {
      expect(isOverdue("2020-01-01T00:00:00Z")).toBe(true);
    });

    it("returns false for a future date", () => {
      expect(isOverdue("2099-01-01T00:00:00Z")).toBe(false);
    });
  });
});
