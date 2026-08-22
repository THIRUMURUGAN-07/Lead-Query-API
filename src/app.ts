import express from "express";
import pool from "./db/client";

const app = express();

app.use(express.json());

app.get("/" ,(req, res) => {
        res.json({ message: "Lead Query is running" });
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


export default app;