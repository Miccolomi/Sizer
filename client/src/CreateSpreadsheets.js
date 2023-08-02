import React, { useEffect, useState } from "react";
import axios from "axios";
import Cookies from "universal-cookie";
import { useParams, useNavigate } from "react-router";
import Alert from 'react-bootstrap/Alert';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';



import styles from "./utils/newproject/styles.module.css";

import LoadingSpinner from "./LoadingSpinner";
import google_image from './google_Sheet_ex.png'; // image

export default  function CreateSpreadsheets() {

    const [isLoading, setIsLoading] = useState(false);

    const cookies = new Cookies();
    const token = cookies.get("TOKEN");
    const params = useParams(); 
    const [message_trovato, setMessageTrovato] = useState(null);
    const [message_trovato1, setMessageTrovato1] = useState(null);
    const [message_non_trovato, setMessageNonTrovato] = useState(null);
    const [message_non_trovato1, setMessageNonTrovato1] = useState(null);
    const [messageResult, setMessageResult] = useState(null);
    const [messageResult2, setMessageResult2] = useState(null);
    const [message_error, setMessageError] = useState(null);
    const id = params.id.toString();
    const navigate = useNavigate();
    const [spreadsheetId, setSpreadsheetId] = useState("");
    
    const handleClick = () => {
        navigate('/project_list_int', {replace: true});
      };


    console.log("SONO IN CreateSpreadsheets- ID ricevuto " + id);


    // provo a prendere info inziali
    useEffect(() => {

    

        const configuration_data = {
            method: "POST",
            url: "/_getData",
            headers: {
              Authorization: `Bearer ${token}`,
            },
             params: { id: id }
          };

         

           axios(configuration_data)
          .then((result) => {
     
           console.log("SONO IN makeSizer - sono in CreateSpreadsheets - risultato: "+ result.data.spreadsheetId); 
    
            if (result.data.spreadsheetId){
                 setMessageTrovato("This is you existing google sheet ID: " + result.data.spreadsheetId );
                 setMessageTrovato1("Mean that your file already exist and will be overwrite. Google is not going to check if this file has been trashed or not, or what directory it resides in, if you not found the sheet in Google Drive, please check if its been trashed");
              }
            else {
                setMessageNonTrovato("This is the first time that you create Sizer on Google Sheet.");
                setMessageNonTrovato1("true");
    
                }
            })
          .catch(function (error){
           console.log("SONO IN CreateSpreadsheets e ho un errore: " + error);

           setMessageError(error.message);
    
                                if(401 == error.response.status) {
                                    window.location.href = "/";
                                }
    
            })


        
    }, []); 
    // fine effect 


    async function onSubmit(e) {

        e.preventDefault();

        setIsLoading(true);
      //  setMessageTrovato(null);
       // setMessageTrovato1(null);
        setMessageError(null); 
        setMessageResult(null);
        setMessageResult2(null);
        

    const configuration_create = {
        method: "POST",
        url: "/create_spreadsheets_v2",
        headers: {
          Authorization: `Bearer ${token}`,
        },
         params: { id: id,
                   sp_id : spreadsheetId}
      };

      axios(configuration_create)
      .then((result) => {

 
            console.log("SONO IN makeSizer - sono in result - risultato: "+ result.data); 

            setMessageResult(result.data.message + " " + result.data.info_cell   );

            setMessageResult2( 
            <a href={ result.data.url.split(" ").filter(i => i.startsWith("https://")).toString() } target="_blank" > Your spreadsheet</a> 
            );


           setIsLoading(false);   // Hide loading screen 
      })
 
      .catch(function (error){
       console.log("SONO IN makeSizer e ho un errore: " + error.message);

       setIsLoading(false);   // Hide loading screen 

  
      setMessageError(error.response.data.message );

                            if(401 == error.response.status) {
                                window.location.href = "/";
                            }

         })


        } // fine onSubmit

    return (<>

        <div>
            <h3>Make your Size</h3>
        </div>

       
        <Form onSubmit={(e)=>onSubmit(e)}>
        <Alert key="primary" variant="primary">

            <div>{message_trovato }</div> <br/>
            <div>{message_trovato1} </div>

             {message_non_trovato1 ? 
              <div>
                 Please follow this step (only for new sizer) <br/> <p/>
                1) Create a new Google Sheet on your G Drive Home, or subdirectory if you prefer, and rename as you like.<br/> 
                2) Share the document with "account-mongoexcel@mongoexcel.iam.gserviceaccount.com"    <br/> 
                3) Copy the spreadshet ID like this: <img src={google_image} />  and paste here.<br/> 
             
                
                <input
							type="text"
							placeholder="Spreadsheet ID"
							name="spreadsheetId"
						    onChange={(e) => setSpreadsheetId(e.target.value)}
							value={spreadsheetId}
							required
							className={styles.input_google}
				/>
                 
            </div>        
            : false 
            }

            <hr />
            <p className="mb-0">
             
            </p>
        </Alert>

        <Row>
                    <Col align="left">
                        <button type="submit" className={styles.green_btn} >Make</button>
                    </Col>
                    <Col align="right">
                        <button type="submit" className={styles.blu_btn} onClick={handleClick} >Back</button>
                    </Col>
                </Row>

     
            </Form>


                    <div align="center">
                        <br/>
                        {isLoading ? <LoadingSpinner /> : false}

                        {messageResult &&  <Alert key="success" variant="success">
                            <p> </p>
                            <hr />
                            {messageResult}
                            <p className="mb-0">
                             <p> </p>
                            {messageResult2}

                           


                               
                             


                            </p>
                        </Alert>}
                    
                    </div>

                    {message_error && <div className={styles.error_msg}>{message_error}</div>}
               


    </>);
              


   


}// fine CreateSpreadsheets
