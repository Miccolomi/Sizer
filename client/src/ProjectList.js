import React, { Component, useState  } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Cookies from "universal-cookie";
import styles from "./utils/projectlist/styles.module.css";


const cookies = new Cookies();
const token = cookies.get("TOKEN");




//https://codingthesmartway.com/the-mern-stack-tutorial-building-a-react-crud-application-from-start-to-finish-part-3/

const Todo = props => (
    <tr>
        <td>{props.todo.customer}</td>
        <td>{props.todo.project}</td>
        <td>{props.todo.usecase}</td>
        <td>{props.todo.projectarchitecture}</td>
        <td>{props.todo.email}</td>
        <td>
            <button type="submit"  className={styles.green_btn}   onClick={(e) => {e.preventDefault();  window.location.href="/project_edit/"+props.todo._id;}} >Edit</button>
        </td>
        <td>
        <button type="submit" className={styles.red_btn}  onClick={() =>  { deleteRecord(props.todo._id);   } }>Delete</button>
        </td>
    </tr>
)



        // This method will delete a record
        function deleteRecord(id) {


          console.log("SONO IN DELETE- ID da cancellare " + id);
        
          const configuration_delete = {
           method: "DELETE",
           url: "/project_delete",
           headers: {
             Authorization: `Bearer ${token}`,
           },
            params: { id: id }
         };
        
         console.log("SONO IN DELETE- ok config " + id);
        
          axios(configuration_delete)
             .then((result) => {
        
              console.log("SONO IN DELETE- sono in result - record cancellati: " + JSON.stringify(result.data.deletedCount)) ;

               // redirect user to the auth page
               window.location.href = "/project_list";
              
            //  this.setState({ todos: result.data });
      
               //  const newRecords = result.data;
             //    console.log("SONO IN DELETE- sono in result- attribuisco nuovo set di records -- FATTO" + newRecords);
        
             })
        
             .catch(function (error){
              console.log(error);

              if(401 == error.response.status) {
                window.location.href = "/";
             }

          })
         };// fine delete

export default class TodosList extends Component {

  

    constructor(props) {
        super(props);
        this.state = {todos: []};
    }

    
    componentDidMount() {

      
        var Buffer = require('buffer/').Buffer;
        const user_logon = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).userEmail;
        console.log("_____________user_logon per la query_______________"+ user_logon);
        
        const configuration = {
         
          method: "get",
          url: "/project_list",
          headers: {
            Authorization: `Bearer ${token}`,
          },
           params: { user: user_logon }
        };

     
       axios(configuration)
            .then(response => {
                this.setState({ todos: response.data });
            })
            .catch(function (error){

                console.log(error);

                if(401 == error.response.status) {
                  window.location.href = "/";
               }
            })
    }

    todoList() {
        return this.state.todos.map(function(currentTodo, i){
            return <Todo todo={currentTodo} key={i} />;
        })
    }


    render() {
        return (
            <div>
                <h3>Your Project List</h3>
                <table className="table table-striped" style={{ marginTop: 20 }} >
                    <thead  align="center">
                        <tr>
                            <th>Customer</th>
                            <th>Project</th>
                            <th>UseCase</th>
                            <th>Architecture</th>
                            <th>Customer Email</th>
                            <th>Edit</th>
                            <th>Delete</th>

                        </tr>
                    </thead>
                    <tbody align="center">
                        { this.todoList() }
                    </tbody>
                </table>
                <div align="center">
                         <button type="submit"  className={styles.blu_btn}   onClick={(e) => {e.preventDefault();  window.location.href='/auth';}} >New Project</button>
                  
                  </div>
                 
            </div>

          
        )
    
    }





}