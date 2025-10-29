import { Expo } from "expo-server-sdk";
import { db } from "../../config/db.js";
import { users } from "../../db/schema.js";
import { eq } from "drizzle-orm";
import { format } from "date-fns";

export const updateExpoPushToken = async (req, res) => {
  const { userId, expoPushToken } = req.body;

  // Validate request body
  if (!userId || !expoPushToken) {
    return res
      .status(400)
      .json({ status: "error", message: "User ID and Expo Push Token are required.", data: null });
  }

  // Validate Expo Push Token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    return res.status(400).json({ status: "error", message: "Invalid Expo Push Token.", data: null });
  }
  try {
    // Update user in the database
    const updatedUser = await db
      .update(users)
      .set({
        expoPushToken,
        updatedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      })
      .where(eq(users.id, userId))
      .returning();

    return res
      .status(200)
      .json({ status: "success", message: "Expo Push Token updated successfully.", data: updatedUser });
  } catch (error) {
    console.error("Error updating Expo Push Token:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
