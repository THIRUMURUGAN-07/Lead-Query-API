import { NextFunction, Request, Response } from "express";
import { AuthUser, UserRole } from "../types/auth";

const validRoles: UserRole[] = [
  "ADMIN",
  "MANAGER",
  "AGENT",
];

export const mockAuth = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const tenantId = req.headers["x-tenant-id"] as string | undefined;
  const userId = req.headers["x-user-id"] as string | undefined;
  const role = req.headers["x-role"] as UserRole | undefined;

  console.log("Received headers:", {
    tenantId,
    userId,
    role,
  });

  if (!tenantId || !userId || !role) {
    return res.status(401).json({
      message: "Missing authentication headers",
    });
  }

  if (!validRoles.includes(role)) {
    return res.status(403).json({
      message: "Invalid role",
    });
  }

  const user: AuthUser = {
    tenantId,
    userId,
    role,
  };

  req.user = user;

  next();
};