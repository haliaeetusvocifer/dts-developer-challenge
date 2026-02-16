import {
  Task,
  TaskListResponse,
  CreateTaskPayload,
} from "@/types/task";

// Mock fetch globally for API tests
const mockFetchResponse = (data: unknown, status = 200) => {
  return jest.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
};

describe("taskApi", () => {
  beforeEach(() => {
    jest.resetModules();
    jest.restoreAllMocks();
  });

  it("getAll calls correct URL", async () => {
    const mockData: TaskListResponse = { tasks: [], total: 0 };
    global.fetch = mockFetchResponse(mockData);

    const { taskApi } = await import("@/lib/api");
    const result = await taskApi.getAll();
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks"),
      expect.any(Object)
    );
    expect(result.total).toBe(0);
  });

  it("getAll with status filter adds query param", async () => {
    const mockData: TaskListResponse = { tasks: [], total: 0 };
    global.fetch = mockFetchResponse(mockData);

    const { taskApi } = await import("@/lib/api");
    await taskApi.getAll("completed");
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("status=completed"),
      expect.any(Object)
    );
  });

  it("create sends POST request", async () => {
    const mockTask: Task = {
      id: 1,
      title: "Test",
      description: null,
      status: "todo",
      due_date: "2026-03-01T10:00:00Z",
      created_at: "2026-01-01T10:00:00Z",
      updated_at: "2026-01-01T10:00:00Z",
    };
    global.fetch = mockFetchResponse(mockTask, 201);

    const { taskApi } = await import("@/lib/api");
    const payload: CreateTaskPayload = {
      title: "Test",
      due_date: "2026-03-01T10:00:00Z",
    };
    const result = await taskApi.create(payload);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks"),
      expect.objectContaining({ method: "POST" })
    );
    expect(result.id).toBe(1);
  });

  it("delete sends DELETE request", async () => {
    global.fetch = mockFetchResponse(undefined, 204);

    const { taskApi } = await import("@/lib/api");
    await taskApi.delete(1);
    expect(global.fetch).toHaveBeenCalledWith(
      expect.stringContaining("/api/tasks/1"),
      expect.objectContaining({ method: "DELETE" })
    );
  });

  it("throws ApiError on non-ok response", async () => {
    global.fetch = jest.fn().mockResolvedValue({
      ok: false,
      status: 404,
      json: () => Promise.resolve({ detail: "Not found" }),
    });

    const { taskApi } = await import("@/lib/api");
    await expect(taskApi.getById(999)).rejects.toThrow("Not found");
  });
});
