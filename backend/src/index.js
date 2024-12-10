import dotenv from "dotenv";
import app from "./app.js";
import connectDB from "./db/connection.js";

dotenv.config({
  path: "./.env",
});

const port = 5000 || process.env.PORT;

app.listen(port, () => {
  console.log(`Server listening on port http://localhost:${port}`);

  connectDB();
});

// handle graceful shutdown
process.on("SIGTERM", () => {
  process.exit(1);
});

process.on("SIGINT", () => {
  process.exit(1);
});

process.on("uncaughtException", (err) => {
  console.log("uncaughtException", err);
  process.exit(1);
});

process.on("unhandledRejection", (err) => {
  console.log("unhandledRejection", err);
  process.exit(1);
});
