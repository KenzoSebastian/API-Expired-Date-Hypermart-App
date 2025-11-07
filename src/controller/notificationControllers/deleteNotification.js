import { notifications } from "../../db/schema.js";
import { db } from "../../config/db.js";
import { eq } from "drizzle-orm";

export const deleteNotification = async (req, res) => {
  const { id } = req.params;

  try {
    const data = await db.delete(notifications).where(eq(notifications.id, id)).returning();
    return res.status(200).json({ status: "success", message: "Notifications deleted successfully.", data });
  } catch (error) {
    console.error("Error deleting notifications:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
