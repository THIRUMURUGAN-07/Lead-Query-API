import { beforeEach, describe, expect, it, vi, } from "vitest";

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
      .set(
        "x-tenant-id",
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      )
      .set(
        "x-user-id",
        "a0000000-0000-0000-0000-000000000001"
      )
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
      .set(
        "x-tenant-id",
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      )
      .set(
        "x-user-id",
        "a0000000-0000-0000-0000-000000000001"
      )
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(400);

    expect(response.body.message).toBe(
      "Invalid query parameters"
    );
  });

  it("should reject an invalid request body", async () => {
    const response = await request(app)
      .post("/api/v1/leads/query")
      .set(
        "x-tenant-id",
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      )
      .set(
        "x-user-id",
        "a0000000-0000-0000-0000-000000000001"
      )
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

    expect(response.body.message).toBe(
      "Invalid request body"
    );
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
      .set(
        "x-tenant-id",
        "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa"
      )
      .set(
        "x-user-id",
        "a0000000-0000-0000-0000-000000000001"
      )
      .set("x-user-role", "admin")
      .send({});

    expect(response.status).toBe(200);

    expect(response.body).toMatchObject({
      page: 1,
      limit: 20,
      count: 1,
      total: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
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
});