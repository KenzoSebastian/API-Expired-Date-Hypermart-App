import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { asc, desc } from "drizzle-orm";
import { db } from "../../config/db.js";
import { products } from "../../db/schema.js";

export const getAllProducts = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const sortBy = req.query.sortby || "expiredDate";
    const order = req.query.order || "asc";
    const offset = (page - 1) * limit;

    const productsQuery =
      order === "asc"
        ? db.select().from(products).orderBy(asc(products[sortBy])).limit(limit).offset(offset)
        : order === "desc"
        ? db.select().from(products).orderBy(desc(products[sortBy])).limit(limit).offset(offset)
        : null;

    const totalProductsQuery = db.$count(products);

    const [paginatedProducts, totalItems] = await Promise.all([productsQuery, totalProductsQuery]);

    const totalPages = Math.ceil(totalItems / limit);
    const hasNextPage = page < totalPages;
    const hasPrevPage = page > 1;

    paginatedProducts.forEach((product) => {
      product.expiredDate = format(product.expiredDate, "dd MMMM yyyy", { locale: enUS });
      product.createdAt = format(product.createdAt, "dd MMMM yyyy", { locale: enUS });
      product.updatedAt = format(product.updatedAt, "dd MMMM yyyy", { locale: enUS });
    });

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
