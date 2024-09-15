import { z } from "zod";
import { db } from "../../db";

export const User = z.object({
  email: z
    .string({ message: "Email is required" })
    .email({ message: "Inavlid email format" }),
  password: z
    .string({ message: "Password is required" })
    .min(8, { message: "Password should be at least 8 characters long" }),
  firstName: z.string().optional(),
  lastName: z.string().optional(),
  createdAt: z.string().datetime().optional(),
  updatedAt: z.string().datetime().optional(),
});
export type TUser = z.infer<typeof User>;
export const Users = db.collection<TUser>("users");
