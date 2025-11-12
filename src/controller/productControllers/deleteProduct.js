import { products } from "../../db/schema.js";
import { db } from "../../config/db.js";
import { eq } from "drizzle-orm";

export const deleteProduct = async (req, res) => {
  const { id } = req.body;

  try {
    const data = await db.delete(products).where(eq(products.id, id)).returning();
    return res.status(200).json({ status: "success", message: "Product deleted successfully.", data });
  } catch (error) {
    console.error("Error deleting product:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
