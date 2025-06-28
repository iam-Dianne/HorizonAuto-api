import pool from "../config/db.js";

// CREATE NEW CAR
export const createNewService = async (req, res) => {
  try {
    const { service, service_price } = req.body;

    if (!service || !service_price) {
      return res.status(400).json({
        success: false,
        message: "All fields are required.",
      });
    }

    pool.getConnection((err, connection) => {
      if (err) {
        console.error("Error getting connection: ", err);
        return res.status(500).send("Error connecting to database");
      }

      const sql = `
        INSERT INTO re tal_services (service, service_price) 
        VALUES (?, ?)
      `;

      connection.query(sql, [service, service_price], (err, result) => {
        connection.release();

        if (err) {
          console.log("Database error: ", err);
          return res.status(500).json({
            success: false,
            message: "Error in creating new service",
          });
        }

        console.log("Service added successfully");
        return res
          .status(201)
          .json({ success: true, message: "Service created successfully" });
      });
    });
  } catch (error) {
    console.error("Error in creating new service: ", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
