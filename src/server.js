import express from "express";
import "dotenv/config";
import { ENV } from "./config/env.js";

const app = express();
const PORT = ENV.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});
app.get("/api/testing", (req, res) => {
  res.status(200).json({ status: "OK", message: "ini ada testing route" });
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
