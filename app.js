import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import session from "express-session";
import adminRoutes from "./routes/adminRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import rentalRoutes from "./routes/rentalRoutes.js";
import serviceRoutes from "./routes/serviceRoutes.js";
import { isAdminLoggedIn } from "./middlewares/authMiddleware.js";

const app = express();
dotenv.config();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  })
);

// session middleweare
app.use(
  session({
    secret: process.env.SESSION_KEY, // replace with something secure
    resave: false,
    saveUninitialized: false,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/admin", adminRoutes);
app.use("/cars", isAdminLoggedIn, carRoutes);
app.use("/rentals", isAdminLoggedIn, rentalRoutes);
app.use("/services", isAdminLoggedIn, serviceRoutes);

export default app;
