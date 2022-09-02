
const mongoose = require("mongoose");
require("dotenv").config({ path: "./server/config.env" });

async function dbConnect() { 

    // use mongoose to connect to database on mongoDB -  using the MONGODB_URI (connection string)
  mongoose
  .connect(
    process.env.MONGODB_URI,
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  ).then(() => {
    console.log("Successfully connected to MongoDB !");
   
  })
  .catch((error) => {
    console.log(`_____can not connect to database____, ${error}`);
  });

}

module.exports = dbConnect;