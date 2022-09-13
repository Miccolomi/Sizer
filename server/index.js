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

// require database connection 
const dbConnect = require("./db/dbConnect");
// execute database connection 
dbConnect();

// Have Node serve the files for our built React app
console.log("__dirname: " + __dirname);
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

  console.log("email: " + email);
  console.log("password: " + password);

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



  console.log("______sono in APP info_mongo_____");

  // Get user input
  const { customer } = request.body;
  const { project } = request.body;
  const { contesto } = request.body;
  let { email } = request.body;
  const { usecase } = request.body;
  const { user_logon } = request.body;
  const { projectarchitecture } = request.body;
  // Validate user input



  if (!customer || !project || !contesto || !email || !usecase || !user_logon || !projectarchitecture) {
    console.log("______usecase == 0 NON VALIDO !!!!_____");
    return response.status(400).send({ message: "All input are required" });
  };

  //

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
  console.log("______COSTRUZIONE randomstring PER LA MAIL_____" + randomstring);
  const hash = await bcrypt.hash(randomstring, Number(bcryptSalt));

  // DEVO CONTRLLA RE LA MAIL DEL CLIENTE SE ESISTE !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!! altrimenti non entra se ha 2 progettoi assegnati alla stessa persona!!!!!!!!!
  const userexist = await User.findOne({ "email": email }); //Salvo il cliente sole se non esiste !!! altrimenti non lo salvo !!!!

  


  // save the new user
  await new_project.save().then((result) => {

    //Invio mail al cliente
    const clientURL = process.env.CLIENT_URL;
    console.log("______COSTRUZIONE URL PER LA MAIL_____" + clientURL);

    const link = `${clientURL}`;
    console.log("______COSTRUZIONE LINK PER LA MAIL_____" + link);

    const email_for_send = process.env.EMAIL_DEV;

    if (email_for_send){
      email = email_for_send; 
    }
    else { // quindi sono in produzione e prendo la vera mail
      email = email;
    }


    
    if (!userexist) {
   
      // Salvo nuovo utente perchè non esiste
    const user = new User({
      email: email,
      password: hash,
      change_password: 0,
      type: "EXT"
    });

    // save the new user
    user.save()

    console.log("______SALVO UTENTE_____");

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

    response.status(201).send({ message: "Project Created Successfully and Email send to customer !", result, });
    }
    else{ // quindi cliente è gia registrato e non lo devo salvare 2 volte..

      sendEmail(
        email,
        "Welcome back to MongoDB Sizer",
        {
          name: request.body.email,
          link: link
        },
  
        "/template/new_project_for_you.handlebars"
      );
  
      console.log("______EMAIL A UTENTE --ESISTENTE-- INVIATA_____");
  
      response.status(201).send({ message: "Project Created Successfully and Email send to customer !", result, });

    }

   

  

  })
    .catch((error) => {
      console.log("______ERRORE IN PROJECT _______NON SALVATO_____" + error);
      return response.status(400).send({ message: "Unable to save Project, details:" + error });
    })

  // fine insert
  console.log("______FINE PROJECT_____");

})// fine get /info_mongo

// PROJECT LIST INTERNO endpoint
app.post("/project_list_int", auth, async (request, response) => {

  console.log("______sono in APP PROJECT LIST QUERY_____");
  // prendo utente loggato

  const user_logon = request.query.user;
  console.log("user_logon che è arrivato da web: " + user_logon);


  //Chi mi sta chiamando interno o esterno ?
  const query_mongo = { user_logon: user_logon }; // questo nel caso io sia un SA mongodb
 
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
    
     return response.status(200).json("no data found");
  

    }

   

  }
  catch (error) {
    console.log('_______SONO IN PROJECT EDIT ERRROR__________', error);
    response.status(400).json({ message: error.message });
  }


});

