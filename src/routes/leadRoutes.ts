import { Router } from "express";

import { mockAuth } from "../middleware/auth";
import { queryLeads } from "../controllers/queryLeads";

const router = Router();

router.post(
  "/query",
  mockAuth,
  queryLeads
);

export default router;