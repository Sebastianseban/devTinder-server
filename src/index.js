
import { app } from "./app.js";
import connectDB from "./db/database.js";
import { PORT } from "./config/config.js";





connectDB()
  .then(() => {
    app.listen(PORT || 5000, () => {
      console.log(`server is running at port ${process.env.PORT}`);
    });
  })
  .catch((error) => {
    console.log("MONGODB Connection failed!", error);
  });
