
const mongoose = require("mongoose");
require("dotenv").config({ path: "./config.env" });

async function dbConnect() {  

  // console.log("________variabile MONGODB_URI_LOCAL per debug: " + process.env.MONGODB_URI_LOCAL);

    // use mongoose to connect to database on mongoDB -  using the MONGODB_URI (connection string)
try{
  await mongoose.connect(    // process.env.MONGODB_URI,
                             process.env.MONGODB_URI_LOCAL,
                            { 
                            // useUnifiedTopology:true,    
                              useNewUrlParser: true, 
                              useUnifiedTopology: true,
                            // strictQuery: false,
                            } 
  
   
   
                        )
                            console.log("Successfully connected to MongoDB database !");
                            console.log(`${connection.host} `)
  }
  catch(error) {
 
    console.log(`ERRORE_______CHE REEROR_____-_____can not connect to database____, ${error}`); 
  };

}

module.exports = dbConnect;