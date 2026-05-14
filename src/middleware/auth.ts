import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";

export type AuthenticatedRequest = Request & {
  auth?: {
    id: string;
    email: string;
    role: "admin" | "user";
  };
};

type JwtPayload = {
  sub: string;
  email: string;
  role: "admin" | "user";
};

function readBearerToken(req: Request) {
  const authHeader = req.headers.authorization;

  return authHeader?.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : undefined;
}

export function requireAdmin(req: Request, res: Response, next: NextFunction) {
  const token = readBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "Admin token is required" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "dev-secret"
    ) as JwtPayload;

    if (payload.role !== "admin") {
      return res.status(403).json({ message: "Admin access is required" });
    }

    (req as AuthenticatedRequest).auth = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid admin token" });
  }
}

export function requireUser(req: Request, res: Response, next: NextFunction) {
  const token = readBearerToken(req);

  if (!token) {
    return res.status(401).json({ message: "User token is required" });
  }

  try {
    const payload = jwt.verify(
      token,
      process.env.JWT_SECRET ?? "dev-secret"
    ) as JwtPayload;

    if (payload.role !== "user") {
      return res.status(403).json({ message: "User access is required" });
    }

    (req as AuthenticatedRequest).auth = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };

    return next();
  } catch {
    return res.status(401).json({ message: "Invalid user token" });
  }
}