// PROJECT LIST EXTERNAL endpoint
app.post("/project_list_ext", auth, async (request, response) => {

  console.log("______sono in APP PROJECT LIST QUERY_____");
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


  Project.findById(request.query.id, function (error, project) {
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
    project.total_insert = request.query.total_insert;
    project.total_update = request.query.total_update;
    project.total_query = request.query.total_query;
    project.insert_per = request.query.insert_per;
    project.update_per = request.query.update_per;
    project.query_per = request.query.query_per;
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
//FINE UTILI



//requests to the CREATE Google Sheets via API
app.post("/create_spreadsheets", async (request, response) => {

  console.log("______sono in NODE create_spreadsheets_____");

// id del progetto 
  let myquery = { _id: ObjectId(request.query.id) };

  const valueInputOption = "USER_ENTERED";
  const fs = require('fs').promises;
  const path = require('path');
  const process = require('process');
  const { authenticate } = require('@google-cloud/local-auth');
  const { google } = require('googleapis');

  // If modifying these scopes, delete token.json.
  const SCOPES = ['https://www.googleapis.com/auth/spreadsheets'];
  // The file token.json stores the user's access and refresh tokens, and is
  // created automatically when the authorization flow completes for the first
  // time.
  const TOKEN_PATH = path.join(process.cwd(), 'token.json');
  const CREDENTIALS_PATH = path.join(process.cwd(), 'credentials_google_sheet.json');

  var URL_FILE="";


//  authorize().then(create).catch(console.error);


  const CreaExcel = async () => {

    // 1) mi autentico
    const auth = await authorize();
    console.log("_____ create_spreadsheets sono autorizzato _____");
    // 2) prendo i dati del progetto dal db
    const data = await getProjectData(myquery);
    console.log("_____ create_spreadsheets ho i dati _____");

    let spreadsheetId = data._doc.spreadsheetId; // mi prendo lo spreadsheetId dal DB ma mi serve ?????? POTREI NON TROVARLO SE è la prima volta 
    console.log("_____ create_spreadsheets id: _____"+spreadsheetId);

    let docTitle = data._doc.customer +" - "+data._doc.project ; // mi prendo lo spreadsheetId dal DB ma mi serve ??????
    console.log("_____ create_spreadsheets docTitle: _____"+data._doc.customer +" - "+data._doc.project );

    // se lo trovo nel db lo cerco su GOOGLE
    if(spreadsheetId){
       // se presente su DB devo cmq verificare che esista davvero su drive, potrebbe essere stato cancellato o peggio ancora nel cestino...
    const exist = await checkIfIdSheetExistonGoogle(auth, spreadsheetId);
    console.log("_____ create_spreadsheets exist on Google ?: _____ "+exist);
      
      if(!exist){

         // se non lo trovo In G allora creo di nuovo il  file
         spreadsheetId = await create(auth, docTitle);
         console.log("_____ create_spreadsheets non esiste in google allora lo creo e questo è il suo ID: _____"+spreadsheetId);

         // e devo camncellarlo dal DB !!!

      }

     }
     else { //quindi è la prima volta che lancio il make sizer, creo il file

      spreadsheetId = await create(auth, docTitle);
      console.log("_____ create_spreadsheets non esiste in google allora lo creo e questo è il suo ID: _____"+spreadsheetId);


     }

   
         // creo array da scivere
         const array = await makeArray(data._doc);
         // e se non creo i dati che succede ??? gestire errore !!!!!!

         console.log("_____ create_spreadsheets ho creato array da scrivere: _____");
         // e poi scrivo
         if(spreadsheetId){

          const update = await updateValues(spreadsheetId, valueInputOption, array, auth);
          console.log("_____ create_spreadsheets.... creato !!!: _____");
          console.log('%d cells updated.', update.data.updatedCells);
          console.log('URL: ', update.config.url + URL_FILE);
          if (!URL_FILE){ // la rima volta non esiste
            URL_FILE= "see your Google Drive Recent file"
          }

          return response.status(200).send({ message: "Google Sheet create Successfully with ", info_cell: update.data.updatedCells+ " updated cells. " ,  url: "Link to Google Sheet: "+ URL_FILE });
 
         }
         else {
          // devo tornare eerore
          console.log("_____ ERRORE !!!!!!!!!!!! create_spreadsheets non esiste spreadsheetId e non lo ho creato...!!!!!!!!!!!!!: _____");
         }
       

  
  //  const spreadsheetId  = "1LF87ZFUi_6aYmh9RAqNdCMm5KoeKWedvQ7oBASrzVIQ";
    
   
  }
  
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
        return response.status(400).send( "TimeOut Error :" +  err.message );
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

    console.log("Array --> customer" + document.customer);

    const _values = [
      // Cell values ...
      ["Project "],
      ["Customer:", document.customer],
      ["Project:", document.project],
      ["Description:", document.contesto],
      ["Use Case:", document.usecase],
      ["Architecture "],
      ["Infrastructure:", document.projectarchitecture],
      ["Type:"                     , document.Architecture, "", "", "Storage"  , "MB"          ,"GB"      ,"TB"],
      ["Number of Production Site:", document.PRSite      , "", "", "Data Size","=B14*B21/1024","=F9/1024","=G9/1024"],
      ["Disaster Recovery Site:", document.DRSite         ,"",  "", "Index Size","=B14*B18*B19/1024/1024", "=F10/1024","=g10/1024"  ],
      ["Storage Type:", document.PRStorage],
      ["Data "],
      ["Initial data or data to import:", document.initial_data],
      ["Total Number of NEW Documents:", document.documents],
      ["Indication of growth:", document.growth],
      ["Growth Details:", document.growthspec],
      ["Average Number of Fields per documents:", document.average_fields_documents],
      ["Number of Index per document:", document.index_size],
      ["Index Entry Size:", "12"], //fisso da rivedere
      ["Number of documents in working set:", document.working_set],
      ["Average Sizing of single document:", document.average_sizing_documents],
      ["Document Retention:", document.document_retention],
      ["Document Retention Period:", document.document_retention_period],
      ["CRUD "],
      ["Total Insert:", document.total_insert],
      ["Insert per:", document.insert_per],
      ["Total Update:", document.total_update],
      ["Update per:", document.update_per],
      ["Total Query:", document.total_query],
      ["Query per:", document.query_per],
      ["Concurrent write:", document.concurrent_write],
      ["Concurrent writen details:", document.concurrent_write_details],
      ["Concurrent read:", document.concurrent_read],
      ["Concurrent read details:", document.concurrent_read_details],
      ["CIAO "]

      
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
      response.status(400).json({ message: err.message })
      
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





// fine mie rotte



// All other GET requests not handled before will return our React app
app.get('*', (req, res) => {
  res.sendFile(path.resolve(__dirname, '../client/build', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});
