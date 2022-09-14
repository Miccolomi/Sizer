import React, { useEffect, useState } from "react";
import Row from 'react-bootstrap/Row';
import Col from 'react-bootstrap/Col';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Tabs from 'react-bootstrap/Tabs'
import Tab from 'react-bootstrap/Tab'
import { useParams, useNavigate } from "react-router";
import axios from "axios";
import Cookies from "universal-cookie";
import styles from "./utils/newproject/styles.module.css";



export default function ProjectEdit() {



  console.log("-----SONO IN PROJECT EDIT----- ");


  const cookies = new Cookies();

  const [message, setMessage] = useState(null);



  
  const params = useParams(); 
  const navigate = useNavigate();
  // Gestione errori
  const [errore, setErrore] = useState(null); 

  // campi della Form
  const [form, setForm] = useState({
   // project
    project : "",
    usecase : "",
    contesto : "",
    projectarchitecture  : "",
  
    PRSite : "",
    DRSite : "",
    PRStorage : "",
    Atlas : "",
    Architecture : "",
// document section
    documents : "",
    initial_data : "",
    growth : "",
    growthspec :"",
    document_retention :"",
    document_retention_period :"",

    average_fields_documents : "",
    average_sizing_documents : "",

    index_size : "",
    working_set : "",
 // fine document section   

    // CRUD
    total_insert : "",
    total_update : "",
    total_query : "",
    insert_per : "",
    update_per  : "",
    query_per  : "",
    concurrent_write :"",
    concurrent_read : "",
    concurrent_write_details : "",
    concurrent_read_details : "",
    // fine CRUD
      
 //   records: [],
   });

 // logout
 const logout = () => {
  // destroy the cookie
  cookies.remove("TOKEN", { path: "/" });
  // redirect user to the landing page
  window.location.href = "/";
}
  
    useEffect(() => {

    

   
    const id = params.id.toString();
  
    console.log("-----EFFECT ----- SONO IN PROJECT EDIT -----ID: " + id);

    const cookies = new Cookies();
    // get token generated on login
    const token = cookies.get("TOKEN");

    const configuration = {
      method: "get",
      url: "/project_edit/",
      headers: {
        Authorization: `Bearer ${token}`,
      },
      params: {
        id: params.id.toString()
      }
    };

    console.log("-----PROJECT EDIT AXIOS configuration ok -----");

     axios(configuration)
      .then((result) => {


         setForm(result.data);
        
        
      })

      .catch((error) => {

        if(401 == error.response.status) {
          window.location.href = "/";
       }

     
      }); // fine catch

},[params.id, navigate]);


// render ATLAS ?
function renderAtlas() {

  let input;
  
  if(form.projectarchitecture === 'OnPremise') {

    input = 
    <>
    <Row>
      <Col  xs={3}>

        <Form.Group className="mb-3" controlId="PRSite">
        <Form.Label>Number of Production Site:</Form.Label>
        <Form.Control type="text"  value={form.PRSite || ''} onChange={(e) => updateForm({ PRSite: e.target.value })} />
       
        </Form.Group>
      </Col>
      <Col xs={6}>
      <Form.Text className="text-muted">Info: </Form.Text>
      <br/>
      <Form.Text className="text-muted">Insert 1, if you have only one DC -  Insert 2, if you have two datacenter on high availability  </Form.Text>
      </Col>
  </Row>

  <Row>
      <Col  xs={3}>
          <Form.Group className="mb-3" controlId="DRSite">
            <Form.Label>Disaster Recovery Site:</Form.Label>
            <Form.Select aria-label="Storage Type" value={form.DRSite || ''} onChange={(e) => updateForm({ DRSite: e.target.value })}>
            <option>Open this select menu</option>
          <option value="Si">Yes</option>
          <option value="No">No</option>
          </Form.Select>
          </Form.Group>
  </Col>
  <Col xs={6}>
      <Form.Text className="text-muted">Info: </Form.Text>
      <br/>
      <Form.Text className="text-muted">Yes if you have third datacenter for DR </Form.Text>
  </Col>
  
  </Row>
  <Row>
      <Col  xs={3}>   
        <Form.Group className="mb-3" controlId="PRStorage">
          <Form.Label>Storage Type:</Form.Label>
          <Form.Select aria-label="Storage Type" value={form.PRStorage || ''} onChange={(e) => updateForm({ PRStorage: e.target.value })}>
          <option>Open this select menu</option>
        <option value="SSD">SSD</option>
        <option value="HDD">HDD</option>
          </Form.Select>
         
        </Form.Group>
      </Col>
      <Col xs={6}>
      <Form.Text className="text-muted">Info: </Form.Text>
      <br/>
      <Form.Text className="text-muted">Which kind of storage type you have ? </Form.Text>
  </Col>
  </Row>

  <Row>
      <Col  xs={3}>
  <Form.Group className="mb-3" controlId="Architecture">
    <Form.Label>Architecture:</Form.Label>
    <Form.Select aria-label="Storage Type" value={form.Architecture || ''} onChange={(e) => updateForm({ Architecture: e.target.value })}>
    <option>Open this select menu</option>
  <option value="VM">VM</option>
  <option value="Microservices">Microservices</option>
    </Form.Select>
   
  </Form.Group>
  </Col>
  <Col xs={6}>
      <Form.Text className="text-muted">Info: </Form.Text>
      <br/>
      <Form.Text className="text-muted"> What type of architecture you used today ?</Form.Text>
  </Col>
  </Row>
  </>
  }
  else {

    input =  
    <>
    <Form.Group className="mb-3" controlId="Atlas">
    <Form.Label>Public Cloud Provider:</Form.Label>
    <Form.Select aria-label="Cloud Provider" value={form.Atlas || ''} onChange={(e) => updateForm({ Atlas: e.target.value })}>
    <option>Open this select menu</option>
    <option value="AWS">AWS</option>
    <option value="GCP">GCP</option>
    <option value="Azure">Azure</option>
  </Form.Select>
  </Form.Group>
     </>
  }
    
    return input;
};





function renderUseCase() {

  let input;

   if( form.usecase === "Single View"){

    input =  
    <>
     <Form.Group className="mb-3" controlId="iot">
                      <Form.Label>single view....example:</Form.Label>
                      <Form.Control type="text"  value={form.iot  || ''} onChange={(e) => updateForm({ iot: e.target.value })}/>
                    </Form.Group>   
     </>
   }

   if( form.usecase === "RDBMS Offloading"){
  
            input =  
            <>
            <Form.Group className="mb-3" controlId="SingleView">
            <Form.Label>From wich Relational DB ?</Form.Label>
            <Form.Select aria-label="RDBMS" value={form.rdbms || ''} onChange={(e) => updateForm({ rdbms: e.target.value })}>
            <option>Open this select menu</option>
            <option value="AWS">Oracle</option>
            <option value="GCP">SqlServer</option>
            <option value="Azure">Mysql</option>
          </Form.Select>
          </Form.Group>
            </>

   }

   if( form.usecase === "Content/Document Managment"){

    input =  
    <>
    <Form.Group className="mb-3" controlId="cdmanagment">
    <Form.Label>Content/Document Managment....example:</Form.Label>
    <Form.Control type="text"  value={form.cdmanagment  || ''} onChange={(e) => updateForm({ cdmanagment: e.target.value })}/>
  </Form.Group>   
</>

}

   return input;

};





 // These methods will update the state properties.
 function updateForm(value) {
  return setForm((prev) => {
    return { ...prev, ...value };
  });
}

async function onSubmit(e) {

              e.preventDefault();

         

              if(!message){ //https://stackoverflow.com/questions/61625297/dismiss-react-error-messages-after-a-timeout
                setMessage(false);
               }

             
              
                 // console.log('customer: '+ form.customer);
                  console.log('----- SONO IN PROJECT_UPDATE -----PRSite: '+ form.PRSite);
                  console.log('----- SONO IN PROJECT_UPDATE -----DRSite: ' + form.DRSite);
                  console.log('----- SONO IN PROJECT_UPDATE -----PRStorage: ' + form.PRStorage);
                  console.log('----- SONO IN PROJECT_UPDATE -----Atlas: ' + form.Atlas);
                  console.log('----- SONO IN PROJECT_UPDATE -----Architecture: ' + form.Architecture);

                  console.log('----- SONO IN PROJECT_UPDATE -----documents: ' + form.documents);
                  console.log('----- SONO IN PROJECT_UPDATE -----initial_data: ' + form.initial_data);
                  console.log('----- SONO IN PROJECT_UPDATE -----growth: ' + form.growth);
                  console.log('----- SONO IN PROJECT_UPDATE -----average_fields_documents: ' + form.average_fields_documents);
                  console.log('----- SONO IN PROJECT_UPDATE -----average_sizing_documents: ' + form.average_sizing_documents);
                  console.log('----- SONO IN PROJECT_UPDATE -----growthspec: ' + form.growthspec);
                  console.log('----- SONO IN PROJECT_UPDATE -----document_retention_period: ' + form.document_retention_period);
                  console.log('----- SONO IN PROJECT_UPDATE -----document_retention: ' + form.document_retention);

              const id = params.id.toString();
              console.log("----- ----- SONO IN PROJECT_UPDATE -----ID: " + id);   
              
            

              const cookies = new Cookies();
              // get token generated on login
              const token = cookies.get("TOKEN");

                  const configuration = {
                    method: "PUT",
                    url: "/project_update",
                    headers: {
                      Authorization: `Bearer ${token}`, 'Content-Type': 'application/json',
                    },
                    params: {
                    // id: params.id.toString(),
                      id: params.id,
                      PRSite : form.PRSite,
                      DRSite : form.DRSite,
                      PRStorage : form.PRStorage,
                      Atlas : form.Atlas,
                      Architecture : form.Architecture,

                      documents : form.documents,
                      initial_data : form.initial_data,
                      growth : form.growth,
                      growthspec :form.growthspec,
                      document_retention : form.document_retention,
                      document_retention_period :form.document_retention_period,

                      average_fields_documents : form.average_fields_documents,
                      average_sizing_documents : form.average_sizing_documents,

                      index_size : form.index_size,
                      working_set : form.working_set,

                      //CRUD
                      total_insert : form.total_insert,
                      total_update : form.total_update,
                      total_query : form.total_query,
                      insert_per  : form.insert_per,
                      update_per  : form.update_per,
                      query_per  : form.query_per,
                      concurrent_write : form.concurrent_write,
                      concurrent_read : form.concurrent_read,
                      concurrent_write_details : form.concurrent_write_details,
                      concurrent_read_details : form.concurrent_read_details,
                      
                    }
                  };

                  console.log("----- SONO IN PROJECT_UPDATE ----- OK CONFIG " );
                

                  await  axios(configuration)
                  .then((result) => {

              // update quando funziona ritorna questo :
              //{"acknowledged":true,"modifiedCount":1,"upsertedId":null,"upsertedCount":0,"matchedCount":1}
              //{"acknowledged":true,"modifiedCount":1,"upsertedId":null,"upsertedCount":0,"matchedCount":1}

              // console.log("STACK COMPLETO" + JSON.stringify(result, null, "\t"));


                        console.log("-----PROJECT_UPDATE AXIOS RESULT ok !! -----");
                                        
                        setMessage(result.data);

                        const timer = setTimeout(() => {
                          setMessage("")
                        }, 2000);
                        return () => clearTimeout(timer);

                  })

                  .catch((error) => {          

                    if(401 == error.response.status) {
                      window.location.href = "/";
                   }

                    if (error.response) {

                      console.error("SONO IN ERRORE !!!!!!!!!!!!!!!");
                     
                      setErrore(error.response.data );               

                    }
                    else if (error.request) {

                      setMessage("Error: " + JSON.stringify(error.request.data.message) );
                      console.log(JSON.stringify(error.request.data.message));

                    }
                    else {
                      // Something happened in setting up the request that triggered an Error
                      
                      setMessage("Error: " + JSON.stringify(error.data.message) );
                      console.log(JSON.stringify(error.data.message));

                      error = new Error();
                    }
                  }); // fine catch              
              
              } // fine handleSubmit



 // This following section will display the form that takes input from the user to update the data.

   return (


  <div>
 <h3>Update your Sizer</h3>

    <Form onSubmit={onSubmit}>
   
    <Form.Group className="mb-3" controlId="customer">
        <Form.Label>Customer:</Form.Label>
        <Form.Control type="text"  value={form.customer  || ''}  disabled readOnly />
        </Form.Group>   
 
      <Form.Group className="mb-3" controlId="project">
        <Form.Label>Project:</Form.Label>
        <Form.Control type="text"  value={form.project || '' }  disabled readOnly/>
      </Form.Group>
 
      <Form.Group className="mb-3" controlId="contesto">
        <Form.Label>Description:</Form.Label>
        <Form.Control  as="textarea"   value={form.contesto || ''} disabled readOnly/>
      </Form.Group>

      <Form.Group className="mb-3" controlId="usecase">
        <Form.Label>Use Case:</Form.Label>
        <Form.Control type="text" value={form.usecase || ''}  disabled readOnly/>
      </Form.Group>

      <Form.Group className="mb-3" controlId="projectarchitecture">
        <Form.Label>Architecture:</Form.Label>
        <Form.Control type="text" value={form.projectarchitecture || ''}  disabled readOnly/>
      </Form.Group>


      <Tabs  defaultActiveKey="Infrastructure"  id="tab"   className="mb-3" fill  >
     
      <Tab eventKey="Infrastructure" title="Infrastructure">       

                {renderAtlas()}    
      
      </Tab>

      <Tab eventKey="Data" title="Data" >
       
      <Row>
      <Col  xs={3}>
                  <Form.Group className="mb-3" controlId="initial_data">
                    <Form.Label>Initial data or data to import:</Form.Label>
                    <Form.Control type="text"  value={form.initial_data  || ''} onChange={(e) => updateForm({ initial_data: e.target.value })}/>
                  </Form.Group>   
      </Col>
      <Col xs={6}>  
                <Form.Text className="text-muted">Info: </Form.Text>
                <br/>
                <Form.Text className="text-muted">Insert number of documents that you want to import when project start  </Form.Text>
      </Col>
  </Row>          
  <Row>
      <Col  xs={3}>
                  <Form.Group className="mb-3" controlId="documents">
                    <Form.Label>Total Number of NEW Documents:</Form.Label>
                    <Form.Control type="text"  value={form.documents  || ''} onChange={(e) => updateForm({ documents: e.target.value })}/>
                  </Form.Group>              
      </Col> 
      <Col xs={6}>  
                <Form.Text className="text-muted">Info: </Form.Text>
                <br/>
                <Form.Text className="text-muted">Insert number of New documents  </Form.Text>
      </Col>
  </Row>
  <Row>
      <Col  xs={3}>         
                  <Form.Label>Indication of growth:</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control type="text"  value={form.growth  || ''} onChange={(e) => updateForm({ growth: e.target.value })}/>
                    <InputGroup.Text>%</InputGroup.Text>
                  </InputGroup> 
                  </Col> 
      <Col xs={3}>  
                <Form.Text className="text-muted">Info: </Form.Text>
                <br/>
                <Form.Text className="text-muted">Percentual documents growth:  </Form.Text>
      </Col>
      <Col xs={4}>  
      <Form.Label>Growth Details:</Form.Label>
                  <Form.Group  controlId="growthspec"> 
                      <Form.Check  type="radio" inline label="Day"  value={'day'}      checked={form.growthspec === "day" }    name="growthspec"  onChange={(e) => updateForm({ growthspec: e.target.value })} />
                      <Form.Check  type="radio" inline label="Monthly"  value={'monthly'} checked={form.growthspec === "monthly"} name="growthspec"  onChange={(e) => updateForm({ growthspec: e.target.value })}/>
                      <Form.Check  type="radio" inline label="Year"    value={'year'}    checked={form.growthspec === "year" }   name="growthspec"  onChange={(e) => updateForm({ growthspec: e.target.value })} />
                  </Form.Group>
      </Col>
  </Row>
  <Row>
      <Col  xs={3}>
                  <Form.Group className="mb-3" controlId="average_fields_documents">
                    <Form.Label>Average Number of Fields per documents:</Form.Label>
                    <Form.Control type="text"  value={form.average_fields_documents  || ''} onChange={(e) => updateForm({ average_fields_documents: e.target.value })}/>
                  </Form.Group>   
       </Col> 
      <Col xs={6}>  
                <Form.Text className="text-muted">Info: </Form.Text>
                <br/>
                <Form.Text className="text-muted">How many fields contain each document  </Form.Text>
      </Col>
  </Row>
  <Row>
      <Col  xs={3}>
                  <Form.Group className="mb-3" controlId="index_size"> 
                    <Form.Label>Number of Index per document:</Form.Label>
                    <Form.Control type="text"  value={form.index_size  || ''} onChange={(e) => updateForm({ index_size: e.target.value })}/>
                  </Form.Group> 
        </Col> 
      <Col xs={6}>  
                <Form.Text className="text-muted">Info: </Form.Text>
                <br/>
                <Form.Text className="text-muted">How many index have the document </Form.Text>
      </Col>
  </Row>
  <Row>
      <Col  xs={3}>
                 <Form.Label className="text-primary">Number of documents in working set:</Form.Label>
                 <Form.Group className="mb-3" controlId="working_set">
                   <InputGroup className="mb-3">
                     <Form.Control type="text" value={form.working_set || ''} onChange={(e) => updateForm({ working_set: e.target.value })} />
                     <InputGroup.Text>%</InputGroup.Text>
                   </InputGroup>
                 </Form.Group> 
        </Col> 
      <Col xs={7}>  
                <Form.Text className="text-primary">Info: </Form.Text>
                <br/>
                <Form.Text className="text-muted">“Working set” is basically the amount of data and indexes that will be active/in use by your system at any given time. </Form.Text>
                <Form.Text className="text-muted">The key point is to ask yourself: do I have enough RAM for my working set? If the answer is: “I don’t know”, then get yourself to the position of knowing.</Form.Text>
      </Col>
  </Row>
             <Row>
               <Col xs={3}>
                 <Form.Label>Average Sizing of single document:</Form.Label>
                 <Form.Group className="mb-3" controlId="average_sizing_documents">
                   <InputGroup className="mb-3">

                     <Form.Control type="text" value={form.average_sizing_documents || ''} onChange={(e) => updateForm({ average_sizing_documents: e.target.value })} />
                     <InputGroup.Text>KiloByte</InputGroup.Text>
                   </InputGroup>
                 </Form.Group>
               </Col>
               <Col xs={6}>
                 <Form.Text className="text-muted">Info: </Form.Text>
                 <br />
                 <Form.Text className="text-muted">Haverage Sizie of document in KB </Form.Text>
               </Col>
             </Row>
             
             <Row>
               <Col xs={3}>
                  <Form.Label>Document Retention:</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control type="text"  value={form.document_retention  || ''} onChange={(e) => updateForm({ document_retention: e.target.value })}/>
                  </InputGroup> 
              </Col>
              <Col xs={3}>
                 <Form.Text className="text-muted">Info: </Form.Text>
                 <br />
                 <Form.Text className="text-muted">delete or move documents at a specific time </Form.Text>
               </Col>
               <Col xs={4}>
               <Form.Label>Document Retention Period:</Form.Label>
                  <Form.Group  controlId="document_retention_period"> 
                      <Form.Check  type="radio" inline label="Day"     value={'day'}      checked={form.document_retention_period === "day" }    name="document_retention_period"  onChange={(e) => updateForm({ document_retention_period: e.target.value })} />
                      <Form.Check  type="radio" inline label="Month"   value={'month'}    checked={form.document_retention_period === "month"}   name="document_retention_period"  onChange={(e) => updateForm({ document_retention_period: e.target.value })}/>
                      <Form.Check  type="radio" inline label="Year"    value={'year'}     checked={form.document_retention_period === "year" }   name="document_retention_period"  onChange={(e) => updateForm({ document_retention_period: e.target.value })} />
                  </Form.Group>
               </Col>

             </Row>

                 

                 

      
      </Tab>


      <Tab eventKey="crud" title="CRUD">

                  <Form.Label>Total Insert:</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control type="text"  value={form.total_insert  || ''} onChange={(e) => updateForm({ total_insert: e.target.value })}/>
                  </InputGroup> 

                  <Form.Label>Insert per:</Form.Label>
                  <Form.Group  controlId="insert_per"> 
                      <Form.Check  type="radio" inline label="second" value={'second'}  checked={form.insert_per === "second" } name="insert_per"  onChange={(e) => updateForm({ insert_per: e.target.value })} />
                      <Form.Check  type="radio" inline label="minute" value={'minute'}  checked={form.insert_per === "minute"}  name="insert_per"  onChange={(e) => updateForm({ insert_per: e.target.value })}/>
                      <Form.Check  type="radio" inline label="day"    value={'day'}     checked={form.insert_per === "day" }    name="insert_per"  onChange={(e) => updateForm({ insert_per: e.target.value })} />
                  </Form.Group>

                  <Form.Label>Total Update:</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control type="text"  value={form.total_update  || ''} onChange={(e) => updateForm({ total_update: e.target.value })}/>
                  </InputGroup> 

                  <Form.Label>Update per:</Form.Label>
                  <Form.Group  controlId="update_per"> 
                      <Form.Check  type="radio" inline label="second" value={'second'}  checked={form.update_per === "second" } name="update_per"  onChange={(e) => updateForm({ update_per: e.target.value })} />
                      <Form.Check  type="radio" inline label="minute" value={'minute'}  checked={form.update_per === "minute"}  name="update_per"  onChange={(e) => updateForm({ update_per: e.target.value })}/>
                      <Form.Check  type="radio" inline label="day"    value={'day'}     checked={form.update_per === "day" }    name="update_per"  onChange={(e) => updateForm({ update_per: e.target.value })} />
                  </Form.Group>

                  <Form.Label>Total Query:</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control type="text"  value={form.total_query  || ''} onChange={(e) => updateForm({ total_query: e.target.value })}/>
                  </InputGroup> 

                  <Form.Label>Query per:</Form.Label>
                  <Form.Group  controlId="query_per"> 
                      <Form.Check  type="radio" inline label="second" value={'second'}  checked={form.query_per === "second" } name="query_per"  onChange={(e) => updateForm({ query_per: e.target.value })} />
                      <Form.Check  type="radio" inline label="minute" value={'minute'}  checked={form.query_per === "minute"}  name="query_per"  onChange={(e) => updateForm({ query_per: e.target.value })}/>
                      <Form.Check  type="radio" inline label="day"    value={'day'}     checked={form.query_per === "day" }    name="query_per"  onChange={(e) => updateForm({ query_per: e.target.value })} />
                  </Form.Group>

                  <Form.Label>Concurrent write:</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control type="text"  value={form.concurrent_write  || ''} onChange={(e) => updateForm({ concurrent_write: e.target.value })}/>
                  </InputGroup> 

                  <Form.Label>Concurrent writen details:</Form.Label>
                  <Form.Group  controlId="concurrent_write_details"> 
                      <Form.Check  type="radio" inline label="Second"     value={'second'}      checked={form.concurrent_write_details === "second" }    name="concurrent_write_details"  onChange={(e) => updateForm({ concurrent_write_details: e.target.value })} />
                      <Form.Check  type="radio" inline label="Minute" value={'minute'}  checked={form.concurrent_write_details === "minute"}       name="concurrent_write_details"  onChange={(e) => updateForm({ concurrent_write_details: e.target.value })}/>
                      <Form.Check  type="radio" inline label="Day"    value={'day'}     checked={form.concurrent_write_details === "day" }   name="concurrent_write_details"  onChange={(e) => updateForm({ concurrent_write_details: e.target.value })} />
                  </Form.Group>

                  <Form.Label>Concurrent read:</Form.Label>
                  <InputGroup className="mb-3">
                    <Form.Control type="text"  value={form.concurrent_read  || ''} onChange={(e) => updateForm({ concurrent_read: e.target.value })}/>
                  </InputGroup> 

                  <Form.Label>Concurrent read details:</Form.Label>
                  <Form.Group  controlId="concurrent_read_details"> 
                      <Form.Check  type="radio" inline label="Second"     value={'second'}      checked={form.concurrent_read_details === "second" }    name="concurrent_read_details"  onChange={(e) => updateForm({ concurrent_read_details: e.target.value })} />
                      <Form.Check  type="radio" inline label="Minute" value={'minute'}  checked={form.concurrent_read_details === "minute"}       name="concurrent_read_details"  onChange={(e) => updateForm({ concurrent_read_details: e.target.value })}/>
                      <Form.Check  type="radio" inline label="Day"    value={'day'}     checked={form.concurrent_read_details === "day" }   name="concurrent_read_details"  onChange={(e) => updateForm({ concurrent_read_details: e.target.value })} />
                  </Form.Group>


          




      </Tab>

      <Tab eventKey= {form.usecase}  title=  {form.usecase} >

           {renderUseCase()}    

      </Tab>
    </Tabs>

    <p/><p/><p/><p/><p/><p/>
<Row>
      <Col>
         <button type="submit" className={styles.green_btn}>Save</button>
       </Col>
       <Col>
      <button type="submit" className={styles.red_btn}   variant="danger" onClick={() => logout()}>Logout</button>
      </Col>
      </Row>      
  </Form>
   
   
  
  
    
     
      <Row>
      <Col> 
        <div className="inlineForm__notif">

    

               {message && <h6  >{message}</h6>}
         </div>
     </Col>
      </Row>   
    
 
   
    
 {/* 
  
  <div  className={`alert alert-success 
          ${isShowingAlert ? 'alert-shown' : 'alert-hidden'}`}
          onTransitionEnd={() => setShowingAlert(false)}  >
         
         {message}
        
  </div> 
*/}
 

   
 


  </div>
)
}
