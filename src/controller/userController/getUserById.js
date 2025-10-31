import { eq } from "drizzle-orm";
import { users } from "../../db/schema.js";
import { db } from "../../config/db.js";

export const getUserById = async (req, res) => {
  const userId = req.params.id;
  try {
    const data = await db.select().from(users).where(eq(users.id, userId));
    return res.status(200).json({ status: "success", message: "User retrieved successfully.", data });
  } catch (error) {
    console.error("Error retrieving user:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
