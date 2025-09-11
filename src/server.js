import express from "express";
import multer from "multer";
import * as xlsx from "xlsx";
import { ENV } from "./config/env.js";
import { db } from "./config/db.js";
import { products } from "./db/schema.js";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = ENV.PORT || 3000;

// Middleware to parse JSON requests
app.use(express.json());

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.get("/api/health", (req, res) => {
  res.status(200).json({ status: "OK", message: "Server is healthy" });
});

// Endpoint untuk menyajikan halaman HTML
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

app.get("/api/products", async (req, res) => {
  try {
    const allproducts = await db.select().from(products);
    res.status(200).json({ status: "OK", data: allproducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ status: "ERROR", message: "Failed to fetch products" });
  }
});

app.post(
  "/api/uploadProducts",
  upload.single("excelFile"),
  async (req, res) => {
    if (!req.file) {
      return res.status(400).send("Tidak ada file yang di-upload.");
    }

    try {
      const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
      const sheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[sheetName];
      const dataFromExcel = xlsx.utils.sheet_to_json(worksheet);

      if (dataFromExcel.length === 0) {
        return res.status(400).send("File Excel kosong atau tidak ada data.");
      }

      const dataToInsert = dataFromExcel
        .map((item, index) => {
          const rawSku = item["SKU"];
          const rawQuantity = item["QTY_SCAN"];

          if (!rawSku) {
            console.warn(
              `Peringatan: Baris ke-${
                index + 2
              } di Excel dilewati karena SKU kosong.`
            );
            return null;
          }

          const skuNumber = parseInt(rawSku, 10);
          const quantity = parseFloat(rawQuantity);

          if (isNaN(skuNumber) || isNaN(quantity)) {
            console.warn(
              `Peringatan: Baris ke-${
                index + 2
              } di Excel dilewati karena SKU atau Kuantitas bukan angka.`
            );
            return null;
          }

          return {
            sjStmNumber: item["SJ : STM"],
            skuNumber: skuNumber,
            description: item["DESCRIPTION"],
            quantity: quantity,
            expiredDate: item["Expired"],
          };
        })
        .filter(Boolean);

      if (dataToInsert.length === 0) {
        return res
          .status(400)
          .send("Tidak ada data valid yang bisa dimasukkan setelah validasi.");
      }

      // await db.insert(products).values(dataToInsert);

      res
        .status(200)
        .json({
          message: `Sukses! ${dataToInsert.length} baris data berhasil diproses.`,
          data: dataToInsert,
        });
    } catch (error) {
      console.error("Terjadi kesalahan:", error);
      res.status(500).json({ message: `Terjadi kesalahan: ${error.message}` });
    }
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
