import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { ENV } from "./config/env.js";
import ProductRoute from "./route/products.js";

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

app.use("/", (req, res) => {
  res.status(404).json({ status: "ERROR", message: "Endpoint not found" });
});

app.listen(ENV.PORT, () => {
  console.log(`Server is running on port ${ENV.PORT}`);
});
