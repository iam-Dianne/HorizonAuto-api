import pool from "../config/db.js";
import bcrypt from "bcrypt";
import crypto from "crypto";
import { encryptId } from "../utils/encryptedId.js";

export const createNewRental = (req, res) => {
  const {
    renter_name,
    contact_number,
    email,
    car_id,
    start_date,
    end_date,
    initial_price,
  } = req.body;

  if (
    !renter_name ||
    !contact_number ||
    !email ||
    !car_id ||
    !start_date ||
    !end_date ||
    initial_price == null
  ) {
    return res.status(400).json({
      success: false,
      message: "All fields are required.",
    });
  }

  const rawIdCustomer = crypto.randomUUID();
  const encryptedIdCustomer = encryptId(rawIdCustomer);

  const rawIdRental = crypto.randomUUID();
  const encryptedIdRental = encryptId(rawIdRental);

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection: ", err);
      return res.status(500).send("Error connecting to database");
    }

    connection.beginTransaction((err) => {
      if (err) {
        connection.release();
        console.error("Error starting transaction:", err);
        return res.status(500).json({
          success: false,
          message: "Error starting transaction",
        });
      }

      const insertCustomerSql = `
        INSERT INTO customers (customer_uuid, customer_name, contact_number, email)
        VALUES (?, ?, ?, ?)
      `;

      connection.query(
        insertCustomerSql,
        [encryptedIdCustomer, renter_name, contact_number, email],
        (err, customerResult) => {
          if (err) {
            return connection.rollback(() => {
              connection.release();
              console.error("Error inserting customer:", err);
              res.status(500).json({
                success: false,
                message: "Error creating customer",
              });
            });
          }

          const customerId = customerResult.insertId;

          const insertRentalSql = `
            INSERT INTO rentals 
              (car_id, rental_uuid, customer_uuid, start_date, end_date, initial_price, status)
            VALUES (?, ?, ?, ?, ?, ?, 'booked')
          `;

          connection.query(
            insertRentalSql,
            [
              car_id,
              encryptedIdRental,
              encryptedIdCustomer,
              start_date,
              end_date,
              initial_price,
            ],
            (err, rentalResult) => {
              if (err) {
                return connection.rollback(() => {
                  connection.release();
                  console.error("Error inserting rental:", err);
                  res.status(500).json({
                    success: false,
                    message: "Error creating rental",
                  });
                });
              }

              connection.commit((err) => {
                if (err) {
                  return connection.rollback(() => {
                    connection.release();
                    console.error("Error committing transaction:", err);
                    res.status(500).json({
                      success: false,
                      message: "Error finalizing rental creation",
                    });
                  });
                }

                connection.release();

                res.status(201).json({
                  success: true,
                  message: "Rental created successfully!",
                  data: {
                    rentalId: rentalResult.insertId,
                    customerId,
                  },
                });
              });
            }
          );
        }
      );
    });
  });
};

export const getRentals = (req, res) => {
  const sql = "SELECT * FROM customer_rentals_view";

  pool.query(sql, (err, rows) => {
    if (err) {
      console.error("Cannot retrieve rentals.", err);
      return res.status(500).json({
        success: false,
        message: "Could not retrieve rentals",
      });
    }
    res.json({
      success: true,
      rentals: rows,
    });
  });
};

export const updateStatus = (req, res) => {
  const { rental_id, status } = req.body;

  pool.getConnection((err, connection) => {
    if (err) {
      console.error("Error getting connection: ", err);
      return res.status(500).send("Error connecting to database");
    }

    const sql = `
      UPDATE rentals
      SET status = ?
      WHERE rental_uuid = ?;
    `;

    connection.query(sql, [status, rental_id], (err, result) => {
      connection.release();

      if (err) {
        console.log("Database error: ", err);
        return res.status(500).json({
          success: false,
          message: "Error in updating rental status",
        });
      }

      console.log("Rental updated successfully");
      return res
        .status(201)
        .json({ success: true, message: "Rental updated successfully" });
    });
  });
};
