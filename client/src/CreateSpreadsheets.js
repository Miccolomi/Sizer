import React, { useEffect, useState } from "react";

import axios from "axios";
import Cookies from "universal-cookie";
import { useParams, useNavigate } from "react-router";
import Alert from 'react-bootstrap/Alert';


import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';

import styles from "./utils/newproject/styles.module.css";




export default  function CreateSpreadsheets() {

    const cookies = new Cookies();
    const token = cookies.get("TOKEN");
    const params = useParams(); 
    const [message, setMessage] = useState(null);
    const [message1, setMessage1] = useState(null);
    const id = params.id.toString();
    const navigate = useNavigate();
    
    const handleClick = () => {
        navigate('/project_list', {replace: true});
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

          console.log("sono dopo configuration_data ");

           axios(configuration_data)
          .then((result) => {
     
           console.log("SONO IN makeSizer - sono in CreateSpreadsheets - risultato: "+ result.data.spreadsheetId); 
    
            if (result.data.spreadsheetId){
                 setMessage("This is you existing google sheet ID: " + result.data.spreadsheetId );
                 setMessage1("Mean that your file already exist. Google is not going to check if this file has been trashed or not, or what directory it resides in, if you not found the sheet, please check if its been trashed");
              }
            else {
                setMessage("This is the first time that you create Sizer on Google Sheet.");
            }  
    
          })
     
          .catch(function (error){
           console.log("SONO IN CreateSpreadsheets e ho un errore: " + error);
    
                                if(401 == error.response.status) {
                                    window.location.href = "/";
                                }
    
             })


        
    }, []); // fine effect 


    async function onSubmit(e) {

        e.preventDefault();


    const configuration_create = {
        method: "POST",
        url: "/create_spreadsheets",
        headers: {
          Authorization: `Bearer ${token}`,
        },
         params: { id: id }
      };

      axios(configuration_create)
      .then((result) => {
 
       console.log("SONO IN makeSizer - sono in result - risultato: "+ result); 

      // setMessage(result.data);

      })
 
      .catch(function (error){
       console.log("SONO IN makeSizer e ho un errore: " + error);

                            if(401 == error.response.status) {
                                window.location.href = "/";
                            }

         })


        } // fine onSubmit

         return (<>

            <div>
                <h3>Make your Size</h3>
              
               
                
            </div>

            <Alert key="primary" variant="primary">
                                <p> {message} </p>
                                <hr />
                                 <p className="mb-0">
                                 {message1}
                                </p>
                              </Alert>
           
      
                 <div>
                 <Form onSubmit={onSubmit}>


                        <Row>
                            <Col>
                                <button type="submit" className={styles.green_btn}>Save</button>
                            </Col>
                            <Col>
                                <button type="submit" className={styles.green_btn} onClick={handleClick}>Back</button>                              
                            </Col>
                        </Row>  

                 </Form>   
                 
                           

                           
              </div>
      
              </>);
              


   


}// fine CreateSpreadsheets
