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

router
  .route("/")
  .post(protect, addOrderItems)
  .get(protect, admin, getOrders);

router.route("/myorders").get(protect, getMyOrders);

router.route("/:id/status").put(protect, admin, updateOrderStatus);

export default router;