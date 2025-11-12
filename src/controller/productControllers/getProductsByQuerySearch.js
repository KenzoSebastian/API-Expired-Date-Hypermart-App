import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { ilike } from "drizzle-orm";
import { db } from "../../config/db.js";
import { products } from "../../db/schema.js";

export const getProductsByquerySearch = async (req, res) => {
  try {
    const querySearch = req.query.searchQuery || null;
    const productsQuery = db
      .select()
      .from(products)
      .where(ilike(products.description, `%${querySearch}%`));

    const totalProductsQuery = db.$count(products);

    const [paginatedProducts, totalItems] = await Promise.all([productsQuery, totalProductsQuery]);

    paginatedProducts.forEach((product) => {
      product.expiredDate = format(product.expiredDate, "dd MMMM yyyy", { locale: enUS });
      product.createdAt = format(product.createdAt, "dd MMMM yyyy", { locale: enUS });
      product.updatedAt = format(product.updatedAt, "dd MMMM yyyy", { locale: enUS });
    });

    res.status(200).json({
      status: "success",
      message: "Products retrieved successfully",
      data: paginatedProducts,
      meta: { totalItems },
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
