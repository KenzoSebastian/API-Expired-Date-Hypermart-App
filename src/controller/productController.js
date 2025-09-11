import { db } from "../config/db.js";
import { products } from "../db/schema.js";
import * as xlsx from "xlsx";

export const getAllProducts = async (req, res) => {
  try {
    const allproducts = await db.select().from(products);
    res.status(200).json({ status: "OK", data: allproducts });
  } catch (error) {
    console.error("Error fetching products:", error);
    res
      .status(500)
      .json({ status: "ERROR", message: "Failed to fetch products" });
  }
};

export const uploadProducts = async (req, res) => {
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
          skuNumber,
          description: item["DESCRIPTION"].trim(),
          quantity,
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

    res.status(200).json({
      message: `Sukses! ${dataToInsert.length} baris data berhasil diproses.`,
      data: dataToInsert,
    });
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).json({ message: `Terjadi kesalahan: ${error.message}` });
  }
};
