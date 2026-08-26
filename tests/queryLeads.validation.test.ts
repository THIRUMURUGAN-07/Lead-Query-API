import { describe, expect, it } from "vitest";

import {
  queryParamsSchema,
  queryLeadsBodySchema,
} from "../src/validation/queryLeads";

describe("queryParamsSchema", () => {
  it("should accept valid query parameters", () => {
    const result = queryParamsSchema.safeParse({
      page: "1",
      limit: "20",
      sortBy: "createdAt",
      sortDirection: "asc",
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid sort field", () => {
    const result = queryParamsSchema.safeParse({
      sortBy: "name",
    });

    expect(result.success).toBe(false);
  });

  it("should reject an invalid sort direction", () => {
    const result = queryParamsSchema.safeParse({
      sortDirection: "invalid",
    });

    expect(result.success).toBe(false);
  });
});

describe("queryLeadsBodySchema", () => {
  it("should accept a valid filter", () => {
    const result = queryLeadsBodySchema.safeParse({
      filters: [
        {
          fieldId: "11111111-1111-1111-1111-111111111111",
          fieldType: "string",
          condition: "contain",
          value: "Chennai",
        },
      ],
    });

    expect(result.success).toBe(true);
  });

  it("should reject an invalid filter condition", () => {
    const result = queryLeadsBodySchema.safeParse({
      filters: [
        {
          fieldId: "11111111-1111-1111-1111-111111111111",
          fieldType: "string",
          condition: "invalid",
          value: "Chennai",
        },
      ],
    });

    expect(result.success).toBe(false);
  });
});