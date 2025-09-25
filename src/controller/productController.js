import { asc, count } from "drizzle-orm";
import * as xlsx from "xlsx";
import { db } from "../config/db.js";
import { products } from "../db/schema.js";
import { validateProductData } from "../helper/validate.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const productsQuery = db.select().from(products).orderBy(asc(products.expiredDate)).limit(limit).offset(offset);
    const totalProductsQuery = db.select({ total: count() }).from(products);

    const [paginatedProducts, totalResult] = await Promise.all([productsQuery, totalProductsQuery]);

    const totalItems = totalResult[0].total;

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      data: paginatedProducts,
      meta: { page, limit, totalItems, totalPages, hasNextPage, hasPrevPage },
    });
  } catch (error) {
    console.error("Error fetching products:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to fetch products. Please try again later.",
      data: null,
    });
  }
};

export const uploadProducts = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({
      status: "error",
      message: "No file uploaded. Please provide an Excel file.",
      data: null,
    });
  }

  try {
    const workbook = xlsx.read(req.file.buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const dataFromExcel = xlsx.utils.sheet_to_json(worksheet);

    if (dataFromExcel.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "The Excel file is empty or contains no data.",
        data: null,
      });
    }

    const processedData = dataFromExcel.map((item, index) => {
      const rowNumber = index + 2;
      const errors = [];

      // --- Validasi Data per Kolom ---
      const sjStmNumber = validateProductData(item["SJ : STM"], "SJ : STM", "string", errors);
      const skuNumber = validateProductData(item["SKU"], "SKU", "integer", errors);
      const description = validateProductData(item["DESCRIPTION"], "DESCRIPTION", "string", errors);
      const quantity = validateProductData(item["QTY_SCAN"], "QTY_SCAN", "number", errors);
      const expiredDateObj = validateProductData(item["Expired"], "Expired date", "date_ddmmyyyy", errors);
      const productInDateObj = validateProductData(item["product in date"], "Product in date", "date_ddmmyyyy", errors);
      if (errors.length > 0) {
        return {
          row: rowNumber,
          data: item,
          errors,
        };
      }

      return {
        sjStmNumber,
        skuNumber,
        description,
        quantity,
        expiredDate: expiredDateObj,
        createdAt: productInDateObj,
        updatedAt: productInDateObj,
      };
    });

    // Pisahkan data yang valid dari baris yang tidak valid
    const dataToInsert = processedData.filter((item) => !item.errors);
    const invalidRows = processedData.filter((item) => item.errors);

    if (dataToInsert.length === 0) {
      return res.status(400).json({
        status: "error",
        message: "No valid data found in the Excel file after validation.",
        details: invalidRows,
        data: null,
      });
    }

    const insertedProducts = await db.insert(products).values(dataToInsert).returning();

    let successMessage = `Successfully processed ${dataToInsert.length} product(s).`;
    if (invalidRows.length > 0) {
      successMessage += ` However, ${invalidRows.length} row(s) contained invalid data and were skipped.`;
    }

    res.status(200).json({
      status: "success",
      message: successMessage,
      data: insertedProducts,
      meta: {
        totalProcessed: dataToInsert.length,
        totalInvalid: invalidRows.length,
        invalidRowsDetails: invalidRows,
      },
    });
  } catch (error) {
    console.error("Error uploading products:", error);
    res.status(500).json({
      status: "error",
      message: `Failed to upload products due to an internal server error: ${error.message}`,
      data: null,
    });
  }
};
