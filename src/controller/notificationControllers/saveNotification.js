import { format, addHours } from "date-fns";
import { db } from "../../config/db.js";
import { notifications } from "../../db/schema.js";

export const saveNotification = async (req, res) => {
  const { id: notificationId, userId, productId, title, message } = req.body;

  if (!notificationId || !userId || !productId || !title || !message) {
    return res.status(400).json({ status: "error", message: "Some fields are required.", data: null });
  }
  const localeDate = addHours(new Date(), 7);

  try {
    const newNotification = await db
      .insert(notifications)
      .values({
        id: notificationId,
        userId,
        productId,
        title,
        message,
        createdAt: localeDate,
      })
      .returning();
    return res
      .status(201)
      .json({ status: "success", message: "Notification saved successfully.", data: newNotification });
  } catch (error) {
    console.error("Error saving notification:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
