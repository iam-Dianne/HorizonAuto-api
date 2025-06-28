import express from "express";
import {
  createNewRental,
  getRentals,
  updateStatus,
} from "../controllers/rentalController.js";

const router = express.Router();

router.post("/add-rental", createNewRental);
router.get("/", getRentals);
router.put("/update-status", updateStatus);

export default router;
