import { format } from "date-fns";
import { eq } from "drizzle-orm";
import { db } from "../../config/db.js";
import { products } from "../../db/schema.js";

export const updateQuantityProduct = async (req, res) => {
  const { id, quantity } = req.body;

  // Validate request body
  if (!id || !quantity) {
    return res
      .status(400)
      .json({ status: "error", message: "Product ID and quantity are required.", data: null });
  }

  try {
    const updatedUser = await db
      .update(products)
      .set({
        quantity,
        updatedAt: format(new Date(), "yyyy-MM-dd HH:mm:ss"),
      })
      .where(eq(products.id, id))
      .returning();

    return res
      .status(200)
      .json({ status: "success", message: "Product updated successfully.", data: updatedUser });
  } catch (error) {
    console.error("Error updating Product:", error);
    return res.status(500).json({ status: "error", message: "Internal server error.", data: null });
  }
};
