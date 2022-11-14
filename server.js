const app = require("./app");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

dotenv.config({ path: "./config.env" });

mongoose.connect(
  process.env.DB.replace("<password>", process.env.DBPASSWORD),
  () => console.log("DB connection successful")
);

app.listen(process.env.PORT, () =>
  console.log(`Listening on port ${process.env.PORT}`)
);
