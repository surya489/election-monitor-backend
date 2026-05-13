import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  const token = authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;

  if (!token) {
    return res.status(401).json({ message: "Admin token is required" });
  }

  try {
    jwt.verify(token, process.env.JWT_SECRET ?? "dev-secret");
    return next();
  } catch {
    return res.status(401).json({ message: "Invalid admin token" });
  }
}
