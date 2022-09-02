const mongoose = require("mongoose");

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
    required: [true, "Email required"]
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


        // document section
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
          type: Number
        },  
        average_sizing_documents :{
          type: Number
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
          type: String
        },  
         // document section
         total_insert  :{
          type: String
        },  
         total_update  :{
          type: String
        },  
         total_query  :{
          type: String
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
        concurrent_write  :{
          type: String
        },
        concurrent_write_details :{
          type: String
        },    
        concurrent_read :{
          type: String
        },  
        concurrent_read_details  :{
          type: String 
        },  
         // fine crud



},  
   
{ timestamps: true }
     
  )// fine schema

  module.exports = mongoose.model.Project || mongoose.model("project", ProjectSchema);