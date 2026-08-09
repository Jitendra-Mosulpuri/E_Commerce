import express from "express";
import {
  addOrderItems,
  getMyOrders,
  getOrders,
  updateOrderStatus,
} from "../controller/order.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { admin } from "../middlewares/admin.middleware.js";

const router = express.Router();

// Create a new order & Get all orders (Admin)
router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

// Get logged-in user's orders
router.route("/myorders").get(protect, getMyOrders);

// Update order status (Admin)
router.route("/:id/status").put(protect, admin, updateOrderStatus);

export default router;