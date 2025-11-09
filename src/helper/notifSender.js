import cron from "node-cron";
import { json } from "stream/consumers";
import { axiosInstance } from "../config/axios.js";

export const notifSender = () =>
  cron.schedule("* * * * *", async () => {
    console.log("------------------------------------------------");
    console.log("Cron job: Mencoba mengirim notifikasi otomatis...");

    try {
      const { data: usersResponse } = await axiosInstance.get("/users");

      if (usersResponse.status !== "success" || !Array.isArray(usersResponse.data)) {
        console.warn("Gagal mengambil data user atau format data tidak sesuai.");
        return;
      }

      const users = usersResponse.data;

      if (users.length === 0) {
        console.log("Tidak ada user ditemukan. Melewati pengiriman notifikasi.");
        console.log("Cron job selesai.");
        console.log("------------------------------------------");
        return;
      }

      const notificationPromises = users.map(async (user) => {
        if (!user.expoPushToken || !user.expoPushToken.startsWith("ExponentPushToken[")) {
          console.warn(`Melewati user ${user.username || user.id}: Token notifikasi tidak valid.`);
          return { status: "skipped", user: user.username || user.id, reason: "invalid_token" };
        }

        try {
          const { data: productCheckResult } = await axiosInstance.get("/products/check");

          if (productCheckResult.status !== "success") {
            console.warn("Gagal mengambil data produk.");
            return;
          }

          const { data: sendNotifResponse } = await axiosInstance.post("/notification/send", {
            token: user.expoPushToken,
            title: productCheckResult.title,
            body: productCheckResult.message,
            metaData: productCheckResult.data,
          });

          if (
            sendNotifResponse.status !== "success" ||
            !sendNotifResponse.data ||
            !sendNotifResponse.data.id
          ) {
            console.error(`Gagal mengirim notifikasi ke ${user.username || user.id}:`, sendNotifResponse);
            return { status: "failed", user: user.username || user.id, reason: "send_failed" };
          }

          const notificationId = sendNotifResponse.data.id;

          const { data: saveNotifResponse } = await axiosInstance.post("notification/save", {
            id: notificationId,
            userId: user.id,
            title: productCheckResult.title,
            message: productCheckResult.message,
          });

          if (saveNotifResponse.status === "success") {
            console.log("Notifikasi berhasil dikirim dan disimpan untuk user:", user.username || user.id);
            return { status: "success", user: user.username || user.id, notificationId: notificationId };
          } else {
            console.error(
              `Gagal menyimpan notifikasi untuk user ${user.username || user.id}:`,
              saveNotifResponse
            );
            return { status: "failed", user: user.username || user.id, reason: "save_failed" };
          }
        } catch (innerError) {
          console.error(
            `Error saat memproses notifikasi untuk user ${user.username || user.id}:`,
            innerError.message
          );
          return { status: "error", user: user.username || user.id, error: innerError.message };
        }
      });

      const results = await Promise.allSettled(notificationPromises);

      const successfulCount = results.filter(
        (r) => r.status === "fulfilled" && r.value.status === "success"
      ).length;
      const failedCount = results.filter(
        (r) => (r.status === "fulfilled" && r.value.status === "failed") || r.status === "rejected"
      ).length;
      const skippedCount = results.filter(
        (r) => r.status === "fulfilled" && r.value.status === "skipped"
      ).length;

      console.log(
        `Ringkasan: ${successfulCount} notifikasi berhasil, ${failedCount} gagal, ${skippedCount} dilewati.`
      );
    } catch (error) {
      console.error("Gagal menjalankan cron job notifikasi keseluruhan:");
      if (error.response) {
        console.error("Status:", error.response.status);
        console.error("Data:", error.response.data);
      } else if (error.request) {
        console.error("Tidak ada respons dari server untuk request utama:", error.request);
      } else {
        console.error("Pesan Error Umum:", error.message);
      }
    }
    console.log("Cron job selesai.");
    console.log("------------------------------------------");
  });
