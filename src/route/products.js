import express from "express";
import {
  getAllProducts,
  uploadProducts,
} from "../controller/productController.js";
import multer from "multer";

const ProductRoute = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

ProductRoute.get("/products", getAllProducts);

ProductRoute.post(
  "/uploadProducts",
  upload.single("excelFile"),
  uploadProducts
);

export default ProductRoute;
