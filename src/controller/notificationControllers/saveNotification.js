import { db } from "../../config/db.js";
import { notifications } from "../../db/schema.js";

export const saveNotification = async (req, res) => {
  const { id, userId, title, message } = req.body;
  try {
    const newNotification = await db.insert(notifications).values({ id, userId, title, message }).returning();
    return res
      .status(201)
      .json({ status: "success", message: "Notification saved successfully.", data: newNotification });
  } catch (error) {
    console.error("Error saving notification:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
