import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { asc } from "drizzle-orm";
import * as xlsx from "xlsx";
import { db } from "../config/db.js";
import { products } from "../db/schema.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    const paginatedProducts = await db
      .select()
      .from(products)
      .orderBy(asc(products.expiredDate))
      .limit(limit)
      .offset(offset);

    res.status(200).json({
      status: "OK",
      data: paginatedProducts,
      meta: {
        page: page,
        limit: limit,
      },
    });
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

        const arrayExpiredDate = item["Expired"].split("-");
        if (arrayExpiredDate.length !== 3) {
          console.warn(
            `Peringatan: Baris ke-${
              index + 2
            } di Excel dilewati karena tanggal kadaluarsa tidak valid.`
          );
          return null;
        }

        const productInDateRaw = item["product in date"];
        const productInDateFormat = format(
          new Date(productInDateRaw),
          "dd-MMMM-yyyy",
          {
            locale: enUS,
          }
        );

        return {
          sjStmNumber: item["SJ : STM"],
          skuNumber,
          description: item["DESCRIPTION"].trim(),
          quantity,
          expiredDate: item["Expired"],
          createdAt: productInDateFormat,
          updatedAt: productInDateFormat,
        };
      })
      .filter(Boolean);

    if (dataToInsert.length === 0) {
      return res
        .status(400)
        .send("Tidak ada data valid yang bisa dimasukkan setelah validasi.");
    }

    await db.insert(products).values(dataToInsert);

    res.status(200).json({
      message: `Sukses! ${dataToInsert.length} baris data berhasil diproses.`,
      data: dataToInsert,
    });
  } catch (error) {
    console.error("Terjadi kesalahan:", error);
    res.status(500).json({ message: `Terjadi kesalahan: ${error.message}` });
  }
};
