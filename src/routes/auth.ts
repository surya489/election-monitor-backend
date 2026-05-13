import { Router } from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma.js";

export const authRouter = Router();

authRouter.post("/login", async (req, res, next) => {
  try {
    const { email, password } = req.body as {
      email?: string;
      password?: string;
    };

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    const admin = await prisma.admin.findUnique({ where: { email } });
    const isValid =
      admin && (await bcrypt.compare(password, admin.passwordHash));

    if (!isValid) {
      return res.status(401).json({ message: "Invalid admin credentials" });
    }

    const token = jwt.sign(
      { sub: admin.id, email: admin.email, role: "admin" },
      process.env.JWT_SECRET ?? "dev-secret",
      { expiresIn: "8h" }
    );

    return res.json({
      token,
      admin: {
        id: admin.id,
        email: admin.email,
        name: admin.name,
      },
    });
  } catch (error) {
    return next(error);
  }
});
