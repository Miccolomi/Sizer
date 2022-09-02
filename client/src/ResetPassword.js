//import React from 'react'
import React, {  useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";
import { Form, Button } from "react-bootstrap";
import Cookies from "universal-cookie";




export default function ResetPassword() {

  const [searchParams, setSearchParams] = useSearchParams();

  const cookies = new Cookies();
  
  const token =searchParams.get("token");
  const id =searchParams.get("id");
  const [password, setPassword] = useState("");

  console.log('token: ' + token);
  console.log('id: ' + id);

  const [message, setMessage] = useState(null);
  
  const handleSubmit = (e) => {
            
    e.preventDefault();
    //setMessage(null); // per i messaggi da visualizzare


    const configuration = 
    {
      method: "get",
      url: "/resetPassword",
            params: {
              id: id,
              token : token,
              new_password : password
            }      
    };
               

    // make the API call 
    axios(configuration)
      .then((result) => {

            // set the cookie
            cookies.set("TOKEN", result.data.token, {
              path: "/",
            });
        
        setMessage("Done ! Password change !");

       

          // redirect user to the auth page
          window.location.href = "/auth";
           
      })
      .catch((error) => {

        setMessage(error);
        console.error(error);
        
      });

    } // fine handleSubmit 

  
      return (
        <div>
          <h1 className="text-center">Reset Password Check</h1>

       <Form onSubmit={(e)=>handleSubmit(e)}>
           {/* password */}
        <Form.Group controlId="formBasicPassword">
          <Form.Label>Password</Form.Label>
          <Form.Control
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
          />
        </Form.Group>

        

         
         {/* submit button */}
         <Button
          variant="primary"
          type="submit"
          onClick={(e) => handleSubmit(e)} >
          Register
        </Button>

        {/* display success message */}

      
  {/* displaying message from our API call  */}
  <h3 className="text-center">{message}</h3>

      </Form>

          </div>

          
       
      );
        

}

