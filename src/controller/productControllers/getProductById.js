import { format } from "date-fns";
import { enUS } from "date-fns/locale";
import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { products } from "../../db/schema.js";

export const getProductById = async (req, res) => {
  const { id } = req.params;

  try {
    const product = await db.query.products.findFirst({
      where: eq(products.id, parseInt(id)),
    });

    if (!product) {
      return res.status(404).json({
        status: "error",
        message: "Product not found.",
        data: null,
      });
    }

    // date formatting
    product.expiredDate = format(product.expiredDate, "dd MMMM yyyy", { locale: enUS });
    product.createdAt = format(product.createdAt, "dd MMMM yyyy", { locale: enUS });
    product.updatedAt = format(product.updatedAt, "dd MMMM yyyy", { locale: enUS });

    return res.status(200).json({
      status: "success",
      message: "Product retrieved successfully.",
      data: product,
    });
  } catch (error) {
    console.error(`Error fetching product with ID '${id}':`, error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch product. Please try again later.",
      data: null,
    });
  }
};
