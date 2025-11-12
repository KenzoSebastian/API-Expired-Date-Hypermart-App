import express from "express";
import multer from "multer";
import { getAllProducts } from "../controller/productControllers/getAllProducts.js";
import { getProductsByquerySearch } from "../controller/productControllers/getProductsByQuerySearch.js";
import { getProductById } from "../controller/productControllers/getProductById.js";
import { getProductsByCategory } from "../controller/productControllers/getProductsByCategory.js";
import { uploadProducts } from "../controller/productControllers/uploadProducts.js";
import { getProductCheck } from "../controller/productControllers/getProductCheck.js";
import { updateQuantityProduct } from "../controller/productControllers/updateQuantityProduct.js";

const ProductRoute = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

ProductRoute.get("/", getAllProducts);

ProductRoute.get("/search", getProductsByquerySearch);

ProductRoute.get("/check", getProductCheck);

ProductRoute.get("/searchId/:id", getProductById);

ProductRoute.patch("/update/quantity", updateQuantityProduct);

ProductRoute.get("/categories/:productCategory", getProductsByCategory);

ProductRoute.post("/uploadProducts", upload.single("excelFile"), uploadProducts);

export default ProductRoute;
