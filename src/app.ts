import express from "express";

import leadRoutes from "./routes/leadRoutes";

const app = express();

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Lead Query is running",
  });
});

app.use(
  "/api/v1/leads",
  leadRoutes
);

export default app;