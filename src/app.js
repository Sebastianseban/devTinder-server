import express from "express";
import connectDB from "./db/database.js";
import dotenv from "dotenv";
import { json } from "express";
import { User } from "./models/user.model.js";

dotenv.config();

const app = express();

app.use(json());

app.post("/signup", async(req, res) => {
  const userData = req.body;

  try {
    const user = new User(userData)

    await user.save()

    res.status(200).send("user created",user)


    
  } catch (error) {
      res.status(400).send("Error saving the user:" + error.message);
  }
});
app.post("/login", async(req, res) => {
  const userData = req.body;

  try {
   

    const users = await User.find({})

    res.status(200).send("user created",users)


    
  } catch (error) {
      res.status(400).send("Error saving the user:" + error.message);
  }
});

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 5000, () => {
      console.log(`server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB Connection failed!", error);
  });
