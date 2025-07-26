import React , { useState, useEffect } from 'react'
import '../Styles/auth.css';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from '../firebase'
import Dashboard from '../Members/Dashboard'
import { onAuthStateChanged } from 'firebase/auth';
import Modal from './myModal';
import ToolPay from './ToolPay';


const Login =() =>{
         const [email, setEmail] = useState("");
         const [password, setPassword] = useState("");

         const [user, setUser] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);
      } else {
        setUser(null);
      }
    });

    return () => unsubscribe(); // Clean up on unmount
  }, []);


  
       
     const handleLogin = async (e) => {
        e.preventDefault();

        try {
          await signInWithEmailAndPassword(auth, email, password);
          
        } catch (error) {
          alert(error.message);
        }
      };
       const [modalContent, setModalContent] = useState(null);
      
       
        const closeModal = () => setModalContent(null);
  return (
      <>
          {user ? (
              <Dashboard />
          ) : (
              <div className='Auth-section'>
                  <h3>360 ENTRY TOOL - NO ANALYSIS</h3>
                  <p className='notice-text'>
                      Marvel/Sprinter i.e Over/Under Tool  @<span>45 USD/ KES 5,000</span><br/>
                      EVEN / ODD A.I TOOL  @<span>50 USD/ KES 5,500</span>
                      <br></br>
                      <a onClick={() => setModalContent(<ToolPay />)}>Make Payment</a>
                      
                  </p> 
                  <h4 className='help-link'>Need help? <a href='https://wa.me/254748998726?text=Hi,%20I%20need%20help%20in%20making%20Payment.'>Click here</a> </h4>
                <div className="form-container">
                  
                  <p className="title">Member Login</p>
                  <form className='form' action='#' onSubmit={handleLogin}>
                    <input type="email" className="input" placeholder="Email" required  
                    value={email}
                     onChange={(e) => setEmail(e.target.value)}
                     />
                    <input type="password" className="input" placeholder="Password" required 
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}/>
                    <button className="form-btn">Log in</button>
                    <p className="page-link">
                      <a href='https://register.360tradinghub.co.ke/reset' className="page-link-label">Forgot Password?</a>
                    </p>
                  </form>
                  

                </div>
                 {modalContent && <Modal onClose={closeModal}>{modalContent}</Modal>} 
              </div>
              
              
          )}
      </>
  );
}

export default Login;