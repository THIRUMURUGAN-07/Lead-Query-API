import { describe, expect, it } from "vitest";

import { buildLeadFilterClause } from "../src/services/filters";

describe("buildLeadFilterClause", () => {
  it("should build a contain condition for a system text field", () => {
    const filters = [
      {
        fieldId: "name",
        fieldType: "string",
        condition: "contain",
        value: "Ram",
      },
    ];

    const result = buildLeadFilterClause(filters, 2);

    expect(result.conditions).toEqual([
      "name ILIKE $2",
    ]);

    expect(result.values).toEqual([
      "%Ram%",
    ]);

    expect(result.nextParamIndex).toBe(3);
  });

  it("should build a starts with condition for a system text field", () => {
    const filters = [
      {
        fieldId: "email",
        fieldType: "string",
        condition: "starts with",
        value: "ram",
      },
    ];

    const result = buildLeadFilterClause(filters, 1);

    expect(result.conditions).toEqual([
      "email ILIKE $1",
    ]);

    expect(result.values).toEqual([
      "ram%",
    ]);

    expect(result.nextParamIndex).toBe(2);
  });

  it("should build a followUpDate before condition", () => {
    const filters = [
      {
        fieldId: "followUpDate",
        fieldType: "date",
        condition: "before",
        value: "2026-09-01",
      },
    ];

    const result = buildLeadFilterClause(filters, 1);

    expect(result.conditions).toEqual([
      "follow_up_date < $1",
    ]);

    expect(result.values).toEqual([
      "2026-09-01",
    ]);

    expect(result.nextParamIndex).toBe(2);
  });

  it("should build an empty condition without adding a parameter", () => {
    const filters = [
      {
        fieldId: "assignedTo",
        fieldType: "string",
        condition: "is empty",
        value: "",
      },
    ];

    const result = buildLeadFilterClause(filters, 3);

    expect(result.conditions).toEqual([
      "(assigned_to IS NULL OR assigned_to = '')",
    ]);

    expect(result.values).toEqual([]);

    expect(result.nextParamIndex).toBe(3);
  });
});