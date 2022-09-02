const path = require('path');

const express = require("express");
const app = express();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("./db/userModel");
const Project = require("./db/projectModel");
const auth = require("./auth");
const sendEmail = require("./sendEmail");
const crypto = require("crypto");
require("dotenv").config({ path: "./server/config.env" });
const bcryptSalt = process.env.BCRYPT_SALT;

const cors = require('cors');
const PORT = process.env.PORT || 3001;

// Listen on port ??

  console.log(`_____Application is listening on port ${PORT}!`)




const corsOptions ={
     credentials:true,            //access-control-allow-credentials:true
     optionSuccessStatus:200
 }
 app.use(cors(corsOptions));
 
 
 // body parser configuration
 const bodyParser = require('body-parser');
 //app.use(bodyParser.json());
 //app.use(bodyParser.urlencoded({ extended: true }));
 //Bodyparser Middleware
 app.use(express.json())
 
 // require database connection 
const dbConnect = require("./db/dbConnect");
// execute database connection 
dbConnect();

// Have Node serve the files for our built React app
console.log("__dirname: "+__dirname); 
app.use(express.static(path.resolve(__dirname, '../client/build')));

// Handle GET requests to /api route
app.get("/api", (req, res) => {
    res.json({ message: "Hello from server!" });
  });

// inserisco le mie rotte

