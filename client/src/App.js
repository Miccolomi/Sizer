import { Container, Col } from "react-bootstrap";
import { Routes, Route } from 'react-router-dom';

import Account from "./Account"; // login
import Register from "./Register";
import FreeComponent from "./FreeComponent";
import NewProject from "./NewProject";

import ProjectListInt from "./ProjectListInt";
import ProjectListExt from "./ProjectListExt";

import ProjectEdit from "./ProjectEdit";
import ResetPasswordRequest from "./ResetPasswordRequest";
import ResetPassword from "./ResetPassword";
import CreateSpreadsheets from "./CreateSpreadsheets";
import logo from './mongodbsizer.png';


function App() {
  return (

    <Container>
     

    <Col className="text-center">

    <img src={logo}  alt="MongoDB Sizer"  width="100" height="100" />
        
    </Col>
 
      {/* create routes here */}
      
      <Routes>
      
        <Route  path="/" element={<Account/>} />
        <Route  path="/register" element={<Register/>} />
        <Route  path="/free" element={<FreeComponent/>} />
        <Route  path="/auth"  element={<NewProject/>} />
        <Route  path="/project_list_int"  element={<ProjectListInt/>} />
        <Route  path="/project_list_ext"  element={<ProjectListExt/>} />
        <Route  path="/project_edit/:id"  element={<ProjectEdit/>} />
        <Route  path="/project_update"  element={<ProjectEdit/>} />
        <Route  path="/project_delete/:id"  element={<ProjectListInt/>} />
        <Route  path="/resetPasswordRequest"  element={<ResetPasswordRequest/>} />
        <Route  path="/resetPassword"  element={<ResetPassword/>}  exact /> 
        <Route  path="/create_spreadsheets/:id"  element={<CreateSpreadsheets/>} /> 
        <Route  path="*" element= {<main style={{ padding: "1rem" }}> <p>There's nothing here!</p> </main>} />  
     
      </Routes>


      
    </Container>


  );
}

export default App;


