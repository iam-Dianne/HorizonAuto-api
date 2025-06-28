import express from "express";
import {
  createNewCar,
  deleteCar,
  fetchSingleCar,
  getCars,
  updateCar,
} from "../controllers/carController.js";

const router = express.Router();

router.post("/add-car", createNewCar);
router.get("/", getCars);
router.delete("/:id", deleteCar);
router.get("/:id", fetchSingleCar);
router.put("/:id", updateCar);

export default router;
