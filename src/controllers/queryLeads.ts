import { Request, Response } from "express";

import pool from "../db/client";
import { buildLeadAccessCondition } from "../services/leadAccess";
import { buildLeadFilterClause } from "../services/filters";
import {
  queryParamsSchema,
  queryLeadsBodySchema,
} from "../validation/queryLeads";

export const queryLeads = async (
  req: Request,
  res: Response
) => {
  try {
    // Validate query parameters
    const queryParamsResult =
      queryParamsSchema.safeParse(req.query);

    if (!queryParamsResult.success) {
      return res.status(400).json({
        message: "Invalid query parameters",
        errors: queryParamsResult.error.flatten(),
      });
    }

    // Validate request body
    const bodyResult =
      queryLeadsBodySchema.safeParse(req.body);

    if (!bodyResult.success) {
      return res.status(400).json({
        message: "Invalid request body",
        errors: bodyResult.error.flatten(),
      });
    }

    const {
      page,
      limit,
      sortBy,
      sortDirection,
    } = queryParamsResult.data;

    const {
      q,
      logic = "AND",
      filters = [],
    } = bodyResult.data;

    // Start with role-based access conditions
    const access = buildLeadAccessCondition(
      req.user!,
      1
    );

    const whereConditions = [
      ...access.conditions,
    ];

    const values: unknown[] = [
      ...access.values,
    ];

    let paramIndex = values.length + 1;

    // Free-text search
    if (q && q.trim() !== "") {
      whereConditions.push(`
        (
          leads.name ILIKE $${paramIndex}
          OR leads.email ILIKE $${paramIndex}
        )
      `);

      values.push(`%${q.trim()}%`);
      paramIndex++;
    }

    // Build filters
    if (filters.length > 0) {
      const filterResult =
        buildLeadFilterClause(
          filters,
          paramIndex
        );

      if (filterResult.conditions.length > 0) {
        whereConditions.push(
          `(${filterResult.conditions.join(
            ` ${logic} `
          )})`
        );

        values.push(...filterResult.values);

        paramIndex =
          filterResult.nextParamIndex;
      }
    }

    // Safe sorting map
    const sortColumns: Record<
      "createdAt" | "followUpDate",
      string
    > = {
      createdAt: "leads.created_at",
      followUpDate: "leads.follow_up_date",
    };

    const sortColumn = sortColumns[sortBy];

    // Pagination
    const offset = (page - 1) * limit;

    const query = `
      SELECT
        leads.id,
        leads.tenant_id,
        leads.user_id,
        leads.name,
        leads.phone,
        leads.country_code,
        leads.e164,
        leads.email,
        leads.assigned_to,
        leads.follow_up_date,
        leads.created_at,
        leads.updated_at
      FROM leads
      WHERE ${whereConditions.join(" AND ")}
      ORDER BY ${sortColumn} ${sortDirection.toUpperCase()} NULLS LAST
      LIMIT $${paramIndex}
      OFFSET $${paramIndex + 1}
    `;

    values.push(limit);
    values.push(offset);

    const result = await pool.query(
      query,
      values
    );

    const countQuery = `
      SELECT COUNT(*) AS total
      FROM leads
      WHERE ${whereConditions.join(" AND ")}
    `;

    const countValues = values.slice(0, -2);

    const countResult = await pool.query(
      countQuery,
      countValues
    );

    const total = Number(
      countResult.rows[0].total
    );

    return res.json({
      page,
      limit,
      count: result.rowCount,
      total,
      totalPages: Math.ceil(total / limit),
      hasNextPage: page * limit < total,
      hasPreviousPage: page > 1,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to query leads",
    });
  }
};