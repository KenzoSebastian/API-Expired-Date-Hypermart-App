import { Expo } from "expo-server-sdk";

const expo = new Expo();

export const sendNotification = async (req, res) => {
  const { token, title, body, metaData } = req.body || { token: null, title: "", body: "", metaData: {} };
  if (!Expo.isExpoPushToken(token)) {
    return res.status(400).json({ status: "error", message: "Invalid Expo push token" });
  }

  const messages = {
    to: token,
    sound: "default",
    title,
    body,
    data: metaData || {},
  };

  try {
    const tickets = await expo.sendPushNotificationsAsync([messages]);
    res.status(200).json({
      status: "success",
      message: "Notification sent successfully",
      data: tickets[0],
    });
  } catch (error) {
    console.error("Error sending notification:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to send notification. Please try again later.",
      data: null,
    });
  }
};
