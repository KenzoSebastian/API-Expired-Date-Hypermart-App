import { addDays, format } from "date-fns";
import { enUS } from "date-fns/locale";
import { asc, count } from "drizzle-orm";
import * as xlsx from "xlsx";
import { db } from "../config/db.js";
import { products } from "../db/schema.js";
import { fetchAndCountProducts } from "../helper/fetchAndCountProducts.js";
import { validateProductData } from "../helper/validate.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const offset = (page - 1) * limit;

    const productsQuery = db.select().from(products).orderBy(asc(products.expiredDate)).limit(limit).offset(offset);
    const totalProductsQuery = db.$count(products);

    const [paginatedProducts, totalItems] = await Promise.all([productsQuery, totalProductsQuery]);

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

export const getProductsByCategory = async (req, res) => {
  const { productCategory } = req.params;

  const todayStartOfDay = new Date();
  todayStartOfDay.setHours(0, 0, 0, 0);

  const sevenDaysFromNow = addDays(todayStartOfDay, 7);
  const fourteenDaysFromNow = addDays(todayStartOfDay, 14);

  const formatToday = format(todayStartOfDay, "yyyy-MM-dd", { locale: enUS });
  const formatSevenDays = format(sevenDaysFromNow, "yyyy-MM-dd", { locale: enUS });
  const formatFourteenDays = format(fourteenDaysFromNow, "yyyy-MM-dd", { locale: enUS });

  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const offset = (page - 1) * limit;

  let productsData = [];
  let totalItems = 0;
  let whereConditionFn = null;

  try {
    switch (productCategory) {
      case "expired":
        whereConditionFn = (product, { lt }) => lt(product.expiredDate, formatToday);
        break;
      case "expiringSoon":
        whereConditionFn = (product, { gte, lt, and }) =>
          and(gte(product.expiredDate, formatToday), lt(product.expiredDate, formatSevenDays));
        break;
      case "expiringLater":
        whereConditionFn = (product, { between }) => between(product.expiredDate, formatSevenDays, formatFourteenDays);
        break;
      case "goodProducts":
        whereConditionFn = (product, { gt }) => gt(product.expiredDate, formatFourteenDays);
        break;
      default:
        return res.status(400).json({
          status: "error",
          message: "Invalid product category provided.",
          data: null,
        });
    }

    if (whereConditionFn) {
      [productsData, totalItems] = await fetchAndCountProducts(whereConditionFn, limit, offset);
    } else {
      return res.status(400).json({
        status: "error",
        message: "No valid condition found for the product category.",
        data: null,
      });
    }

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    return res.status(200).json({
      status: "success",
      message: `Products in category '${productCategory}' retrieved successfully`,
      data: productsData,
      meta: {
        page,
        limit,
        totalItems,
        totalPages,
        hasNextPage,
        hasPrevPage,
      },
    });
  } catch (error) {
    console.error(`Error fetching products for category '${productCategory}':`, error);
    return res.status(500).json({
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
