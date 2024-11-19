import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { hash } from "bcrypt";
import * as z from "zod";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const userSchema = z.object({
    username: z.string().min(1, "Username is required").max(100),
    email: z.string().min(1, "Email is required").email("Invalid email"),
    password: z
      .string()
      .min(1, "Password is required")
      .min(8, "Password must have more than 8 characters"),
  });
  if (req.method === "POST") {
    try {
      const body =
        typeof req.body === "string" ? JSON.parse(req.body) : req.body;

      const { username, email, password } = userSchema.parse(body);
      if (!username || !email || !password) {
        return res.status(400).json({
          user: null,
          message: "All fields (username, email, password) are required",
        });
      }
      const existingUserByEmail = await db.Users.findUnique({
        where: { email },
      });
      if (existingUserByEmail) {
        return res.status(409).json({
          user: null,
          message: "Existing email",
        });
      }
      const existingUserByUsername = await db.Users.findUnique({
        where: { username },
      });
      if (existingUserByUsername) {
        return res.status(409).json({
          user: null,
          message: "Existing username",
        });
      }
      const hashedPassword = await hash(password, 10);
      const newUser = await db.Users.create({
        data: {
          username,
          email,
          password: hashedPassword,
        },
      });
      const { password: newPassword, ...rest } = newUser;
      return res.status(201).json({
        user: rest,
        message: "Success",
      });
    } catch (error) {
      console.error("Error during user creation:", error);
      return res.status(500).json({
        user: null,
        message: error.message || "Internal Server Error",
      });
    }
  } else {
    return res.status(405).json({ message: "Method Not Allowed" });
  }
}
