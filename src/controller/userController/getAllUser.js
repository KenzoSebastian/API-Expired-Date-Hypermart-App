import { db } from "../../config/db.js";
import { users } from "../../db/schema.js";

export const getAllUser = async (req, res) => {
  try {
    const data = await db.select().from(users);
    return res.status(200).json({ status: "success", message: "Users retrieved successfully.", data });
  } catch (error) {
    console.error("Error retrieving users:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
