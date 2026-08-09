import express from "express";
import multer from "multer";
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
} from "../controller/product.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { admin } from "../middlewares/admin.middleware.js";

const upload = multer({ dest: "uploads/" });

const router = express.Router();

// Get all products & Create a new product (Admin)
router
  .route("/")
  .get(getProducts)
  .post(protect, admin, upload.single("image"), createProduct);

// Get, Update & Delete product by ID
router
  .route("/:id")
  .get(getProductById)
  .put(protect, admin, upload.single("image"), updateProduct)
  .delete(protect, admin, deleteProduct);

export default router;