import pool from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { encryptId } from "../utils/encryptedId.js";

export const createAdmin = async (req, res) => {
  try {
    const { admin_name, admin_username, admin_email, admin_password } =
      req.body;

    if (!admin_name || !admin_username || !admin_email || !admin_password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const hashedPassword = await bcrypt.hash(admin_password, 10);
    const rawId = crypto.randomUUID();
    const encryptedId = encryptId(rawId);

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        return res.status(500).send("Error connecting to database");
      }

      const sql = `
          INSERT INTO admins ( id, admin_name, admin_username, admin_email, admin_password ) 
          VALUES ( ?, ?, ?, ?, ? )
          `;

      connection.query(
        sql,
        [encryptedId, admin_name, admin_username, admin_email, hashedPassword],
        (err, result) => {
          connection.release();

          if (err) {
            console.log("Database error: ", err);
            return res.status(500).json({
              success: false,
              message: "Error creating new admin account",
            });
          }

          console.log("Admin added successfully");
          return res
            .status(201)
            .json({ success: true, message: "Admin created successfully" });
        }
      );
    });
  } catch (error) {
    console.error("Error in creating admin: ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const loginAdmin = async (req, res) => {
  try {
    const { admin_username, admin_password } = req.body;

    if (!admin_username || !admin_password) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection:", err);
        return res.status(500).send("Error connecting to database");
      }

      const sql = `
          SELECT * FROM admins WHERE admin_username = ? LIMIT 1
          `;

      connection.query(sql, [admin_username], async (err, result) => {
        connection.release();

        if (err) {
          console.log("Database error: ", err);
          return res.status(500).json({
            success: false,
            message: "Error connecting to the database",
          });
        }

        if (result.length === 0) {
          return res
            .status(401)
            .json({ success: false, message: "Invalid username or password" });
        }

        const admin = result[0];
        const isPasswordValid = await bcrypt.compare(
          admin_password,
          admin.admin_password
        );

        if (!isPasswordValid) {
          return res
            .status(401)
            .json({ success: false, message: "Invalid username or password" });
        }

        req.session.admin = {
          id: admin.id,
          name: admin.admin_name,
          username: admin.admin_username,
          email: admin.admin_email,
        };

        return res.status(200).json({
          success: true,
          message: "Login successful",
          admin: req.session.admin,
        });
      });
    });
  } catch (error) {
    console.error("Error logging in ", error);
    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  }
};

export const logoutAdmin = async (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error: ", err);
      return res
        .status(500)
        .json({ success: false, message: "Error logging out" });
    }

    return res.json({ success: true, message: "Logged out successfully" });
  });
};
