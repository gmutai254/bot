import React, { useState } from 'react'
import '../styles/details.css'
import { Link } from 'react-router-dom';
import { FaCloudDownloadAlt , FaExclamationTriangle } from "react-icons/fa";





function Withdraw ({closeModal}){
    const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  
  const[pass, setPass]= useState(false);
  const[amount, setAmount]=useState("");
  


  
  const handleButtonClick = () => {
    setLoading(true);
    setErrorMessage('');
    
  
    // Simulate a 5-second loading delay
    setTimeout(() => {
      setLoading(false);
      if(amount!=="0111424254"){
        setErrorMessage("ERROR! Payment not Found.");
      }else{
        setErrorMessage("Thankyou for trusting Us.");
        setPass(true);
      }
      if(amount===""){
        setErrorMessage("M-Pesa Number should not be Empty.");
      }
      
    }, 5000);
  };

 
  return (
    <div className="modalBackground">
      <div className="modalContainer ">
        <div className="titleCloseBtn">
          
          <button onClick={() => closeModal(false)}> X </button>
        </div>
        <div className="body">
          {errorMessage ? (
            <div className="navigationArea">
              <div className="navMessage">
                {errorMessage}
                {pass?(<><Link to ='https://www.mediafire.com/file/xbv5deue27cp2ih/THE+MARKET+SPRINTER+BOT+By+{www.360tradinghub.co.ke}.xml/file'><button>Click to Download</button></Link></>):(
                <p>
                 <FaExclamationTriangle /> Please make payment to ENABLE you download Bot + TOOL LOGINS  & Guide. Contact Admin using WhatsAp icon below incase of any challenge.
                </p>
                )}
              </div>
            </div>
          ) : (
            <>
              {loading ? (
                <h3 className="processing ">Fetching Payment...<span className='loading-spinner'></span></h3>
                
              ) : (
                <div className='mpesaform-section'>
                  
                  <form>
                    <label className=''>Paid via M-PESA?</label>
                    <input
                      type="text"
                      name="email"
                     value={amount}
                      placeholder=" M-Pesa Number Used"
                      required
                    onChange={(e)=>setAmount(e.target.value)}
                    />
                    <button onClick={handleButtonClick} className='verify-button'>Verify & Download <FaCloudDownloadAlt /></button>
                    <h3 className='other-title'>Used a Different Method?</h3>
                    <Link to='https://wa.link/bwxptz' className='whats-navigate'>Receive it Here  </Link>
                  </form>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}


export default Withdraw