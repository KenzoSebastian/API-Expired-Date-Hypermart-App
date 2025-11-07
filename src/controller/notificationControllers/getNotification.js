import { notifications } from "../../db/schema.js";
import { db } from "../../config/db.js";
import { eq } from "drizzle-orm";

export const getNotifications = async (req, res) => {
  const { userId } = req.params;

  try {
    const data = await db.select().from(notifications).where(eq(notifications.userId, userId));
    return res
      .status(200)
      .json({ status: "success", message: "Notifications retrieved successfully.", data });
  } catch (error) {
    console.error("Error retrieving notifications:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
