import { createPool } from "mysql";

const pool = createPool({
  host: "127.0.0.1",
  user: "root",
  database: "horizon_db",
  password: "",
  connectionLimit: 100,
});

export default pool;
