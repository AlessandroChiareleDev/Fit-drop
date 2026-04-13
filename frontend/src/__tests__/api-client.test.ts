import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Import after mocking
const { api, ApiError } = await import("@/lib/api/client");

beforeEach(() => {
  mockFetch.mockReset();
});

function jsonResponse(data: unknown, status = 200) {
  return Promise.resolve({
    ok: status >= 200 && status < 300,
    status,
    json: () => Promise.resolve(data),
  });
}

describe("api.users", () => {
  it("list() calls GET /users/", async () => {
    const users = [{ id: "1", name: "Test" }];
    mockFetch.mockReturnValueOnce(jsonResponse(users));

    const result = await api.users.list();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/users/",
      expect.objectContaining({ headers: expect.objectContaining({ "Content-Type": "application/json" }) }),
    );
    expect(result).toEqual(users);
  });

  it("get(id) calls GET /users/:id", async () => {
    const user = { id: "abc", name: "User" };
    mockFetch.mockReturnValueOnce(jsonResponse(user));

    const result = await api.users.get("abc");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/users/abc",
      expect.anything(),
    );
    expect(result).toEqual(user);
  });

  it("create() calls POST /users/", async () => {
    const newUser = { name: "New", phone: "123", city: "Vitória", role: "student" as const, password: "abc" };
    mockFetch.mockReturnValueOnce(jsonResponse({ id: "x", ...newUser }));

    await api.users.create(newUser);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/users/",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(newUser),
      }),
    );
  });

  it("delete() calls DELETE /users/:id", async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({ ok: true, status: 204, json: () => Promise.reject() }),
    );

    await api.users.delete("abc");

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/users/abc",
      expect.objectContaining({ method: "DELETE" }),
    );
  });
});

describe("api.auth", () => {
  it("login() posts credentials", async () => {
    const response = { token: "tok", user: { id: "1", role: "student" } };
    mockFetch.mockReturnValueOnce(jsonResponse(response));

    const result = await api.auth.login({ email: "a@b.com", password: "pass" });

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/users/login",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify({ email: "a@b.com", password: "pass" }),
      }),
    );
    expect(result.token).toBe("tok");
  });
});

describe("api.sessionRequests", () => {
  it("list() with params builds query string", async () => {
    mockFetch.mockReturnValueOnce(jsonResponse([]));

    await api.sessionRequests.list({ user_id: "u1", status: "submitted" });

    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("user_id=u1"),
      expect.anything(),
    );
    expect(mockFetch).toHaveBeenCalledWith(
      expect.stringContaining("status=submitted"),
      expect.anything(),
    );
  });

  it("list() without params calls clean URL", async () => {
    mockFetch.mockReturnValueOnce(jsonResponse([]));

    await api.sessionRequests.list();

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/session-requests/",
      expect.anything(),
    );
  });
});

describe("api.uploads", () => {
  it("upload() sends FormData with file", async () => {
    const file = new File(["pixels"], "photo.jpg", { type: "image/jpeg" });
    mockFetch.mockReturnValueOnce(jsonResponse({ url: "/api/v1/uploads/abc.jpg", filename: "abc.jpg" }));

    const result = await api.uploads.upload(file);

    expect(mockFetch).toHaveBeenCalledWith(
      "/api/v1/uploads/",
      expect.objectContaining({
        method: "POST",
        body: expect.any(FormData),
      }),
    );
    expect(result.url).toBe("/api/v1/uploads/abc.jpg");
  });
});

describe("ApiError", () => {
  it("throws ApiError on non-ok response", async () => {
    mockFetch.mockReturnValueOnce(
      Promise.resolve({
        ok: false,
        status: 404,
        json: () => Promise.resolve({ detail: "Not found" }),
      }),
    );

    await expect(api.users.get("nope")).rejects.toThrow("API 404");
  });
});
