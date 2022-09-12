import React, {  useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import Cookies from "universal-cookie";
import styles from "./utils/login/styles.module.css";



//https://www.freecodecamp.org/news/how-to-build-a-fullstack-authentication-system-with-react-express-mongodb-heroku-and-netlify/

export default function Login() {

  const cookies = new Cookies();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState(null);
  // set configurations
              const configuration = 
                {
                  method: "post",
                  url: "/login",
                  data: {
                          email,
                          password,
                        },
                };
       
  const handleSubmit = (e) => {
          
            e.preventDefault();
       
                     axios(configuration)
                     .then(function (resp) 
                     {
                          // set the cookie
                          cookies.set("TOKEN", resp.data.token, {
                            path: "/",
                          });

                        //  setMessage("You Are Logged in Successfully !");

						if (resp.data.type =="INT"){
						//	console.log("resp.data.type"+ resp.data.type);        

                            // redirect MONGODB user
						  window.location.href="/project_list_int";
						}
						else{  // or redirect CUSTOMER user

						//	console.log("resp.data.type"+ resp.data.type);  
						//	console.log("resp.data.type"+ resp.data.project);  

						//	window.location.href="/project_edit/"+resp.data.project;
						window.location.href="/project_list_ext";
							
						}
						 

                       // }

                    }).catch(function (error) {
                      console.log(error.response.status +" "+ error.response.data.message);                 
                      setMessage(error.response.data.message );          
                    });

  } // fine handleSubmit 
    
    return (

<div className={styles.login_container}>
			<div className={styles.login_form_container}>
				<div className={styles.left}>
					<form className={styles.form_container} onSubmit={(e)=>handleSubmit(e)}>
						<h1>Login</h1>
						<input
							type="email"
							placeholder="Email"
							name="email"
						  onChange={(e) => setEmail(e.target.value)}
							value={email}
							required
							className={styles.input}
						/>
						<input
							type="password"
							placeholder="Password"
							name="password"
              onChange={(e) => setPassword(e.target.value)}
							value={password}
							required
							className={styles.input}
						/>
						{message && <div className={styles.error_msg}>{message}</div>}
						<button type="submit" className={styles.green_btn}   onClick={(e) => handleSubmit(e)}>
							Sign In
						</button>
           
					</form>
		  <button type="submit"  className={styles.blu_btn}   onClick={(e) => {e.preventDefault();  window.location.href='/ResetPasswordRequest';}} >Change Password</button>
				</div>
				<div className={styles.right}>
					<h6>MongoDB SA ?</h6>
					<Link to="/register"> 
						<button type="button" className={styles.white_btn}>
							Sign Up
						</button>
					</Link>
				</div>
			</div>
		</div>
  
    )// fine return
}