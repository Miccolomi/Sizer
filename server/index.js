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

const EMAIL_DEV = process.env.EMAIL_DEV;

// Listen on port ??

console.log(`_____Application is listening on port ${PORT}!`)


const corsOptions = {
  credentials: true,            //access-control-allow-credentials:true
  optionSuccessStatus: 200
}
app.use(cors(corsOptions));


// body parser configuration
const bodyParser = require('body-parser');
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({ extended: true }));

//Bodyparser Middleware
app.use(express.json())


/////DB///////////////

// require database connection 
const Database = require("./db/dbConnect");

// execute database connection 

Database.connect();
/*
try{
  dbConnect.dbConnect();
}
catch{

  res.json({ message: "Not Connect to MongoDB " });

}
*/

// Have Node serve the files for our built React app
// console.log("__dirname: " + __dirname);
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
    "Access-Control-Allow-Headers", "Origin, X-Requested-With, Content, Accept, Content-Type, Authorization"
  );
  res.setHeader(
    "Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS"
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
  const { email, password } = request.body;
  // Validate user input

  if (!(email && password)) {
    return response.status(400).send({
      message: "All input is required",
    });
  }

 // console.log("email: " + email);
 // console.log("password: " + password);

  // check if user already exist
  //await User.findOne({ 'email' : email });
  const emailExists = await User.findOne({ email: email });


  if (emailExists) {
    // console.log("UTENTE GIA ESISTENTE...: errore " + User);   
    return response.status(400).send({ message: "User Already Exist. Please Login", });
  }
  else { // se utente non esiste nel DB

    //Encrypt user password
    bcrypt.hash(request.body.password, Number(bcryptSalt))
      .then((hashedPassword) => {

        const user = new User({
          email: request.body.email.toLowerCase(), // sanitize: convert email to lowercas
          password: hashedPassword,
          change_password: 0,
          type: "INT"
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
              message: "Error creating User, User wasn't added successfully to the database: " + error,
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
  const { email, password } = request.body;
  // Validate user input
  let project = null;

  if (!(email && password)) {
    return response.status(400).send({ message: "All input is required", });
  }
  // console.log("email: "+ email); 
  // console.log("password: "+ password); 

  const user = await User.findOne({ "email": email });

  if (!user) {
    return response.status(400).json({ message: "Email does not match" });
  }

  if (user.type === "EXT") {

    project = await Project.findOne({ "email": email });

    if (!project) {
      return response.status(400).json({ message: "Project does not match" });
    }
  }

  const isValid = await bcrypt.compare(password, user.password);


  if (!isValid) {
    return response.status(400).json({ message: "Passwords does not match" });
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

  if (user.type === "EXT") {

    return response.status(200).send({ message: "Login Successful", type: user.type, email: user.email, project: project._id, token });

  }
  return response.status(200).send({ message: "Login Successful", type: user.type, email: user.email,  token });

})

//  ------------------------------------------------------------ce la tua mail di prova devi cambiarla !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// INFO MONGO endpoint
app.post("/info_mongo", auth, async (request, response) => {

  console.log("______sono in index.js function info_mongo_____");

  // Get user input
  const { customer } = request.body;
  const { project } = request.body;
  const { contesto } = request.body;
  let { email } = request.body;
  const { sendemail } = request.body;
  const { usecase } = request.body;
  const { user_logon } = request.body;
  const { projectarchitecture } = request.body;
  // Validate user input

  if (!customer || !project || !contesto || !email || !usecase || !user_logon || !projectarchitecture) {
    console.log("______usecase == 0 NON VALIDO !!!!_____");
    return response.status(400).send({ message: "All input are required" });
  };

  console.log("______FINITO CONTROLLO PARAMETRI_____");

  //costruisco Project
  const new_project = new Project({
    customer: customer,
    project: project,
    contesto: contesto,
    email: email,
    usecase: usecase,
    user_logon: user_logon,
    projectarchitecture: projectarchitecture,

  });
  console.log("______FINITO COSTRUZIONE PROGETTO_____");

  // password temporanea
  var randomstring = Math.random().toString(36).slice(-8);
  console.log("______COSTRUZIONE password randomstring PER LA MAIL da inviare al cliente_____: " + randomstring);
  const hash = await bcrypt.hash(randomstring, Number(bcryptSalt));

  // DEVO CONTRLLARE LA MAIL DEL CLIENTE SE ESISTE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! 
  const userexist = await User.findOne({ "email": email, "type": "EXT" }); //Salvo il cliente sole se non esiste !!! altrimenti non lo salvo !!!!

  // save the new project
  await new_project.save().then((result) => {

    id_progetto = result.id;
    console.log("______ID DEL PROGETTO SALVATO_____" + id_progetto); // importante da mettere ovunque

    //Invio mail al cliente
    const clientURL = process.env.CLIENT_URL;
   // console.log("______COSTRUZIONE URL PER LA MAIL A CLIENTE _____" + clientURL);

    const link = `${clientURL}`;
   // console.log("______COSTRUZIONE LINK PER LA MAIL A CLIENTE_____" + link);

    const email_for_send = process.env.EMAIL_DEV; // se sono in sviluppo prendo questa altrimenti prende quella reale !!!!!!!!!!!
    

    if (email_for_send){ // qui prendo quella di test...
      email = email_for_send; 
      console.log("______EMAIL DI TEST PER INVIO_____" + email);
    } 
    else { // in produzione e prendo la vera mail...
      email = email;
      console.log("______EMAIL DI PRODUZIONE PER INVIO_____" + email);
    }

    
    if (!userexist) { //  una mail può avere + progetti associati
   
      console.log("______UTENTE NON ESISTE. LO CREO_____" );
      // Salvo nuovo utente - cliente ESTERNO 
      
      
    const user = new User({
      email: email,
      password: hash,
      change_password: 0,
      type: "EXT",
    //  id_prj: id_progetto,
    });

    // save the new user
    user.save()
    console.log("______SALVO NUOVO UTENTE_____");

    if(sendemail){ // se ho fleggato invio della mail

    sendEmail(
      email,
      "Welcome to MongoDB Sizer",
      {
        name: request.body.email,
        password: randomstring,
        link: link
      },

      "/template/welcome_customer.handlebars"
    );

    console.log("______EMAIL A NUOVO UTENTE INVIATA_____");

    }

    response.status(201).send({ message: "Project Created Successfully !", result});

    }
    else{ // quindi cliente è gia registrato e non lo devo salvare 2 volte..
      console.log("______UTENTE ESISTE. NON LO CREO_____" );

      if(sendemail){
      sendEmail(
        email,
        "Welcome back to MongoDB Sizer",
        {
          name: request.body.email,
          link: link
        },
  
        "/template/new_project_for_you.handlebars"
      );
  
      console.log("______EMAIL A UTENTE ESISTENTE INVIATA_____");
      }
      response.status(201).send({ message: "Project Created Successfully and Email send to customer !", result });

    }
    
 
  })
    .catch((error) => {
      console.log("______ERRORE NEL SALVATAGGIO DEL PROGETTO_PROGETTO_NON SALVATO_____: " + error);
      return response.status(400).send({ message: "Unable to save Project, details: " + error });
    })

  // fine insert
  console.log("______FINE PROJECT_____");

})// fine get /info_mongo

// PROJECT LIST INTERNO endpoint
app.post("/project_list_int", auth, async (request, response) => {

  console.log("______sono in APP PROJECT LIST INT QUERY_____");
  // prendo utente loggato

  const user_logon = request.query.user;
  console.log("user_logon che è arrivato da web: " + user_logon);


  //Chi mi sta chiamando interno
  const query_mongo = { user_logon: user_logon }; 
  
  let list = null;


  try {
     list = await Project.find(query_mongo);

      console.log("______ PROJECT LIST INT fatta query, ottengo questo_____: " + list);
      return response.status(201).json(list);
   // return response.status(201).send( JSON.stringify(list) );
   
  
  }
  catch (error) {
    console.log('_______SONO IN PROJECT EDIT ERRROR__________', error);
    response.status(400).json({ message: error.message });
  }


});

// PROJECT LIST EXTERNAL endpoint
app.post("/project_list_ext", auth, async (request, response) => {

  console.log("______sono in APP PROJECT LIST EXT QUERY_____");
  // prendo utente loggato

  const user_logon = request.query.user;
  console.log("user_logon che è arrivato da web: " + user_logon);


  //Chi mi sta chiamando interno o esterno ?
  const query_mongo = { user_logon: user_logon }; // questo nel caso io sia un SA mongodb
  const query_ext = { email: user_logon }; // questo nel caso io sia un esterno

  let list = null;
  //const options = {
  // sort returned documents in ascending order by title (A->Z)
  // sort: { customer: 1},
  // Include only the `title` and `imdb` fields in each returned document
  //  projection: { customer: 1, project: 1, usecase: 1 }, 
  //};

  try {
     list = await Project.find(query_mongo);

    if (list.length>0) {

      console.log("______ PROJECT LIST__ MI HA CHIAMATO UN SA ____ fatta query, ottengo questo_____: " + list);
      return response.status(201).json(list);
   // return response.status(201).send( JSON.stringify(list) ); // per capire chi è utente lo faccio tramite lo status code !!!!!!!!
   
    
    }
    else{
       list = await Project.find(query_ext);
      console.log("______ PROJECT LIST__ MI HA CHIAMATO UN EXT ____ fatta query, ottengo questo_____: " + list);
     return response.status(200).json(list);
    // return response.status(202).send( JSON.stringify(list) ); // per capire chi è utente lo faccio tramite lo status code !!!!!!!!

    }

   

  }
  catch (error) {
    console.log('_______SONO IN PROJECT EDIT ERRROR__________', error);
    response.status(400).json({ message: error.message });
  }


});

// This section will help you get a single project by id
app.get("/project_edit", auth, async (request, response) => {

  console.log("______sono in  APP PROJECT EDIT ID CHE ricevo _____" + request.query.id);

  let myquery = { _id: ObjectId(request.query.id) };

  try {
    //  const result =  await Project.find(query, options);
    const result = await Project.findOne(myquery);

    console.log("______ PROJECT UPDATE fatta query, ottengo questo_____: " + result);

    return response.status(200).json(result);

  }
  catch (err) {
    console.log('_______SONO IN PROJECT UPDATE ERRROR__________', err)
    response.status(400).json({ message: err.message })

  }

});

// This section will help you update a record by id.
app.put("/project_update", auth, async (request, response) => {


  console.log("______SONO IN APP PROJECT UPDATE e ho ricevuto questo ID_____" + request.query.id);


   try {

     // create a filter 
     const filter =  {"_id": ObjectId(request.query.id)};


    // create a document that sets new value
    const updateDoc = {
      $set: {

        PRSite : request.query.PRSite,
        DRSite : request.query.DRSite,
        PRStorage : request.query.PRStorage,
        Atlas : request.query.Atlas,
        Architecture : request.query.Architecture,
    
        // document
        documents : request.query.documents,
        initial_data : request.query.initial_data,
        growth : request.query.growth,
        growthspec : request.query.growthspec,
        document_retention : request.query.document_retention,
        document_retention_period : request.query.document_retention_period,
    
        average_fields_documents : request.query.average_fields_documents,
        average_sizing_documents : request.query.average_sizing_documents,
    
        index_size : request.query.index_size,
        working_set : request.query.working_set,
    
        // CRUD
        total_insert : request.query.total_insert,
        total_update : request.query.total_update,
        total_query : request.query.total_query,
        total_delete : request.query.total_delete,
        insert_per : request.query.insert_per,
        update_per : request.query.update_per,
        query_per : request.query.query_per,
        delete_per : request.query.delete_per,
        concurrent_write : request.query.concurrent_write,
        concurrent_write_details : request.query.concurrent_write_details,
        concurrent_read : request.query.concurrent_read,
        concurrent_read_details : request.query.concurrent_read_details
      },
    };

    const result = await Project.updateOne(filter, updateDoc);
    console.log(
      `${result.matchedCount} document(s) matched the filter, updated ${result.modifiedCount} document(s)`,
    );
   // response.json('Project updated!');
   response.json(`Success updated ${result.modifiedCount} document`);

  } catch (err) {
    console.error(err.message);
    response.status(404).send("data is not found");
  }

  /* DEBUG
        console.log("______sono in APP  PROJECT UPDATE PRSite = _____" + request.query.PRSite);
        console.log("______sono in APP  PROJECT UPDATE DRSite = _____" + request.query.DRSite);
        console.log("______sono in APP  PROJECT UPDATE PRStorage = _____" + request.query.PRStorage);
        console.log("______sono in APP  PROJECT UPDATE PRStorage = _____" + request.query.Atlas);
        console.log("______sono in APP  PROJECT UPDATE document_retention = _____" + request.query.document_retention);
        console.log("______sono in APP  PROJECT UPDATE document_retention_period = _____" + request.query.document_retention_period);
     */


});

// This section will help you delete a record ProjectDelete
app.delete("/project_delete", auth, async (request, response) => {

  console.log("______SONO IN PROJECT DELETE_______" + request.query.id);

  let myquery = { _id: ObjectId(request.query.id) };

  try {
    const delete_item = await Project.deleteOne((myquery));

    console.log("______ PROJECT DELETE___________: " + delete_item);

    response.json(delete_item);

  }
  catch (error) {
    response.status(500).json({ message: error.message })
  }

});

// requestPasswordReset endpoint
app.post("/resetPasswordRequest", async (request, response) => {

  // Get email input
  const { email } = request.body;
  // Validate user input

  if (!(email)) {
    return response.status(400).send({ message: "Email is required", });
  }

  console.log("email: " + email);

  // check if user already exist
  //await User.findOne({ 'email' : email });
  const user = await User.findOne({ email: email });

  if (!user) {
    return response.status(400).send({ message: "Email does not exist", });
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
app.get("/resetPassword", async (request, response) => {

  console.log("ID: " + request.query.id);
  console.log("token: " + request.query.token);
  console.log("new_password: " + request.query.new_password);

  // prendo utente
  const utente = await User.findOne({ _id: ObjectId(request.query.id), change_password: request.query.token });



  if (utente) {

    try {
      //Encrypt new user password
      const hash = await bcrypt.hash(request.query.new_password, Number(bcryptSalt));

      const filter = { _id: request.query.id };
      const update = { password: hash };

      // setto la nuova password 
      let doc = await User.findOneAndUpdate(filter, update);

      console.log("email: " + doc.email);

      console.log("new password: " + doc.password);


      if (!doc) {
        return response.status(400).send({ message: "Error in save new password", });
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
      response.status(200).send({ message: "Login Successful", email: doc.email, token , type: doc.type});


    } catch (error) {
      console.log("errore : " + error);
      response.status(400).send({ message: "Passwords does not match", error });
      // return response.status(400).json({ message: "Passwords does not match",   error});
    }
  } else {
    return response.status(400).send({ message: "Passwords does not match" });
  }


})// end ResetPassword endpoint

//UTILIT

app.post("/_getData", async (request, response)=> {

  let myquery = { _id: ObjectId(request.query.id) };

  try {

    const result = await Project.findOne(myquery);
  
    //console.log("______ getProjectData fatta query, ottengo questo_____: " + result);
  
    return response.status(200).json(result);
  }
  catch (err) {
    console.log('_______SONO IN _getData ERRROR__________', err)
    response.status(400).json({ message: err.message })
  
  }
  


})// end

app.post("/_getUserType", async (request, response)=> {

    //Chi mi sta chiamando ?
    const query_mongo = { email: request.query.user_email }; 
    const who =  User.find(query_mongo);
  try {

  
    const who =  await User.findOne(query_mongo);
  
    console.log("______ _getUserType ottengo questo_____: " + who.type);
  
    return response.status(200).json({message: who.type});
  }
  catch (err) {
    console.log('_______SONO IN _getUserType ERRROR__________', err)
   return response.status(400).json({ message: err.message })
  
  }
  


})// end

//FINE UTILI


//requests to the CREATE Google Sheets via API
app.post("/create_spreadsheets", async (request, response) => {

  console.log("______sono in NODE create_spreadsheets NOOOOOOOOOOOOO DA CANCELLARE !!!!!!!!!!_____");

// id del progetto 
  let myquery = { _id: ObjectId(request.query.id) };

  const valueInputOption = "USER_ENTERED";
  const fs = require('fs').promises;
  const path = require('path');
  const process = require('process');
  const { authenticate } = require('@google-cloud/local-auth');
  const { google } = require('googleapis');

  const client_id = "477691067534-eq6l07e0eqhie1748qo2adackfr5muj8.apps.googleusercontent.com";
  const client_secret = "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";

  // If modifying these scopes, delete token.json.
  
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = path.join(process.cwd(), 'token.json');
  const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials_google_sheet.json');

  var URL_FILE="";
  let spreadsheetId; // quello di google
  let spreadsheetId_DB; // quello di mongo
  let exist;

//  authorize().then(create).catch(console.error);


  const CreaExcel = async () => {

    // 1) mi autentico
    const auth = await authorize();
    console.log("_____ create_spreadsheets sono autorizzato _____");
    // 2) prendo i dati del progetto dal db
    const data = await getProjectData(myquery);
    console.log("_____ create_spreadsheets ho i dati _____");

    spreadsheetId_DB = data._doc.spreadsheetId; // mi prendo lo spreadsheetId dal DB  POTREI NON TROVARLO SE è la prima volta 
    console.log("_____ create_spreadsheets id nel DB: _____"+spreadsheetId_DB);

    let docTitle = data._doc.customer +" - "+data._doc.project ; // mi prendo lo spreadsheetId dal DB ma mi serve ??????
    console.log("_____ create_spreadsheets docTitle: _____"+data._doc.customer +" - "+data._doc.project );

       // creo array da scivere sul file
       const array = await makeArray(data._doc);
       console.log("_____ create_spreadsheets ho creato array da scrivere: _____");
    
    if(spreadsheetId_DB){// è presente in Mongo 
                        
                        // se si, è presente in G drive,
                        try{ 
                          exist = await checkIfIdSheetExistonGoogle(auth, spreadsheetId_DB);
                          console.log("_____ create_spreadsheets exist on Google ?: _____ "+exist);
                        }
                        catch (e) {
                          console.error(e);
                          response.status(400).json({ message: e.message })
                      } 

      
                                                                                                  if(exist)
                                                                                                  {  //se si non lo creo e faccio solo update
                                                                                                    try{ 
                                                                                                          const update = await updateValues(spreadsheetId_DB, valueInputOption, array, auth);
                                                                                                          console.log('%d cells updated.', update.data.updatedCells); 
                                                                                                          console.log('URL: ', update.config.url + URL_FILE);
                                                                                                                if (!URL_FILE)
                                                                                                                { // la prima volta non esiste
                                                                                                                  URL_FILE= "see your Google Drive Recent file"
                                                                                                                }
                                                                                                
                                                                                                          return response.status(200).send({ message: "Google Sheet name:  \""+docTitle+"\" create Successfully with ", info_cell: update.data.updatedCells+ " updated cells. " ,  url: "Link to Google Sheet: "+ URL_FILE });
                                                                                                        }
                                                                                                        catch (e) {
                                                                                                          console.error(e);
                                                                                                          response.status(400).json({ message: e.message })
                                                                                                      }      
                                                                                                    }
                                                                                                    else // se invece non esiste
                                                                                                    {
                                                                                                       // creo file
                                                                                                    try{    
                                                                                                          spreadsheetId = await create(auth, docTitle);
                                                                                                        }
                                                                                                        catch (e) {
                                                                                                          console.error(e);
                                                                                                          response.status(400).json({ message: e.message })
                                                                                                      }     

                                                                                                      if (!spreadsheetId){// errore in creazione                                
                                                                                                        console.log("_____ create_spreadsheets non è mai esistito in G e in creazione per la prima volta ottengo errore _____");
                                                                                                       
                                                                                                        return response.status(400).json({ message: "Google Sheet Error : Impossible to create sheet" })
                                                                                                      }

                                                                                                        // faccio update dei dati 
                                                                                                        try{                                               
                                                                                                            const update = await updateValues(spreadsheetId, valueInputOption, array, auth);
                                                                                                            console.log('%d cells updated.', update.data.updatedCells); 
                                                                                                            console.log('URL: ', update.config.url + URL_FILE);
                                                                                                            if (!URL_FILE){ // la prima volta non esiste
                                                                                                              URL_FILE= "see your Google Drive Recent file"
                                                                                                            }

                                                                                                            return response.status(200).send({ message:  "Google Sheet name:  \""+docTitle+"\" create Successfully with ", info_cell: update.data.updatedCells+ " updated cells. " ,  url: "Link to Google Sheet: "+ URL_FILE });
                                                                                                          }
                                                                                                          catch (e) {
                                                                                                            console.error(e);
                                                                                                            response.status(400).json({ message: e.message })
                                                                                                        }        
                                                                                                    }


                         } // se non lo trovo nel db ( e quindi manco su G) allora lo creo
     else { //non è presente in mongo e quindi neanche su G(credo) quindi lo creo
        // creo file
        try{  
              spreadsheetId = await create(auth, docTitle);

                                                        if (!spreadsheetId){// errore in creazione 
                                                                                              
                                                          console.log("_____ create_spreadsheets non è mai esistito in G e in creazione per la prima volta ottengo errore _____");
                                                          return response.status(400).send( "Google Sheet Error : Impossible to create sheet");
                                                        }
        }
        catch (e) {
                     console.error(e);
                     response.status(400).json({ message: e.message })
         }                                                        
      

         // faccio update dei dati    
         try{                                           
              const update = await updateValues(spreadsheetId, valueInputOption, array, auth);
              console.log("_____ create_spreadsheets.... creato !!!: _____");
              console.log('%d cells updated.', update.data.updatedCells); 
              console.log('URL: ', update.config.url + URL_FILE);
              if (!URL_FILE){ // la prima volta non esiste
                URL_FILE= "see your Google Drive Recent file"
              }

              return response.status(200).send({ message:  "Google Sheet name:  \""+docTitle+"\" create Successfully with ", info_cell: update.data.updatedCells+ " updated cells. " ,  url: "Link to Google Sheet: "+ URL_FILE });
            }
            catch (e) {
          console.error(e);
          response.status(400).json({ message: e.message })
}    

     }// fine else

  }// fine CreaExcel
  
  // Make 
  CreaExcel();


  async function checkIfIdSheetExistonGoogle (auth , my_spreadsheetId) {
    
    const sheets = google.sheets('v4');

    const request = {
      // The spreadsheet to request.
      spreadsheetId: my_spreadsheetId,  

       // non deve essere nel cestino !!!
       
  
      // The ranges to retrieve from the spreadsheet.
      ranges: [],  // TODO: Update placeholder value.
  
      // True if grid data should be returned.
      // This parameter is ignored if a field mask was set in the request.
      includeGridData: false,  // TODO: Update placeholder value.
  
      auth: auth,
    };

    try {
      const response = (await sheets.spreadsheets.get(request)).data;
      // TODO: Change code below to process the `response` object:
    
        
        if (response){
          console.log(JSON.stringify(response, null, 2)); // questa info deve tornare indietro !!!! bello !!!
          URL_FILE = response.spreadsheetUrl; // mi segno l'url del file da ritornare
          return true;
        } 
        else{
          return false;
        }

    } catch (err) {
      console.log(err.message);
      if (err.code == "ETIMEDOUT"){
        console.log(err.message);
        return response.status(400).send( "TimeOut Error :" +  err.message );
      }
      if (err.code == "400"){
        console.log(err.message);
        return response.status(400).send( "Generic Error :" +  err.message );
      }
      return false; // vuol dire che non esiste !!!
    }
  
  
  };
   
async function checkIfIdSheetExistonDB (myquery) {

  try {
    //  const result =  await Project.find(query, options);
    const result = await Project.findOne(myquery);
  
    console.log("______ CheckIfSheetExist trovo questi id_____: " + result.doc.spreadsheetId);
    
    if(result.doc.spreadsheetId){
      return result.doc.spreadsheetId;
    }
  
    return false; 
  }
  catch (err) {
    console.log('_______SONO IN CheckIfSheetExist ERRROR__________', err)
    response.status(400).json({ message: err.message })
  
  }


};

async function makeArray (document) {

    //console.log("Array --> customer" + document.customer);

    const _values = [
      // Cell values ...
      ["-- PROJECT --"],
      ["Customer:", document.customer],
      ["Project:", document.project],
      ["Description:", document.contesto],
      ["Use Case:", document.usecase],
      ["-- ARCHITECTURE --"],
      ["Infrastructure:", document.projectarchitecture,     "", "", "-- Storage Size --" ],
      ["Type:"                     , document.Architecture, "", "", "Storage"  , "MB"          ,"GB"      ,"TB"],
      ["Number of Production Site:", document.PRSite      , "", "", "Data Size","=B14*B21/1024","=F9/1024","=G9/1024"],
      ["Disaster Recovery Site:", document.DRSite         ,"",  "", "Index Size","=B14*B18*B19/1024/1024", "=F10/1024","=G10/1024"  ],
      ["Storage Type:", document.PRStorage                ,"" , "", "Oplog","=(B25*60*60*24*B21/1024)+(B27*60*60*24*B21*0,02/1024)+(B31*60*60*24*10/1024)", "=F11/1024","=G11/1024"  ],
      ["-- DATA --"                                 ,""   ,"" ,"",  "Buffer", "=SUM(F10:F11)*0,1", "=F12/1024","=G12/1024" ],
      ["Initial data or data to import:", document.initial_data , "" ,"", "-- Total Storage Size --", "=SUM(F9:F12)" , "=F13/1024","=G13/1024" ],
      ["Total Number of NEW Documents:", document.documents     , "" ,"", "-- Total Storage Size on disk --", "=F13/3,14" , "=F14/1024","=G14/1024" ],
      ["Indication of growth:", document.growth],
      ["Growth Details:", document.growthspec],
      ["Average Number of Fields per documents:", document.average_fields_documents],
      ["Number of Index per document:", document.index_size],
      ["----- Index Entry Size:(da modificare) ------", "12"], //fisso da rivedere
      ["Number of documents in working set:", document.working_set                  ,"" , "", "-- # Operations / Second --"],
      ["Average Sizing of single document:", document.average_sizing_documents      ,"" ,"", "Find" ,"=B29/24/60/60" , "ops/sec"],
      ["Document Retention:", document.document_retention                           ,"" ,"", "Insert" ,"=B25/24/60/60" , "ops/sec"],
      ["Document Retention Period:", document.document_retention_period             , "" ,"", "Update" ,"=B27/24/60/60" , "ops/sec"],
      ["-- CRUD --"                                                            , "" , "" ,"", "Delete" ,"=B31/24/60/60" , "ops/sec"],
      ["Total Insert:", document.total_insert],
      ["Insert per:", document.insert_per],
      ["Total Update:", document.total_update],
      ["Update per:", document.update_per],
      ["Total Query:", document.total_query   , "", "", "-- Disk Speed --" ],
      ["Query per:", document.query_per        , "", "", "IOPS" , "=SUM(F21:F24)/20" ],
      ["Total Delete:", document.total_delete],
      ["Delete per:",  document.delete_per ],
      ["Concurrent write:", document.concurrent_write],
      ["Concurrent written details:", document.concurrent_write_details   , "", "", "-- RAM --"                               ,"Data size for operational/OLTP" , "0,05", "Data size for for Analytical/OLAP" , "=(3/90)*F10"],
      ["Concurrent read:", document.concurrent_read                      , "", "", ""                                        ,"MB"                             , "GB"                                        , "TB"  ],
      ["Concurrent read details:", document.concurrent_read_details      , "", "", "Working Set Analytical"                  ,"=F10*I34"                       ,"=F36/1024"                                  ,"=G36/1024"  ],
      [""                , ""                                            , "", "", "Working Set Transactional"               ,"=F10*G34"                        ,"=F37/1024"                                  ,"=G37/1024"],
      [""                , ""                                            , "", "", "---"                  ,""                        ,""                                          ,""]

      
      //["Totals", "=SUM(B2:B4)", "=SUM(C2:C4)", "=MAX(D2:D4)"]
    ];
 
    return _values;
    
    };


  async function getProjectData (myquery) {

try {
 
  const result = await Project.findOne(myquery);

  return result;
}
catch (err) {
  console.log('_______SONO IN PROJECT UPDATE ERRROR__________', err)
  response.status(400).json({ message: err.message })

}

};


  /**
   * Reads previously authorized credentials from the save file.
   *
   * @return {Promise<OAuth2Client|null>}
   */
async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  /**
   * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   *
   */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
async function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Class Data!A2:E',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    console.log('Name, Major:');
    rows.forEach((row) => {
      // Print columns A and E, which correspond to indices 0 and 4.
      console.log(`${row[0]}, ${row[4]}`);
    });
  }


  /**
 *                                                                          Create a google spreadsheet
 * @param {string} title Spreadsheets title
 * @return {string} Created spreadsheets ID
 */
async function create(auth, docTitle) {
    // const {GoogleAuth} = require('google-auth-library');
    // const {google} = require('googleapis');

    // const auth = new GoogleAuth(
    //     {scopes: 'https://www.googleapis.com/auth/spreadsheet'});
    let title = docTitle;

    const service = google.sheets({ version: 'v4', auth });
    const resource = {
      properties: {
        title
      },
    };
    try {
      const spreadsheet = await service.spreadsheets.create({
        resource,
        fields: 'spreadsheetId',
      });
      console.log(`Spreadsheet ID CREATO !!!!!!!!!!!!!!!!!!!!: ${spreadsheet.data.spreadsheetId}`);

    await addspreadsheetIdId(spreadsheet.data.spreadsheetId); // lo memorizzo nel DB

      return spreadsheet.data.spreadsheetId;
      //updateValues(spreadsheet.data.spreadsheetId, valueInputOption ,_values,auth);

    } catch (err) {
      console.log(err);
      console.log(err.message);
      return response.status(400).json({ message: err.message })
      
    }
  };                                                         // fine create

  async function addspreadsheetIdId(id) {

   
    try {
     
      const result = await Project.findOneAndUpdate( myquery,  { $set: { spreadsheetId: id } , upsert:true }  );
    
      if(result){
        return true;
      }
    
      return false; 
    }
    catch (err) {
      console.log('_______SONO IN addspreadsheetIdId ERRROR__________', err)
      return response.status(400).json({ message: err.message })
    
    }


  

  };

  

  /**
   * Updates values in a Spreadsheet.
   * @param {string} spreadsheetId The spreadsheet ID.
   * @param {string} range The range of values to update.
   * @param {object} valueInputOption Value update options.
   * @param {(string[])[]} _values A 2d array of values to update.
   * @return {obj} spreadsheet information
   */
async function updateValues(spreadsheetId, valueInputOption, data, auth) {
    // const {GoogleAuth} = require('google-auth-library');
    // const {google} = require('googleapis');

    // const auth = new GoogleAuth({
    //   scopes: 'https://www.googleapis.com/auth/spreadsheet',
    // });
    
    //const range = "A1:D5";
    const range = "A1";

    const service = google.sheets({ version: 'v4', auth });
    /*
    let values = [
      [
        // Cell values ...
        ["Item", "Cost", "Stocked", "Ship Date"],
        ["Wheel", "$20.50", "4", "3/1/2016"],
        ["Door", "$15", "2", "3/15/2016"],
        ["Engine", "$100", "1", "3/20/2016"],
        ["Totals", "=SUM(B2:B4)", "=SUM(C2:C4)", "=MAX(D2:D4)"]
      ],
      // Additional rows ...
    ];
    */
    let values = data;

    const resource = {
      values,
    };
    try {
      const result = await service.spreadsheets.values.update({
        spreadsheetId,
        range,
        valueInputOption,
        resource,
      });
      console.log('%d cells updated.', result.data.updatedCells);
      return result;
    } catch (err) {
      // TODO (Developer) - Handle exception
      //throw err;
      console.log(err);
      response.status(400).json({ message: err.message })
    }
  }




});


//requests to the CREATE Google Sheets via API v2
app.post("/create_spreadsheets_v2", async (request, response) => {

  console.log("______sono in NODE create_spreadsheets v2 Service Account_____");

 //const GCLOUD_PROJECT = "sizersheet" // {project ID of your google project}
 const GOOGLE_APPLICATION_CREDENTIALS = "sizersheet-serviceAccount.json"    
 const { google } = require('googleapis')
 const SCOPES = ['https://www.googleapis.com/auth/spreadsheets']
 const sheets = google.sheets('v4');


   // Get user input
 let myquery = { _id: ObjectId(request.query.id) };
 let spreadsheetId = "";

//const sheetName = "Sizer_Template" // process.argv[3];

 const valueInputOption = "USER_ENTERED";
 const fs = require('fs').promises;
 const path = require('path');
 const process = require('process');
 const { authenticate } = require('@google-cloud/local-auth');


 var URL_FILE="";


 let exist;
  
  const CreaExcel = async () => {


    try {
       // 1) mi autentico
       const auth = new google.auth.GoogleAuth({ 

        keyFile: GOOGLE_APPLICATION_CREDENTIALS, //the key file url to spreadsheets API
        scopes: "https://www.googleapis.com/auth/spreadsheets", 

    });
     
      
        // 2 Auth client Object
        const authClientObject = await auth.getClient();
        // 3 Google sheets instance
        const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });
        // 4 spreadsheet id
       // const spreadsheetId = "1S5msECluySB2zFcq-LU1CcRFUeD1ghVHUqe31f9pIC0" //process.argv[2];  //fatto sopra

       // esiste ne DB ?
       let project_sheet_id = await Project.findOne(myquery);
       let spreadsheetId_dal_db = project_sheet_id._doc.spreadsheetId;
  
       console.log("SpreadsheetId_dal_db =: " + spreadsheetId_dal_db);
       //Se si lo promuovo a spreadsheetId
       if(spreadsheetId_dal_db){
        spreadsheetId = spreadsheetId_dal_db; //quel nel database 
        console.log("_____create_spreadsheets dal DB v2 spreadsheetId= " +spreadsheetId);
       }
       else {
        spreadsheetId = request.query.sp_id  // quello che mi passa utente "1S5msECluySB2zFcq-LU1CcRFUeD1ghVHUqe31f9pIC0" //process.argv[2];
        spreadsheetId_dal_db = await  Project.findOneAndUpdate( myquery,  { $set: { spreadsheetId: spreadsheetId } , upsert:true }  ); // e lo memorizzo
        console.log("_____create_spreadsheets v2 spreadsheetId= " +spreadsheetId);
       }

       try {
         // 5 Get metadata about spreadsheet
         const sheetInfo = await googleSheetsInstance.spreadsheets.get({
          auth,
          spreadsheetId,
       });
       console.log("_____create_spreadsheets v2 sono autorizzato _____");
       console.log("_____ create_spreadsheetslink al file: " + sheetInfo.data.spreadsheetUrl);
       URL_FILE = sheetInfo.data.spreadsheetUrl;
        
       } catch (error) {
        console.log("_____create_spreadsheets v2 NON SONO AUTORIZZATO _____ " +error );
        return response.status(400).json({ message: error.message })
       }
       

        // 6) prendo i dati del progetto dal db
    const data = await getProjectData(myquery);
    console.log("_____ creato dati");
    // 7)  mi prendo lo spreadsheetId dal DB 
    // 8) creo il titolo del file 
    let docTitle = data._doc.customer +" - "+data._doc.project ; // forse non serve....
    console.log("_____ create_spreadsheets NOME FILE: _____"+data._doc.customer +" - "+data._doc.project );
    // 9) creo array da scivere sul file
    const values = await makeArray(data._doc);
    console.log("_____ create_spreadsheets ho creato array da scrivere: _____");
    // 10 UPDATE   
    const resource = {   values    }; // importante lo vuole così

      const update = await googleSheetsInstance.spreadsheets.values.update({
        auth, //auth object
        spreadsheetId, //spreadsheet id
        range: "Sheet1!A1", //sheet name and range of cells
        valueInputOption: valueInputOption, // The information will be passed according to what the usere passes in as date, number or text
        resource
    });

    console.log("_____ create_spreadsheets.... creato !!!: _____");
    console.log('%d cells updated.', update.data.updatedCells); 
    console.log('URL: ', URL_FILE);
    if (!URL_FILE){ // la prima volta non esiste
      URL_FILE= "see your Google Drive Recent file"
    }

    //return response.status(200).send({ message:  "Google Sheet name:  \""+docTitle+"\" create Successfully with ", info_cell: update.data.updatedCells+ " updated cells. " ,  url: "Link to Google Sheet: "+ URL_FILE });
    return response.status(200).send({ message:  "Google Sheet Update Successfully with ", info_cell: update.data.updatedCells+ " cells. " ,  url: "Link to Google Sheet: "+ URL_FILE  });


  
     // console.log('create_spreadsheets v2 sono autorizzato + output for getSpreadSheet', JSON.stringify(response.data, null, 2)); // bella risposta!
  }catch(error) {
      console.log(error.message, error.stack);
      return response.status(400).json({ message: error.message })
    }

  
  }// fine CreaExcel
  
  // Make 
  CreaExcel();


  async function checkIfIdSheetExistonGoogle (auth , my_spreadsheetId) {
    
    const sheets = google.sheets('v4');

    const request = {
      // The spreadsheet to request.
      spreadsheetId: my_spreadsheetId,  

       // non deve essere nel cestino !!!
       
  
      // The ranges to retrieve from the spreadsheet.
      ranges: [],  // TODO: Update placeholder value.
  
      // True if grid data should be returned.
      // This parameter is ignored if a field mask was set in the request.
      includeGridData: false,  // TODO: Update placeholder value.
  
      auth: auth,
    };

    try {
      const response = (await sheets.spreadsheets.get(request)).data;
      // TODO: Change code below to process the `response` object:
    
        
        if (response){
          console.log(JSON.stringify(response, null, 2)); // questa info deve tornare indietro !!!! bello !!!
          URL_FILE = response.spreadsheetUrl; // mi segno l'url del file da ritornare
          return true;
        } 
        else{
          return false;
        }

    } catch (err) {
      console.log(err.message);
      if (err.code == "ETIMEDOUT"){
        console.log(err.message);
        return response.status(400).send( "TimeOut Error :" +  err.message );
      }
      if (err.code == "400"){
        console.log(err.message);
        return response.status(400).send( "Generic Error :" +  err.message );
      }
      return false; // vuol dire che non esiste !!!
    }
  
  
  };
   
async function checkIfIdSheetExistonDB (myquery) {

  try {
    //  const result =  await Project.find(query, options);
    const result = await Project.findOne(myquery);
  
    console.log("______ CheckIfSheetExist trovo questi id_____: " + result.doc.spreadsheetId);
    
    if(result.doc.spreadsheetId){
      return result.doc.spreadsheetId;
    }
  
    return false; 
  }
  catch (err) {
    console.log('_______SONO IN CheckIfSheetExist ERRROR__________', err)
    response.status(400).json({ message: err.message })
  
  }


};

async function makeArray (document) {


    const _values = [
      ["-- PROJECT --", "","","","SHARDED CLUSTER","0","(put 1 or 0 for yes or no)"],
      ["Customer:", document.customer, "","","REPLICA SETS","1", "(put 1 or 0 for yes or no)"],
      ["Project:", document.project],
      ["Description:", document.contesto],
      ["Use Case:", document.usecase],
      ["-- ARCHITECTURE --"],
      ["Infrastructure:", document.projectarchitecture,     "", "", "-- STORAGE SIZE --" ],
      ["Type:"                     , document.Architecture, "", "", "Storage"  , "MB"          ,"GB"      ,"TB"],
      ["Number of Production Site:", document.PRSite      , "", "", "Data Size","=(B13+B14)*B21/1024","=F9/1024","=G9/1024"],
      ["Disaster Recovery Site:", document.DRSite         ,"",  "", "Index Size","=(B13+B14)*B18*F19/1024/1024", "=F10/1024","=G10/1024"  ],
      ["Storage Type:", document.PRStorage                ,"" , "", "Oplog","=(B25*60*60*24*B21/1024)+(B27*60*60*24*B21*0.02/1024)+(B31*60*60*24*10/1024)", "=F11/1024","=G11/1024"  ],
      ["-- DATA --"                                 ,""   ,"" ,"",  "Buffer", "=SUM(F9:F11)*0.1", "=F12/1024","=G12/1024" ],
      ["Initial data or data to import:", document.initial_data , "" ,"", "-- Total Storage Size --", "=SUM(F9:F12)" , "=F13/1024","=G13/1024" ],
      ["Total Number of NEW Documents:", document.documents     , "" ,"", "-- Total Storage Size on disk --", "=F13/3.14" , "=F14/1024","=G14/1024" ],
      ["Indication of growth:", document.growth],
      ["Growth Details:", document.growthspec],
      ["Average Number of Fields per documents:", document.average_fields_documents],
      ["Number of Index per document:", document.index_size],
      ["",                                   ,""                                    ,"", "--- INDEX ENTRY SIZE: ---", "12","byte"],
      ["Number of documents in working set:", document.working_set                  ,"" , "", "-- # Operations / Second --"],
      ["Average Sizing of single document:", document.average_sizing_documents      ,"" ,"", "Find" ,"=B29/24/60/60" , "ops/sec"],
      ["Document Retention:", document.document_retention                           ,"" ,"", "Insert" ,"=B25/24/60/60" , "ops/sec"],
      ["Document Retention Period:", document.document_retention_period             , "" ,"", "Update" ,"=B27/24/60/60" , "ops/sec"],
      ["-- CRUD --"                                                            , "" , "" ,"", "Delete" ,"=B31/24/60/60" , "ops/sec"],
      ["Total Insert:", document.total_insert],
      ["Insert per:", document.insert_per],
      ["Total Update:", document.total_update],
      ["Update per:", document.update_per],
      ["Total Query:", document.total_query   , "", "", "-- DISK SPEED --" ],
      ["Query per:", document.query_per        , "", "", "IOPS" , "=SUM(F21:F24)/20" ],
      ["Total Delete:", document.total_delete],
      ["Delete per:",  document.delete_per ],
      ["Concurrent write:", document.concurrent_write],
      ["Concurrent written details:", document.concurrent_write_details   , "", "", "-- RAM --"                               ,"DATA SIZE" , "0.05", , ],
      ["Concurrent read:", document.concurrent_read                      , "", "", ""                                        ,"MB"                             , "GB"                                        , "TB"  ],
      ["Concurrent read details:", document.concurrent_read_details      , "", "", ""                  ,""                       ,""                                  ,""  ],
      [""                , ""                                            , "", "", "Working Set"               ,"=(F9*G34)+F10"                        ,"=F37/1024"                                  ,"=G37/1024"],
      [""                , ""                                            , "", ""],
      [""                , ""                                            , "", "",""                                             ,"MB"              ,"GB",          "TB" ],
      [""                , ""                                            , "", "", "Required RAM "                     ,"=F37*2"    ,"=F40/1024" ,  "=G40/1024"],
      [""                , ""                                            , "", ""],
      [""                , ""                                            , "", ""], 
      [""                , ""                                            , "" ,"", "-- CPU --" ],
      [""                , ""                                            , "", "", "Operations per Second CPU"               ,"15000"],
      [""                , ""                                            , "", "", "Weighted Operations"               ,"=(F21+F22*1.3+F24*0.3+F23/2*1.3)","ops/sec"],
      [""                , ""                                            , "", "", "Sharding Overhead"               ,"=IF(F1=1,F45*0.3,0)"],
      [""                , ""                                            , "", "", "Replication Overhead"               ,"=IF(F2=1,F45*0.3,0)"],
      [""                , ""                                            ,"" ,"",  "# CPUs", "=SUM(F45:F47)/F44"],
      [""                , ""                                            , "", ""],
      [""                , ""                                            , "", ""], 
      [""                , ""                                            , "" ,"", "SHARDS PER DISK","=((F13/1024/1024)/I51)", "", "LIMIT ON DB SIZE", "1","TB" ],
      [""                , ""                                            , "" ,"", "SHARDS PER MEMORY","=(F40/1024)/I52"     , "", "LIMIT ON RAM SIZE", "16","GB" ]
    ];
 
    return _values;
    
    };


  async function getProjectData (myquery) {

try {
 
  const result = await Project.findOne(myquery);

  return result;
}
catch (err) {
  console.log('_______SONO IN PROJECT UPDATE ERRROR__________', err)
  response.status(400).json({ message: err.message })

}

};


  /**
   * Reads previously authorized credentials from the save file.
   *
   * @return {Promise<OAuth2Client|null>}
   */
async function loadSavedCredentialsIfExist() {
    try {
      const content = await fs.readFile(TOKEN_PATH);
      const credentials = JSON.parse(content);
      return google.auth.fromJSON(credentials);
    } catch (err) {
      return null;
    }
  }

  /**
   * Serializes credentials to a file comptible with GoogleAUth.fromJSON.
   *
   * @param {OAuth2Client} client
   * @return {Promise<void>}
   */
async function saveCredentials(client) {
    const content = await fs.readFile(CREDENTIALS_PATH);
    const keys = JSON.parse(content);
    const key = keys.installed || keys.web;
    const payload = JSON.stringify({
      type: 'authorized_user',
      client_id: key.client_id,
      client_secret: key.client_secret,
      refresh_token: client.credentials.refresh_token,
    });
    await fs.writeFile(TOKEN_PATH, payload);
  }

  /**
   * Load or request or authorization to call APIs.
   *
   */
async function authorize() {
    let client = await loadSavedCredentialsIfExist();
    if (client) {
      return client;
    }
    client = await authenticate({
      scopes: SCOPES,
      keyfilePath: CREDENTIALS_PATH,
    });
    if (client.credentials) {
      await saveCredentials(client);
    }
    return client;
  }

  /**
   * Prints the names and majors of students in a sample spreadsheet:
   * @see https://docs.google.com/spreadsheets/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms/edit
   * @param {google.auth.OAuth2} auth The authenticated Google OAuth client.
   */
async function listMajors(auth) {
    const sheets = google.sheets({ version: 'v4', auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: '1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgvE2upms',
      range: 'Class Data!A2:E',
    });
    const rows = res.data.values;
    if (!rows || rows.length === 0) {
      console.log('No data found.');
      return;
    }
    console.log('Name, Major:');
    rows.forEach((row) => {
      // Print columns A and E, which correspond to indices 0 and 4.
      console.log(`${row[0]}, ${row[4]}`);
    });
  }


  /**
 *                                                                          Create a google spreadsheet
 * @param {string} title Spreadsheets title
 * @return {string} Created spreadsheets ID
 */
async function create(auth, docTitle) {
    // const {GoogleAuth} = require('google-auth-library');
    // const {google} = require('googleapis');

    // const auth = new GoogleAuth(
    //     {scopes: 'https://www.googleapis.com/auth/spreadsheet'});
    let title = docTitle;

    const service = google.sheets({ version: 'v4', auth });
    const resource = {
      properties: {
        title
      },
    };
    try {
      const spreadsheet = await service.spreadsheets.create({
        resource,
        fields: 'spreadsheetId',
      });
      console.log(`Spreadsheet ID CREATO !!!!!!!!!!!!!!!!!!!!: ${spreadsheet.data.spreadsheetId}`);

      return spreadsheet.data.spreadsheetId;
      //updateValues(spreadsheet.data.spreadsheetId, valueInputOption ,_values,auth);

    } catch (err) {
      console.log(err);
      console.log(err.message);
      return response.status(400).json({ message: err.message })
      
    }
  };                                                         // fine create

async function addspreadsheetIdId(id) { //lo aggiungo a Mongo

   
    try {
     
      const result = await Project.findOneAndUpdate( myquery,  { $set: { spreadsheetId: id } , upsert:true }  );
    
      if(result){
        return true;
      }
    
      return false; 
    }
    catch (err) {
      console.log('_______SONO IN addspreadsheetIdId ERRROR__________', err)
      return response.status(400).json({ message: err.message })
    
    }


  

  };

  

  /**
   * Updates values in a Spreadsheet.
   * @param {string} spreadsheetId The spreadsheet ID.
   * @param {string} range The range of values to update.
   * @param {object} valueInputOption Value update options.
   * @param {(string[])[]} _values A 2d array of values to update.
   * @return {obj} spreadsheet information
   */
async function updateValues(spreadsheetId, valueInputOption, data, auth) {
    // const {GoogleAuth} = require('google-auth-library');
    // const {google} = require('googleapis');

    // const auth = new GoogleAuth({
    //   scopes: 'https://www.googleapis.com/auth/spreadsheet',
    // });
    
    //const range = "A1:D5";
    const range = "A1";
    let values = data;

    const resource = {
      values,
    };

    try {

      await googleSheetsInstance.spreadsheets.values.append({
        auth, //auth object
        spreadsheetId, //spreadsheet id
        range: range, //sheet name and range of cells
        valueInputOption: valueInputOption, // The information will be passed according to what the usere passes in as date, number or text
        resource,
    });


      console.log('%d cells updated.', result.data.updatedCells);
      return result;
    } catch (err) {
      // TODO (Developer) - Handle exception
      //throw err;
      console.log(err);
      response.status(400).json({ message: err.message })
    }
  }




});



// fine mie rotte



// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
