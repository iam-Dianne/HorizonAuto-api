import express from "express";
import {
  createAdmin,
  loginAdmin,
  logoutAdmin,
} from "../controllers/adminController.js";
import { isAdminLoggedIn } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create-admin", createAdmin);
router.post("/admin-login", loginAdmin);
router.post("/admin-logout", logoutAdmin);

router.get("/dashboard", isAdminLoggedIn, (req, res) => {
  res.json({
    success: true,
    message: "Logged in as admin",
    admin: req.session.admin,
  });
});

export default router;
