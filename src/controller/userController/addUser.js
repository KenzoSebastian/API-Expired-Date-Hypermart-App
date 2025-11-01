import { Expo } from "expo-server-sdk";
import { db } from "../../config/db.js";
import { users } from "../../db/schema.js";

export const addUser = async (req, res) => {
  const { userId, username, expoPushToken, email, memberSince, storeCode } = req.body;

  // Validate request body
  if (!userId || !username || !expoPushToken || !email || !memberSince || !storeCode) {
    return res
      .status(400)
      .json({ status: "error", message: "some fields are required.", data: null });
  }

  // Validate Expo Push Token
  if (!Expo.isExpoPushToken(expoPushToken)) {
    return res.status(400).json({ status: "error", message: "Invalid Expo Push Token.", data: null });
  }

  try {
    // Insert user into the database
    const newUser = await db
      .insert(users)
      .values({
        id: userId,
        username,
        expoPushToken,
        email,
        memberSince,
        storeCode,
      })
      .returning();

    return res.status(201).json({ status: "success", message: "User added successfully.", data: newUser });
  } catch (error) {
    console.error("Error adding user:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
