import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt, { type SignOptions } from "jsonwebtoken";
import { Admin } from "../models/Admin.js";
import { User } from "../models/User.js";
import { requireUser, type AuthenticatedRequest } from "../middleware/auth.js";

export const authRouter = Router();

function createToken(
  subject: string,
  email: string,
  role: "admin" | "user",
  expiresIn: SignOptions["expiresIn"] = "8h"
) {
  return jwt.sign(
    { sub: subject, email, role },
    process.env.JWT_SECRET ?? "dev-secret",
    { expiresIn }
  );
}

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await Admin.findOne({ email: email.toLowerCase() });
    const isValid =
      admin && (await bcrypt.compare(password, admin.passwordHash));

    if (!isValid) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = createToken(admin._id.toString(), admin.email, "admin");

    return res.json({
      token,
      admin: {
        id: admin._id.toString(),
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.post("/signup", async (req, res, next) => {
  try {
    const { name, email, password } = req.body as {
      name?: string;
      email?: string;
      password?: string;
    };

    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      passwordHash,
    });
    const token = createToken(user._id.toString(), user.email, "user", "30d");

    return res.status(201).json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      return res.status(409).json({ message: "Email is already registered" });
    }

    return next(error);
  }
});

authRouter.post("/user-login", async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase() });
    const isValid =
      user && (await bcrypt.compare(password, user.passwordHash));

    if (!isValid) {
      return res.status(401).json({ message: "Invalid user credentials" });
    }

    const token = createToken(user._id.toString(), user.email, "user", "30d");

    return res.json({
      token,
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
});

authRouter.get("/me", requireUser, async (req, res, next) => {
  try {
    const auth = (req as AuthenticatedRequest).auth;
    const user = await User.findById(auth?.id).select("name email");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.json({
      user: {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    return next(error);
  }
});
