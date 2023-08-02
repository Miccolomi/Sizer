const nodemailer = require("nodemailer");
const handlebars = require("handlebars");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: "./server/config.env" });

const sendEmail = async (email, subject, payload, template) => {
  try {
    // create reusable transporter object using the default SMTP transport
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST,
      port: process.env.EMAIL_PORT,
      auth: {
        user: process.env.EMAIL_USERNAME,
        pass: process.env.EMAIL_PASSWORD, 
      },
    });

    //debug
    //console.log("--USERNAME EMAIL: "+process.env.EMAIL_USERNAME ); 
    //console.log("--PASSWORD EMAIL: "+process.env.EMAIL_PASSWORD ); 

    const source = fs.readFileSync(path.join(__dirname, template), "utf8");
    const compiledTemplate = handlebars.compile(source);
    const options = () => {
      return {
        from: process.env.FROM_EMAIL,
        to: email,
        subject: subject,
        html: compiledTemplate(payload),
      }; 
    };

    // Send email
    transporter.sendMail(options(), (error, info) => {
      if (error) {
       
        console.log("errore nel invio mail : "+error ); 
        return error;

      } else {
        console.log("___EMAIL INVIATA___"); 
        return res.status(200).json({
          success: true,
        });
      }
    });
  } catch (error) {
    console.log("errore in mail catch !!!!!!"+error ); 
    return error;
  }
};


module.exports = sendEmail;