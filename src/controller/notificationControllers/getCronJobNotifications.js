import { axiosInstance } from "../../config/axios.js";

export const getCronJobNotifications = async (req, res) => {
  console.log("------------------------------------------------");
  console.log("Cron Job: Attempting to send automated notifications...");

  try {
    const { data: usersResponse } = await axiosInstance.get("/users");

    if (usersResponse.status !== "success" || !Array.isArray(usersResponse.data)) {
      console.warn("Failed to fetch user data or data format is invalid.");
      return res.status(500).json({ status: "error", message: "Failed to fetch users." });
    }

    const users = usersResponse.data;

    if (users.length === 0) {
      console.log("No users found. Skipping notification dispatch.");
      console.log("Cron job finished.");
      console.log("------------------------------------------");
      return res.status(200).json({ status: "success", message: "No users to notify." });
    }

    const notificationPromises = users.map(async (user) => {
      if (!user.expoPushToken || !user.expoPushToken.startsWith("ExponentPushToken[")) {
        console.warn(`Skipping user ${user.username || user.id}: Invalid notification token.`);
        return { status: "skipped", user: user.username || user.id, reason: "invalid_token" };
      }

      try {
        const { data: productCheckResult } = await axiosInstance.get("/products/check");

        if (productCheckResult.status !== "success") {
          console.warn(`Failed to retrieve product data for user ${user.username || user.id}.`);
          // It's good practice to return a specific failure object here as well
          return { status: "failed", user: user.username || user.id, reason: "product_data_fetch_failed" };
        }

        const { data: sendNotificationResponse } = await axiosInstance.post("/notification/send", {
          token: user.expoPushToken,
          title: productCheckResult.title,
          body: productCheckResult.message,
          metaData: productCheckResult.data,
        });

        if (
          sendNotificationResponse.status !== "success" ||
          !sendNotificationResponse.data ||
          !sendNotificationResponse.data.id
        ) {
          console.error(
            `Failed to send notification to ${user.username || user.id}:`,
            sendNotificationResponse
          );
          return { status: "failed", user: user.username || user.id, reason: "notification_send_failed" };
        }

        const notificationId = sendNotificationResponse.data.id;

        const { data: saveNotificationResponse } = await axiosInstance.post("notification/save", {
          id: notificationId,
          userId: user.id,
          title: productCheckResult.title,
          message: productCheckResult.message,
        });

        if (saveNotificationResponse.status === "success") {
          console.log("Notification successfully sent and saved for user:", user.username || user.id);
          return { status: "success", user: user.username || user.id, notificationId: notificationId };
        } else {
          console.error(
            `Failed to save notification for user ${user.username || user.id}:`,
            saveNotificationResponse
          );
          return { status: "failed", user: user.username || user.id, reason: "notification_save_failed" };
        }
      } catch (innerError) {
        console.error(
          `Error processing notification for user ${user.username || user.id}:`,
          innerError.message
        );
        if (innerError.response) {
          console.error("Inner Error Response Status:", innerError.response.status);
          console.error("Inner Error Response Data:", innerError.response.data);
        }
        return { status: "error", user: user.username || user.id, error: innerError.message };
      }
    });

    const results = await Promise.allSettled(notificationPromises);

    const successfulCount = results.filter(
      (r) => r.status === "fulfilled" && r.value && r.value.status === "success"
    ).length;
    const failedCount = results.filter(
      (r) => (r.status === "fulfilled" && r.value && r.value.status === "failed") || r.status === "rejected"
    ).length;
    const skippedCount = results.filter(
      (r) => r.status === "fulfilled" && r.value && r.value.status === "skipped"
    ).length;

    console.log(
      `Summary: ${successfulCount} notifications successful, ${failedCount} failed, ${skippedCount} skipped.`
    );

    return res.status(200).json({
      status: "success",
      message: "Cron job finished.",
      data: results.map((r) =>
        r.status === "fulfilled" ? r.value : { status: "rejected", reason: r.reason }
      ),
      summary: {
        successful: successfulCount,
        failed: failedCount,
        skipped: skippedCount,
        totalProcessed: users.length,
      },
    });
  } catch (error) {
    console.error("Failed to execute overall notification cron job:");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else if (error.request) {
      console.error("No response received from server for the main request:", error.request);
    } else {
      console.error("General Error Message:", error.message);
    }
    return res
      .status(500)
      .json({ status: "error", message: "Internal server error during cron job execution." });
  } finally {
    console.log("Cron job finished.");
    console.log("------------------------------------------");
  }
};
