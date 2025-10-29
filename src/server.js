import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./config/env.js";
import ProductRoute from "./route/products.js";
import NotificationRoute from "./route/notification.js";
import cron from "node-cron";
import axios from "axios";
import UserRoute from "./route/users.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();

// Middleware to parse JSON requests
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Endpoint untuk menyajikan halaman HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.use("/api/products", ProductRoute);
app.use("/api/notification", NotificationRoute);
app.use("/api/users", UserRoute);

app.use("/", (req, res) => {
  res.status(404).json({ status: "ERROR", message: "Endpoint not found" });
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);

  // cron.schedule("* * * * *", async () => {
  //   console.log("------------------------------------------------");
  //   console.log("Cron job: Mencoba mengirim notifikasi otomatis...");

  //   try {
  //     const response = await axios.post(`http://localhost:${ENV.PORT}/api/notification/send`, {
  //       token: ENV.EXPO_TOKEN,
  //       title: "Notifikasi Otomatis",
  //       body: "Ini adalah notifikasi otomatis yang dikirim setiap menit.",
  //       metaData: { info: "Data tambahan jika diperlukan" },
  //     });
  //     console.log("Notifikasi otomatis berhasil dikirim:", response.data);
  //   } catch (error) {
  //     console.error("Gagal mengirim notifikasi otomatis:");
  //     if (error.response) {
  //       // Server merespons dengan status error (e.g., 4xx, 5xx)
  //       console.error("Status:", error.response.status);
  //       console.error("Data:", error.response.data);
  //     } else if (error.request) {
  //       // Request dibuat tapi tidak ada respons
  //       console.error("Tidak ada respons dari server:", error.request);
  //     } else {
  //       // Ada yang salah saat menyiapkan request
  //       console.error("Pesan Error:", error.message);
  //     }
  //   }
  //   console.log("Cron job selesai.");
  //   console.log("------------------------------------------");
  // });
});
