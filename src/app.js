import express from "express";
import connectDB from "./db/database.js";
import dotenv from "dotenv";

dotenv.config();

const app = express();

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB Connection failed!", error);
  });
