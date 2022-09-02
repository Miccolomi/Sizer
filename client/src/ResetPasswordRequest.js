//import React from 'react'
import React, {  useState } from "react";
import axios from "axios";
import { Form, Button } from "react-bootstrap";


export default function ResetPasswordRequest() {

  const [email, setEmail] = useState("");
  const [message, setMessage] = useState(null);
              const configuration = 
                {
                  method: "post",
                  url: "/resetPasswordRequest",
                  data: {
                          email
                        },
                };
       
  const handleSubmit = (e) => {
          
            e.preventDefault();
       
                     axios(configuration)
                     .then(function (resp) 
                     {
                      console.log("Email Send Successfully!"); 
                      setMessage(' An e-mail has been sent to ' + email + ' with further instructions. \n You can close this page');

                     
            
                    }).catch(function (error) {
                      console.log(error);        
                      setMessage(error.response.data.message );             
                    });

  } // fine handleSubmit 
    
    return (
        <>
          <h2>Request Change Password</h2>
      <Form onSubmit={(e)=>handleSubmit(e)}>
        {/* email */}
        <Form.Group controlId="formBasicEmail">
          <Form.Label>Email address</Form.Label>
          <Form.Control
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter email"
          />
        </Form.Group>

        {/* submit button */}
        <Button
          variant="primary"
          type="submit"
          onClick={(e) => handleSubmit(e)}
        >
          Send Mail
        </Button>

      {message && <h3>{message}</h3>}
      </Form>
        </>
    )// fine return
}

 