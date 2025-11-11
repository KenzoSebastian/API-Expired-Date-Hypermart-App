import { notifications } from "../../db/schema.js";
import { db } from "../../config/db.js";
import { eq } from "drizzle-orm";

export const updateSeenNotification = async (req, res) => {
  const { id } = req.body;

  if (!id) {
    return res.status(400).json({ status: "error", message: "ID is required.", data: null });
  }

  try {
    const updatedNotifications = await db
      .update(notifications)
      .set({ seen: true })
      .where(eq(notifications.id, id))
      .returning();

    return res.status(200).json({
      status: "success",
      message: "Notifications updated successfully.",
      data: updatedNotifications,
    });
  } catch (error) {
    console.error("Error updating notifications:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
