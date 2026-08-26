import { beforeEach, describe, expect, it, vi } from "vitest";

import request from "supertest";

// Mock the PostgreSQL pool
vi.mock("../src/db/client", () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from "../src/db/client";
import app from "../src/app";

describe("POST /api/v1/leads/query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should reject a request without authentication headers", async () => {
    const response = await request(app).post("/api/v1/leads/query").send({});

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Missing authentication headers",
    });
  });

  it("should reject a request with an invalid role", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "a0000000-0000-0000-0000-000000000001")
      .set("x-user-role", "invalid")
      .send({});

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      message: "Invalid role",
    });
  });

  it("should reject invalid query parameters", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query?sortBy=name")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "a0000000-0000-0000-0000-000000000001")
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Invalid query parameters");
  });

  it("should reject an invalid request body", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "a0000000-0000-0000-0000-000000000001")
      .set("x-user-role", "admin")
      .send({
        filters: [
          {
            fieldId: "11111111-1111-1111-1111-111111111111",
            fieldType: "string",
            condition: "invalid condition",
            value: "Chennai",
          },
        ],
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe("Invalid request body");
  });

  it("should return leads for a valid request", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [
          {
            id: "lead-1",
            name: "Ram Kumar",
            email: "ram@example.com",
          },
        ],
        rowCount: 1,
      } as any)
      .mockResolvedValueOnce({
        rows: [
          {
            total: "1",
          },
        ],
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "a0000000-0000-0000-0000-000000000001")
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      status: "success",
      message: "Leads fetched successfully",

      meta: {
        page: 1,
        limit: 20,
        totalRecords: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

    expect(response.body.data).toEqual([
      {
        id: "lead-1",
        name: "Ram Kumar",
        email: "ram@example.com",
      },
    ]);

    expect(pool.query).toHaveBeenCalledTimes(2);
  });
  it("should return correct pagination metadata", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [
          {
            id: "lead-2",
            name: "Test Lead",
          },
        ],
        rowCount: 1,
      } as any)
      .mockResolvedValueOnce({
        rows: [
          {
            total: "5",
          },
        ],
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query?page=2&limit=2")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "a0000000-0000-0000-0000-000000000001")
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      status: "success",
      message: "Leads fetched successfully",

      meta: {
        page: 2,
        limit: 2,
        totalRecords: 5,
        totalPages: 3,
        hasNextPage: true,
        hasPreviousPage: true,
      },
    });

    expect(pool.query).toHaveBeenCalledTimes(2);
  });
  it("should apply agent access restrictions", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      } as any)
      .mockResolvedValueOnce({
        rows: [
          {
            total: "0",
          },
        ],
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "agent-user-123")
      .set("x-user-role", "agent")
      .send({});

    expect(response.status).toBe(200);

    expect(pool.query).toHaveBeenCalledTimes(2);

    const firstQuery = vi.mocked(pool.query).mock.calls[0];

    expect(firstQuery[0]).toContain("tenant_id = $1");

    expect(firstQuery[0]).toContain("assigned_to = $2");

    expect(firstQuery[1]).toEqual([
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "agent-user-123",
      20,
      0,
    ]);
  });
  it("should return 500 when the database query fails", async () => {
    vi.mocked(pool.query).mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "a0000000-0000-0000-0000-000000000001")
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      message: "Failed to query leads",
    });
  });
  it("should search across name, phone, email, and e164", async () => {
    vi.mocked(pool.query)
      .mockResolvedValueOnce({
        rows: [],
        rowCount: 0,
      } as any)
      .mockResolvedValueOnce({
        rows: [
          {
            total: "0",
          },
        ],
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa")
      .set("x-user-id", "a0000000-0000-0000-0000-000000000001")
      .set("x-user-role", "admin")
      .send({
        q: "98765",
      });

    expect(response.status).toBe(200);

    const firstQuery = vi.mocked(pool.query).mock.calls[0];

    expect(firstQuery[0]).toContain("leads.name ILIKE $2");

    expect(firstQuery[0]).toContain("leads.phone ILIKE $2");

    expect(firstQuery[0]).toContain("leads.email ILIKE $2");

    expect(firstQuery[0]).toContain("leads.e164 ILIKE $2");

    expect(firstQuery[1]).toEqual([
      "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      "%98765%",
      20,
      0,
    ]);
  });
});
