import express from "express";

import pool from "./db/client";
import { mockAuth } from "./middleware/auth";
import { buildLeadAccessCondition } from "./services/leadAccess";
import leadRoutes from "./routes/leadRoutes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Lead Query is running",
  });
});

app.get("/db-test", async (req, res) => {
  try {
    const result = await pool.query(
      "SELECT NOW() AS current_time"
    );

    res.json({
      message: "Database connected successfully",
      data: result.rows[0],
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Database connection failed",
    });
  }
});

app.get("/auth-test", mockAuth, (req, res) => {
  res.json({
    message: "Authentication successful",
    user: req.user,
  });
});

app.get("/leads-test", mockAuth, async (req, res) => {
  try {
    const access = buildLeadAccessCondition(
      req.user!,
      1
    );

    const query = `
      SELECT
        id,
        tenant_id,
        name,
        assigned_to,
        follow_up_date
      FROM leads
      WHERE ${access.conditions.join(" AND ")}
      ORDER BY name
    `;

    const result = await pool.query(
      query,
      access.values
    );

    res.json({
      count: result.rowCount,
      data: result.rows,
    });
  } catch (error) {
    console.error(error);

    res.status(500).json({
      message: "Failed to fetch leads",
    });
  }
});

/*
|--------------------------------------------------------------------------
| Lead Routes
|--------------------------------------------------------------------------
*/

app.use(
  "/api/v1/leads",
  leadRoutes
);

export default app;