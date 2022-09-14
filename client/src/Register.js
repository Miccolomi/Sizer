import React, {  useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import styles from "./utils/register/styles.module.css";
import InputGroup from 'react-bootstrap/InputGroup';
import Form from 'react-bootstrap/Form';



export default function Register() 

{

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState(null);

	


           // set configurations
    const configuration = 
    {
      method: "post",
      url: "/register",
      data: {
             email: email + "@mongodb.com",
             password : password, 
            },
    };
               
    const handleSubmit = (e) => {
            
      e.preventDefault();

	    // controllo supplementare per la mail
	if (email.indexOf('@') > -1)
	{
		return setMessage("Only name.surname are valid input for username");
	}

	
    
    // make the API call
    axios(configuration)
      .then((result) => {
        
        setMessage("Success ! You can login now");
       // setRegister(true);

      })
      .catch((error) => {

        setMessage(error.response.data.message );
        console.error(error.response.data.message);
        
       // error = new Error();
      });

          } // fine handleSubmit 
    

    return (

      <>
     

<div className={styles.signup_container}>
			<div className={styles.signup_form_container}>
				<div className={styles.left}>
					<h1> </h1>
					<Link to="/">
						<button type="button" className={styles.white_btn}>
							Sign In
						</button>
					</Link>
				</div>
				<div className={styles.right}>
					<form className={styles.form_container} onSubmit={(e)=>handleSubmit(e)}>
						<h1>MongoDB User</h1>
    {/*   
            <input
							type="text"
							placeholder="First Name"
							name="firstName"
							onChange={handleChange}
							value={data.firstName}
							required
							className={styles.input}
						/>
						<input
							type="text"
							placeholder="Last Name"
							name="lastName"
							onChange={handleChange}
							value={data.lastName}
							required
							className={styles.input}
						/>
         
						<input
							type="email"
							placeholder="Email"
							name="email"
              onChange={(e) => setEmail(e.target.value)}
							value={email}
							required
							className={styles.input}
						/>
*/}   

<InputGroup  className={styles.input}>
        <Form.Control
         placeholder="MongoDB User Name"
        
		  onChange={(e) => setEmail(e.target.value )}
		  value={email}
		  required
		  className={styles.input}
        />
        <InputGroup.Text  id="basic-addon2">@mongodb.com</InputGroup.Text>
      </InputGroup>


						<input
							type="password"
							placeholder="Password"
							name="password"
              onChange={(e) => setPassword(e.target.value)}
							value={password}
							required
							className={styles.input}
						/>
						{message && <div>{message}</div>}
						<button type="submit" className={styles.green_btn}>
							Sign Up
						</button>
					</form>
				</div>
			</div>
		</div>

        </>
    );
        

};

