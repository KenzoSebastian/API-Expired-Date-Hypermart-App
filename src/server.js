import express from "express";
import "dotenv/config";
import { ENV } from "./config/env.js";
import job from "./config/cron.js";

const app = express();
const PORT = ENV.PORT || 3000;

if (ENV.NODE_ENV === "production") job.start();

// Middleware to parse JSON requests
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