// Curb Cores Error by adding a header here
app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader(
      "Access-Control-Allow-Headers",    "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
    );
    res.setHeader(
      "Access-Control-Allow-Methods",    "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
   
    next();
  });
  
    // This help convert the id from string to ObjectId for the _id.
    const ObjectId = require("mongodb").ObjectId;
  
  // free endpoint
  app.get("/free-endpoint", (request, response) => {
    response.json({ message: "You are free to access me anytime" });
  });
  
  // authentication endpoint
  app.get("/auth-endpoint", auth, (request, response) => {
    response.json({ message: "You are authorized to access me" });
  });
  
  // register endpoint
  app.post("/register", async (request, response) => {
  
    // Get user input
    const {email, password } = request.body;
     // Validate user input
  
    if (!(email && password)) {
      return response.status(400).send({
        message: "All input is required",
      });
    }
  
     console.log("email: "+ email);   
     console.log("password: "+ password); 
  
    // check if user already exist
    //await User.findOne({ 'email' : email });
    const emailExists = await User.findOne({email: email});
   
  
      if (emailExists) {
      // console.log("UTENTE GIA ESISTENTE...: errore " + User);   
        return response.status(400).send({ message: "User Already Exist. Please Login",  });    
      }
      else { // se utente non esiste nel DB
  
       //Encrypt user password
    bcrypt.hash(request.body.password,  Number(bcryptSalt))
    .then((hashedPassword) => {
  
      const user = new User({
        email: request.body.email.toLowerCase(), // sanitize: convert email to lowercas
        password: hashedPassword,
        change_password : 0,
        type : "INT"
      });
  
       // save the new user
      user.save().then((result) => {
        response.status(201).send({
          message: "User Created Successfully",
          result,
        });
      })
  
       // catch error if the new user wasn't added successfully to the database
      .catch((error) => {
        response.status(500).send({
          message: "Error creating User, User wasn't added successfully to the database",
          error,
        });
      });
  })
   // catch error if the password hash isn't successful
    .catch((e) => {
      response.status(500).send({
        message: "Password was not hashed successfully",
        e,
      });
    });
  
    
      }//fine else su user
  });// end register endpoint
  
  
  // LOGIN endpoint
  app.post("/login", async (request, response) => {
  
    // Get user input
    const {email, password } = request.body;
     // Validate user input
     let project = null;
  
     if (!(email && password)) {
      return response.status(400).send({message: "All input is required", });
    }
    // console.log("email: "+ email); 
    // console.log("password: "+ password); 
  
      const user = await User.findOne({ "email": email });
  
      if (!user) { 
        return response.status(400).json({ message: "Email does not match" }); 
      }
  
      if (user.type ==="EXT"){
  
             project = await Project.findOne({ "email": email });
  
            if (!project) { 
              return response.status(400).json({ message: "Project does not match" }); 
            }
    }
  
     const isValid = await bcrypt.compare(password, user.password);
  
  
     if (!isValid) {
      return response.status(400).json({ message: "Passwords does not match"});
    }
  
          //   create JWT token
          const token = jwt.sign(
            {
              userId: user._id,
              userEmail: user.email,
            },
            "RANDOM-TOKEN",
            { expiresIn: "50m" } //24H 
          );
         // const date = new Date();
         // console.log(`Token Generated at:- ${date.getHours()} :${date.getMinutes()} :${date.getSeconds()}`);
  
          console.log("token: " + token);
  
          //   return success response
  
          if (user.type ==="EXT"){
        
            return response.status(200).send({ message: "Login Successful",  type: user.type, project: project._id,  token });
        
          }
           return response.status(200).send({ message: "Login Successful",  type: user.type,  token });
      
  })
  
  // INFO MONGO endpoint
  app.post("/info_mongo",  auth, async (request, response ) => {
  
    console.log("______sono in APP info_mongo_____"); 
  
   // Get user input
   const {customer} = request.body;
   const {project} = request.body;
   const {contesto} = request.body;
   const {email} = request.body;
   const {usecase} = request.body;
   const {user_logon} = request.body;
   const {projectarchitecture} = request.body;
   // Validate user input
  
  
  
  if (!customer || !project ||  !contesto || !email || !usecase || !user_logon || !projectarchitecture  ) { 
      console.log("______usecase == 0 NON VALIDO !!!!_____"); 
     return response.status(400).send({ message: "All input are required"});
  };
   
   //
  
  console.log("______FINITO CONTROLLO PARAMETRI_____"); 
  
  //costruisco Project
  const new_project = new Project({
    customer : customer,
    project : project,
    contesto : contesto, 
    email: email.toLowerCase(), // sanitize: convert email to lowercas
    usecase : usecase,
    user_logon : user_logon,
    projectarchitecture : projectarchitecture,
  
  });
  console.log("______FINITO COSTRUZIONE PROGETTO_____"); 
  
    // password temporanea
  var randomstring = Math.random().toString(36).slice(-8);
  console.log("______COSTRUZIONE randomstring PER LA MAIL_____"+ randomstring ); 
  const hash = await bcrypt.hash(randomstring, Number(bcryptSalt));
  
   // save the new user
   await new_project.save().then((result) => {
  
      //Invio mail al cliente
      const clientURL = process.env.CLIENT_URL;
      console.log("______COSTRUZIONE URL PER LA MAIL_____"+ clientURL ); 
    
      const link = `${clientURL}`;
      console.log("______COSTRUZIONE LINK PER LA MAIL_____"+ link ); 
          
          // Salvo nuovo utente
          const user = new User({
            email: email.toLowerCase(), 
            password: hash,
            change_password : 0,
            type : "EXT"
          });
      
           // save the new user
          user.save()
  
          console.log("______SALVO UTENTE_____" ); 
        
      sendEmail(
       // email,
       "michele.farinacci@mongodb.com", //////// deve essere cambiata !!!! SOLO PER TEST !!!!!!!!!!!!!!!!!!!!!!!!
        "Welcome to MongoDB Sizer",
        { name : request.body.email, 
          password: randomstring ,
          link : link
        },
      
        "/template/welcome_customer.handlebars"
      );
  
      console.log("______EMAIL A NUOVO UTENTE INVIATA_____" ); 
  
      response.status(201).send({ message: "Project Created Successfully and Email send to customer !",    result, }); 
  
  })
    .catch((error) => {
      console.log("______ERRORE IN PROJECT _______NON SALVATO_____" + error); 
      return response.status(400).send({ message: "Unable to save Project, details:" + error  });
    })
  
  // fine insert
    console.log("______FINE PROJECT_____");  
  
  })// fine get /info_mongo
  
  // PROJECT LIST endpoint
  app.get("/project_list", auth, async (request, response) => {
  
    console.log("______sono in APP PROJECT LIST QUERY_____"); 
  // prendo utente loggato
  
     const user_logon = request.query.user;
     console.log("user_logon: "+ user_logon); 
  
    // query for project that have same user ---> const query = { mongodb_user:  'pippo' };
    const query = {user_logon :user_logon };
    const options = {
      // sort returned documents in ascending order by title (A->Z)
      // sort: { customer: 1},
      // Include only the `title` and `imdb` fields in each returned document
      projection: { customer: 1, project: 1, usecase: 1 },
    };
              
    try{
      const list = await Project.find((query));
  
       console.log("______ PROJECT LIST______ fatta query, ottengo questo_____: " + list ); 
   
      response.status(200).json(list);
    //  response.json(list);
  
     }
     catch(error){
      response.status(400).json({message: error.message})
     }
   
  
  });
  
   // This section will help you get a single project by id
  app.get("/project_edit", auth, async (request, response) => {
   
  console.log("______sono in  APP PROJECT EDIT ID CHE ricevo _____"+ request.query.id); 
  
    let myquery = { _id: ObjectId( request.query.id )};
  
    try {
         //  const result =  await Project.find(query, options);
         const result =  await Project.findOne(myquery);
  
             console.log("______ PROJECT UPDATE fatta query, ottengo questo_____: " + result ); 
             
             return response.status(200).json(result);    
             
         }
        catch (err) {
                      console.log('_______SONO IN PROJECT UPDATE ERRROR__________', err)
                      response.status(400).json({message: error.message})
                    
                  }
    
  });
  
     // This section will help you update a record by id.
  app.put("/project_update", auth, (request, response) => {
     
   
    console.log("______SONO IN APP PROJECT UPDATE e ho ricevuto questo ID_____" + request.query.id); 
     
  /* DEBUG
        console.log("______sono in APP  PROJECT UPDATE PRSite = _____" + request.query.PRSite);
        console.log("______sono in APP  PROJECT UPDATE DRSite = _____" + request.query.DRSite);
        console.log("______sono in APP  PROJECT UPDATE PRStorage = _____" + request.query.PRStorage);
        console.log("______sono in APP  PROJECT UPDATE PRStorage = _____" + request.query.Atlas);
        console.log("______sono in APP  PROJECT UPDATE document_retention = _____" + request.query.document_retention);
        console.log("______sono in APP  PROJECT UPDATE document_retention_period = _____" + request.query.document_retention_period);
     */
  
        
       Project.findById(request.query.id, function(error, project) {
          if (!project)
          response.status(404).send("data is not found");
          else
             
              project.PRSite = request.query.PRSite;
              project.DRSite = request.query.DRSite;
              project.PRStorage = request.query.PRStorage;
              project.Atlas = request.query.Atlas;
              project.Architecture = request.query.Architecture;
    
              // document
              project.documents = request.query.documents;
              project.initial_data = request.query.initial_data;
              project.growth = request.query.growth;
              project.growthspec = request.query.growthspec;
              project.document_retention = request.query.document_retention;
              project.document_retention_period = request.query.document_retention_period;
    
              project.average_fields_documents = request.query.average_fields_documents;
              project.average_sizing_documents = request.query.average_sizing_documents;
  
              project.index_size = request.query.index_size;
              project.working_set = request.query.working_set;
  
              // CRUD
              project.total_insert  = request.query.total_insert;
              project.total_update  = request.query.total_update;
              project.total_query  = request.query.total_query;
              project.insert_per = request.query.insert_per;
              project.update_per  = request.query.update_per;
              project.query_per  = request.query.query_per;
              project.concurrent_write = request.query.concurrent_write;
              project.concurrent_write_details = request.query.concurrent_write_details;
              project.concurrent_read = request.query.concurrent_read;
              project.concurrent_read_details = request.query.concurrent_read_details;
                      
  
              project.save().then(project => {
                  response.json('Project updated!');
                // response.status(200).json({msg : "Project updated!"});
              })
              .catch(err => {
                response.status(400).json("Update not possible");
             
              });
      });
  
  
  
       
    });
  
   // This section will help you delete a record ProjectDelete
    app.delete("/project_delete", auth, async (request, response) => {
  
      console.log("______SONO IN PROJECT DELETE_______"+ request.query.id); 
  
      let myquery = { _id: ObjectId( request.query.id )};
  
  try{
    const delete_item = await Project.deleteOne((myquery));
  
     console.log("______ PROJECT DELETE___________: " + delete_item ); 
  
     response.json(delete_item);
  
   }
   catch(error){
    response.status(500).json({message: error.message})
   }
  
   });
  
  // requestPasswordReset endpoint
  app.post("/resetPasswordRequest", async (request, response) => {
  
    // Get email input
    const {email} = request.body;
     // Validate user input
  
    if (!(email)) {
      return response.status(400).send({ message: "Email is required",    });
    }
  
     console.log("email: "+ email);   
  
    // check if user already exist
    //await User.findOne({ 'email' : email });
    const user = await User.findOne({email: email});
   
      if (!user) {
        return response.status(400).send({ message: "Email does not exist",  });    
      }
    
    const hash = await bcrypt.hash(email, Number(bcryptSalt));
  
          // Store hash
          // setto la nuova password temporanea
          const update_password = await User.updateOne
          (
            { email: email }, { $set: { "change_password": hash } }
          )
  
          const clientURL = process.env.CLIENT_URL;
    
          const link = `${clientURL}/resetPassword?token=${hash}&id=${user._id}`;
       
          sendEmail(
           user.email,
           "Password Reset Request",
           {
             name: user.email,
             link: link,
           },
           //"./sizer/src/utils/template/requestResetPassword.handlebars"
           "/template/requestResetPassword.handlebars"
         );
  
  
        // return link;
        return response.status(200).send("Controlla la tua mail ");
      
  }); // end changepassword endpoint
  
  // resetPassword  endpoint
   app.get("/resetPassword" , async (request, response) => {
  
    console.log("ID: "+ request.query.id);   
    console.log("token: "+ request.query.token);   
    console.log("new_password: "+ request.query.new_password);   
  
  // prendo utente
     const utente = await User.findOne({ _id : ObjectId(request.query.id) , change_password : request.query.token });
  

  
        if (utente)
        {
                      
          try
           {
            //Encrypt new user password
         const hash = await bcrypt.hash(request.query.new_password, Number(bcryptSalt));
  
         const filter = { _id: request.query.id };
         const update = { password: hash };
         
                 // setto la nuova password 
                 let doc = await User.findOneAndUpdate(filter, update);
               
                 console.log("email: "+ doc.email);  
               
                 console.log("new password: "+ doc.password);  
  
  
                       if (!doc) {
                         return response.status(400).send({ message: "Error in save new password",  });
                       }
         
                         //   create JWT token
                         const token = jwt.sign(
                           {
                             userId: doc._id,
                             userEmail: doc.email,
                           },
                           "RANDOM-TOKEN",
                           { expiresIn: "50m" } //24H 
                         );
                       // const date = new Date();
                       // console.log(`Token Generated at:- ${date.getHours()} :${date.getMinutes()} :${date.getSeconds()}`);
         
                             console.log("token: " + token);
  
                             sendEmail(
                              doc.email,
                              "Password Reset Successfully",
                              {
                                name: doc.email,
                              },
                              "./template/resetPassword.handlebars"
                            );
         
                 //   return success response
                 response.status(200).send({ message: "Login Successful",  email: doc.email,  token });
              
                  
           }catch(error) 
           {
             console.log("errore : " + error);
             response.status(400).send({  message: "Passwords does not match", error  });
            // return response.status(400).json({ message: "Passwords does not match",   error});
           }
          }else
          {
           return response.status(400).send({message: "Passwords does not match"});
          }
     
        
       })// end ResetPassword endpoint
  
  
// fine mie rotte



  // All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
    res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
  });

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});