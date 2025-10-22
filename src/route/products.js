import express from "express";
import {
  getAllProducts,
  getProductById,
  getProductsByCategory,
  getProductsByquerySearch,
  uploadProducts,
} from "../controller/productController.js";
import multer from "multer";

const ProductRoute = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

ProductRoute.get("/", getAllProducts);

ProductRoute.get("/search", getProductsByquerySearch);

ProductRoute.get("/searchId/:id", getProductById);

ProductRoute.get("/categories/:productCategory", getProductsByCategory);

ProductRoute.post(
  "/uploadProducts",
  upload.single("excelFile"),
  uploadProducts
);

export default ProductRoute;
