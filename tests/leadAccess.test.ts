import { describe, expect, it } from "vitest";

import { buildLeadAccessCondition } from "../src/services/leadAccess";
import { AuthUser } from "../src/types/auth";

describe("buildLeadAccessCondition", () => {
  it("should allow owner to access all leads in their tenant", () => {
    const user: AuthUser = {
      tenantId: "tenant-123",
      userId: "user-123",
      role: "owner",
    };

    const result = buildLeadAccessCondition(user, 1);

    expect(result.conditions).toEqual([
      "tenant_id = $1",
    ]);

    expect(result.values).toEqual([
      "tenant-123",
    ]);
  });

  it("should allow admin to access all leads in their tenant", () => {
    const user: AuthUser = {
      tenantId: "tenant-123",
      userId: "user-123",
      role: "admin",
    };

    const result = buildLeadAccessCondition(user, 1);

    expect(result.conditions).toEqual([
      "tenant_id = $1",
    ]);

    expect(result.values).toEqual([
      "tenant-123",
    ]);
  });

  it("should allow manager to access all leads in their tenant", () => {
    const user: AuthUser = {
      tenantId: "tenant-123",
      userId: "user-123",
      role: "manager",
    };

    const result = buildLeadAccessCondition(user, 1);

    expect(result.conditions).toEqual([
      "tenant_id = $1",
    ]);

    expect(result.values).toEqual([
      "tenant-123",
    ]);
  });

  it("should allow agent to access only assigned leads in their tenant", () => {
    const user: AuthUser = {
      tenantId: "tenant-123",
      userId: "user-123",
      role: "agent",
    };

    const result = buildLeadAccessCondition(user, 1);

    expect(result.conditions).toEqual([
      "tenant_id = $1",
      "assigned_to = $2",
    ]);

    expect(result.values).toEqual([
      "tenant-123",
      "user-123",
    ]);
  });
});