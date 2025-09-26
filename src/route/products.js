import express from "express";
import {
  getAllProducts,
  getProductsByCategory,
  uploadProducts,
} from "../controller/productController.js";
import multer from "multer";

const ProductRoute = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

ProductRoute.get("/products", getAllProducts);

ProductRoute.get("/productCategories/:productCategory", getProductsByCategory);

ProductRoute.post(
  "/uploadProducts",
  upload.single("excelFile"),
  uploadProducts
);

export default ProductRoute;
