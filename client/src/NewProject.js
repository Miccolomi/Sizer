import React, {  useEffect, useState } from "react";
import Container from 'react-bootstrap/Container';
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import axios from "axios";
import Cookies from "universal-cookie";


import styles from "./utils/newproject/styles.module.css";


const cookies = new Cookies();
const token = cookies.get("TOKEN");

export default function NewProject() {
  // set an initial state for the message we will receive after the API call
  const [message, setMessage] = useState("");
  const [validated, setValidated] = useState(false);

  // campi della form
  const [customer, setCustomer] = useState(null);
  const [project, setProject] = useState(null);
  const [contesto, setContesto] = useState(null);
  const [email, setEmail] = useState(null);
  const [sendemail, setSendEmail] = useState(false);
  const [usecase, setUseCase] = useState(null);
  const [projectarchitecture, setProjectArchitecture] = useState(null);

  // per lo switch
  const SendEmail = ({sendemail, onChange}) => (
    <div>
      <input
        type="checkbox"
        className="toggle-switch-checkbox"
        checked={sendemail}
        onChange={e => onChange(e.target.checked)}
      />
    </div>
  );
  // fine switch
  
  // fine campi form

// UTENTE CONNESSO
const  [user_logon, setUserLogon] = useState(null);  

var Buffer = require('buffer/').Buffer;

useEffect(() => {
  let ignore = false;
  if (!ignore) {
   // setUserLogon( JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()) );
   let email_trovata = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).userEmail;
   console.log("---SICUREZZA CHECK----sono in NEW PROJECT AUTH COMPONENT " + email_trovata);
   setUserLogon(email_trovata);
  

  } 
  return () => { ignore = true; }
  },[Buffer]);
  
  // FINE UTENTE CONNESSO

  const handleSubmit = (e) => {

 


  
       // e.preventDefault();
       // e.stopPropagation();

     // setValidated(true);
      setMessage(null); 

      const form = e.currentTarget;

      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }
  
      setValidated(true);



      console.log("______SONO IN AUTH COMPONENT handleSubmit _____"); 


    // set configurations for the API call here 
    const configuration = {
    method: "post",
     url: "/info_mongo",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      data: {
        customer,
        project,
        contesto,
        usecase,
        email,
        sendemail,
        user_logon,
        projectarchitecture
       
      },
    };

    console.log("______DOPO IN AUTH COMPONENT configuration OK _____"); 

    // make the API call
    axios(configuration)
      .then((result) => {
        // assign the message in our result to the message we initialized above

        console.log("______SONO IN AUTH COMPONENT axios OK _____"); 
       
       setMessage(result.data);
    
         // redirect user to the Project List
         window.location.href = '/project_list_int';

      })
      .catch((error) => {

        if(401 == error.response.status) {
          window.location.href = "/";
       }

        console.log("errore status " + error.response.status +" errore message "+ error.response.data.message); // esempio 400                 

        setMessage(error.response.data.message );         
       

      });
  //}, []);


} // fine handleSubmit

  // logout
  const logout = () => {
    // destroy the cookie
    cookies.remove("TOKEN", { path: "/" });
    // redirect user to the landing page
    window.location.href = "/";
  }
  
  return (
   
    <div className="text-center">
       <br/><br/>
    <h1>Create new Customer Project</h1>
    <br/><br/>

    <Form noValidate validated={validated}  onSubmit={(e)=>handleSubmit(e)}>

    <Container fluid="md">
      <Row>
        <Col  xs={5}>
            <Form.Label>Customer</Form.Label>
            <Form.Control required size="sm" type="text" placeholder="Customer" name="customer" value={customer} onChange={(e) => setCustomer(e.target.value)}/>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Please insert Customer Name </Form.Control.Feedback>
        </Col>
        <Col  xs={3}>
            <Form.Label>Project Name</Form.Label>
            <Form.Control required  size="sm" type="text" placeholder="Project Name" name="project" value={project} onChange={(e) => setProject(e.target.value)}/>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Please insert Project Name </Form.Control.Feedback>
        </Col>
        <Col xs={4}>
            <Form.Label>Customer Email</Form.Label>
            <Form.Control  required size="sm" type="email" placeholder="Customer Email" name="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Please insert valid Email </Form.Control.Feedback>
      </Col>
      <Row>
      <Col  xs={9}></Col>
      <Col xs={3}> 
      <SendEmail  id="sendemail" checked={sendemail} onChange={setSendEmail} />
      <label htmlFor="sendemail">Send email to Customer ?</label> 
      </Col>
      </Row>
      </Row>
      <br/><br/>
      <Row>
        <Col>
           <Form.Label>Project Description</Form.Label>
            <Form.Control  required size="sm" as="textarea"  rows={3}  placeholder="Project Description" name="contesto" value={contesto} onChange={(e) => setContesto(e.target.value)}/>
            <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
            <Form.Control.Feedback type="invalid">Please insert short project description </Form.Control.Feedback>
        </Col>
      </Row>
      <br/><br/>
      <Row>
        <Col>       
        <Form.Label>Select Customer Use Case</Form.Label>
          <Form.Select size="sm" required aria-label="usecase" placeholder="usecase" name="usecase" value={usecase} onChange={(e) => setUseCase(e.target.value)}>
            <option></option>
            <option value="IoT">IoT</option>
            <option value="Single View">Single View</option>
            <option value="RDBMS Offloading">RDBMS Offloading</option>
            <option value="CD_Management">Content/Document Managment</option>
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">Please choise Customer Use Case </Form.Control.Feedback>
        </Col>
   
        <br/><br/>

        <Col>       
        <Form.Label>Select Customer Architecture</Form.Label>
          <Form.Select size="sm" required aria-label="projectarchitecture" placeholder="projectarchitecture" name="projectarchitecture" value={projectarchitecture} onChange={(e) => setProjectArchitecture(e.target.value)}>
            <option></option>
            <option value="OnPremise">OnPremise</option>
            <option value="Atlas">Atlas</option>
          </Form.Select>
          <Form.Control.Feedback>Looks good!</Form.Control.Feedback>
          <Form.Control.Feedback type="invalid">Please choise Customer Architecture </Form.Control.Feedback>
        </Col>
        </Row>
        <br/><br/>
       
      <br/>  <br/> <br/>  <br/>

    </Container>

 
  </Form>
 

    
	

 <Container>
    <Row>
      <Col>
      {message && <div className={styles.error_msg}>{message}</div>}
      </Col>
    </Row>
    
    <Row>
      <Col>
      <button type="submit" className={styles.green_btn}   onClick={(e) => handleSubmit(e)}>Save</button> 
      </Col>
     

      <Col>
      <button type="submit"  className={styles.blu_btn}   onClick={(e) => {  window.location.assign('/project_list_int');}} >Project List</button>
      </Col>

      <Col>
      <button type="submit" className={styles.red_btn}  variant="danger" onClick={() => logout()}>Logout</button>
      </Col>

    </Row>

    <Row>

    <Col>
      <Form.Text className="text-muted">  If you save, email notification are sent to Customer  </Form.Text>
      </Col>
      <Col>
      <Form.Text className="text-muted"> </Form.Text>
      </Col>
      <Col>
      <Form.Text className="text-muted">  </Form.Text>
      </Col>
    </Row>

 </Container>
	
        
           
   
   
 
     
          	
</div>
           

       




  );
}