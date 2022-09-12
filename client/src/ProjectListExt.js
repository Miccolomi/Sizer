import React, { Component, useState  } from 'react';
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
       
       
    </tr>
)


export default class TodosList extends Component {

    

    constructor(props) { 
        super(props);
        this.state = {todos: []};

    }


    componentDidMount() {

       

        var user_logon ="vuoto" 
        var Buffer = require('buffer/').Buffer;
        console.log("---SICUREZZA CHECK----SONO IN PROJECTLIST EXT e TOKEN TROVATO: "+ token); 

      try{
        user_logon = JSON.parse(Buffer.from(token.split('.')[1], 'base64').toString()).userEmail;
        console.log("---SICUREZZA CHECK----SONO IN PROJECTLIST EXT e utente che ho trovato è: "+ user_logon);
      }
      catch(error){
        console.log("---SICUREZZA CHECK----SONO IN PROJECTLIST EXT e non ho trovato utente connesso !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!" + error);  
        return;
      }


            
        const configuration = { 
          method: "post", 
          url: "/project_list_ext",
          headers: {
            Authorization: `Bearer ${token}`,
          },
           params: { user: user_logon } // la mail dell'utente mongodb 
        };

       

       axios(configuration)
            .then(response => {

             

                if(response.data){   // dovrei controllare la lunghezza tramite lenhgt di response

                this.setState({ todos: response.data });
           
            }

            })
            .catch(function (error){

                console.log("ERRORE IN PROJECT LIST EXT: " + error.message);

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
                            <th>Use Case</th>
                            <th>Architecture</th>
                            <th>Customer Email</th> 
                            <th>Edit</th>
                        </tr>
                    </thead>
                    <tbody align="center">
                        { this.todoList() }
                    </tbody>
                </table>
                <div align="left">
                       
                 </div>
                <div align="right">
                     
                </div>
            </div>

        ) // fine return
    } // fine render





}