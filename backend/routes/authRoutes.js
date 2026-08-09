import express from "express"
import { registerUser,loginUser,getUsers } from "../controller/auth.controller.js";
import { protect } from "../middlewares/auth.middleware.js";
import { admin } from "../middlewares/admin.middleware.js";

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/user",protect,admin,getUsers);

export default router;