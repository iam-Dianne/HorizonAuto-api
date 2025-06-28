import express from "express";
import { createNewService } from "../controllers/servicesController.js";

const router = express.Router();

router.post("/add-service", createNewService);

export default router;
