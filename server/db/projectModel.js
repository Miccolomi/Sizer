const mongoose = require("mongoose");
var validator = require('validator');

const ProjectSchema = new mongoose.Schema(
{
  customer:{
    type: String,
    required: [true]
  },
  project:{
    type: String,
    required: [true]
  },
  contesto:{
    type: String,
    required: [true]
  },
  usecase:{
    type: String,
    required: [true]
  }, 
  projectarchitecture:{
    type: String,
    required: [true, "Select Architecture"]
  },
  email: {
    type: String,
    required: [true, "Please provide valide Customer Email!"],
    unique: true,
    lowercase: true,
    validate: (value) => {
      return validator.isEmail(value)
    }
  },
  user_logon: {
        type: String,
        required: [true, "Error, user logon not found"],
      },    
   //   OnPrem: {
                  PRSite:{
                    type: Number
                  },    
                  DRSite:{
                    type: String
                  },  
                  PRStorage :{
                    type: String
                  },  
 //   },
 //   Atlas: {  
      Atlas :{
        type: String
      },  

      Architecture :{
        type: String
      },  


        // DATA section
        documents:{
          type: Number
        },  
        initial_data:{
          type: Number
        },  
        growth:{
          type: Number
        },  
        growthspec:{
          type: String
        },  
        average_fields_documents:{
          type: "String",
          mongodb: {
            "dataType": "Decimal128",
           }
        },  
        average_sizing_documents :{
          type: "String",
          mongodb: {
            "dataType": "Decimal128",
           }
        },
        document_retention:{
          type: Number
        },  
        document_retention_period :{
          type: String
        },  
        index_size  :{
          type: String
        },  
        working_set  :{
          type: "String",
          mongodb: {
            "dataType": "Decimal128",
           }
        },  

         // CRUD
         total_insert  :{
          type: Number
        },  
         total_update  :{
          type: Number
        },  
         total_query  :{
          type: Number
        },  
        total_delete  :{
          type: Number
        },  
        insert_per   :{
          type: String
        },  
        update_per   :{
          type: String
        },  
        query_per   :{
          type: String
        },  
        delete_per   :{
          type: String
        },  
        concurrent_write  :{
          type: Number
        },
        concurrent_write_details :{
          type: String
        },    
        concurrent_read :{
          type: Number
        },  
        concurrent_read_details  :{
          type: String 
        },  
         // fine crud

         // google sheet
         spreadsheetId  :{
          type: String 
        },  
         // fine google sheet



},  
   
{ timestamps: true }
     
  )// fine schema

  module.exports = mongoose.model.Project || mongoose.model("project", ProjectSchema);