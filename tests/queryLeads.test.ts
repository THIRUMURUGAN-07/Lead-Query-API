import { beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";

// =========================
// MOCK DATABASE
// =========================

vi.mock("../src/db/client", () => ({
  default: {
    query: vi.fn(),
  },
}));

import pool from "../src/db/client";
import app from "../src/app";

// =========================
// TEST CONSTANTS
// =========================

const TENANT_ID =
  "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa";

const ADMIN_USER_ID =
  "a0000000-0000-0000-0000-000000000001";

const AGENT_USER_ID =
  "agent-user-123";

// =========================
// TEST SUITE
// =========================

describe("POST /api/v1/leads/query", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // =========================
  // AUTHENTICATION TESTS
  // =========================

  it("should reject a request without authentication headers", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query")
      .send({});

    expect(response.status).toBe(401);

    expect(response.body).toEqual({
      message: "Missing authentication headers",
    });
  });

  it("should reject a request with an invalid role", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", ADMIN_USER_ID)
      .set("x-user-role", "invalid")
      .send({});

    expect(response.status).toBe(403);

    expect(response.body).toEqual({
      message: "Invalid role",
    });
  });

  // =========================
  // VALIDATION TESTS
  // =========================

  it("should reject invalid query parameters", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query?sortBy=name")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", ADMIN_USER_ID)
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Invalid query parameters",
    );
  });

  it("should reject an invalid request body", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", ADMIN_USER_ID)
      .set("x-user-role", "admin")
      .send({
        filters: [
          {
            fieldId:
              "11111111-1111-1111-1111-111111111111",
            fieldType: "string",
            condition: "invalid condition",
            value: "Chennai",
          },
        ],
      });

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Invalid request body",
    );
  });

  // =========================
  // SUCCESS TESTS
  // =========================

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
        rowCount: 1,
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", ADMIN_USER_ID)
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      status: "success",
      message: "Leads fetched successfully",

      data: [
        {
          id: "lead-1",
          name: "Ram Kumar",
          email: "ram@example.com",
        },
      ],

      meta: {
        page: 1,
        limit: 20,
        totalRecords: 1,
        totalPages: 1,
        hasNextPage: false,
        hasPreviousPage: false,
      },
    });

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
        rowCount: 1,
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query?page=2&limit=2")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", ADMIN_USER_ID)
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

  // =========================
  // AGENT ACCESS TEST
  // =========================

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
        rowCount: 1,
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", AGENT_USER_ID)
      .set("x-user-role", "agent")
      .send({});

    expect(response.status).toBe(200);

    expect(pool.query).toHaveBeenCalledTimes(2);

    const firstQuery =
      vi.mocked(pool.query).mock.calls[0];

    expect(firstQuery[0]).toContain(
      "tenant_id = $1",
    );

    expect(firstQuery[0]).toContain(
      "assigned_to = $2",
    );

    expect(firstQuery[1]).toEqual([
      TENANT_ID,
      AGENT_USER_ID,
      20,
      0,
    ]);
  });

  // =========================
  // DATABASE ERROR TEST
  // =========================

  it("should return 500 when the database query fails", async () => {
    vi.mocked(pool.query).mockRejectedValueOnce(
      new Error("Database connection failed"),
    );

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", ADMIN_USER_ID)
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(500);

    expect(response.body).toEqual({
      message: "Failed to query leads",
    });
  });

  // =========================
  // SEARCH TEST
  // =========================

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
        rowCount: 1,
      } as any);

    const response = await request(app)
      .post("/api/v1/leads/query")
      .set("x-tenant-id", TENANT_ID)
      .set("x-user-id", ADMIN_USER_ID)
      .set("x-user-role", "admin")
      .send({
        q: "98765",
      });

    expect(response.status).toBe(200);

    const firstQuery =
      vi.mocked(pool.query).mock.calls[0];

    expect(firstQuery[0]).toContain(
      "leads.name ILIKE $2",
    );

    expect(firstQuery[0]).toContain(
      "leads.phone ILIKE $2",
    );

    expect(firstQuery[0]).toContain(
      "leads.email ILIKE $2",
    );

    expect(firstQuery[0]).toContain(
      "leads.e164 ILIKE $2",
    );

    expect(firstQuery[1]).toEqual([
      TENANT_ID,
      "%98765%",
      20,
      0,
    ]);
  });
});