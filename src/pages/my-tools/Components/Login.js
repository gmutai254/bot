import React , { useState, useEffect } from 'react'
import '../Styles/auth.css';
import { Link } from 'react-router-dom';
import { signInWithEmailAndPassword } from "firebase/auth";
import {auth} from '../firebase'
import Dashboard from '../Members/Dashboard'
import { onAuthStateChanged } from 'firebase/auth';


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
  return (
    <>
    {user?<Dashboard/>:
    <div className='Auth-section'>
      <h3>360 ENTRY TOOL - NO ANALYSIS</h3>
      <p className='notice-text'>
      Get LIFETIME ACCESS, a bot that is compatible with the Tool & Guide on how to use it Profitably 
       @ <span>$45 / KES 5,000</span> .<br></br>
      <a href='https://wa.me/254748998726?text=Hello%20360%20Admin.'>
      Contact Admin</a></p>
      <h4>Already a Member? <span>Login</span></h4>
        <div className='login-area'>
          
           <div className='login-form'>
            
            <form action="#" onSubmit={handleLogin}>
            <div className="input-box">
                <i className='bx bxs-envelope'></i>
                <label >Email<span className='required-mark'>*</span></label>
                <input type="email" placeholder="Enter Your Email" required 
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
            </div>
            <div className="input-box">
                <i className='bx bxs-lock-alt ' ></i>
                <input type="password" placeholder="Enter Your Password" required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                />
                
                <label>Password <span className='required-mark'>*</span></label>
              
            </div>
            <div className="forgot-section">
               
                <span><Link to='https://register.360tradinghub.co.ke/reset' className='reset-link'>Reset Password</Link></span>
            </div>
            <button className="mybutton">Login</button>
        </form>

            </div> 
        </div>
    </div>}
    </>
  )
}

export default Login