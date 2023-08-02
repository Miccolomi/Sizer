
//Import the mongoose module
const mongoose = require('mongoose');

// variabili
require("dotenv").config({ path: "./config.env" });

class Database { // Singleton
  connection = mongoose.connection;
  
  constructor() {
    try {
      this.connection
      .on('open', console.info.bind(console, 'Database connection: open'))
      .on('close', console.info.bind(console, 'Database connection: close'))
      .on('disconnected', console.info.bind(console, 'Database connection: disconnecting'))
      .on('disconnected', console.info.bind(console, 'Database connection: disconnected'))
      .on('reconnected', console.info.bind(console, 'Database connection: reconnected'))
      .on('fullsetup', console.info.bind(console, 'Database connection: fullsetup'))
      .on('all', console.info.bind(console, 'Database connection: all'))
      .on('error', console.error.bind(console, 'MongoDB connection: error:'));
    } catch (error) {
      console.error(error);
    }
  }

 // async connect(username, password, dbname) {
  async connect() {
    try {
      await mongoose.connect(
      //  `mongodb+srv://${username}:${password}@cluster0.2a7nn.mongodb.net/${dbname}?retryWrites=true&w=majority`,
      //  {
      //    useNewUrlParser: true,
      //    useUnifiedTopology: true
      //  }
      process.env.MONGODB_URI_LOCAL,
      );

      //console.log("Successfully connected to MongoDB database !"); 
      //console.log(`${connection.host} `)

    } catch (error) {
      console.error(error);
    }
  }

  async close() {
    try {
      await this.connection.close();
    } catch (error) {
      console.error(error);
    }
  }
}

module.exports = new Database();