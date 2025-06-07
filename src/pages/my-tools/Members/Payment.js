import React, { useState } from 'react';
import '../styles/payment.css';
import { Toaster, toast} from 'sonner'
import Withdraw from '../Components/details'
import { Link } from 'react-router-dom';



const PaymentPage = () => {
  const [walletAddress, setWalletAddress] = useState('TPP7FcJphMHZDS4DBziH6EF7sfGR4Zp6im');
  const [phoneNumber, setphoneNumber] = useState('0748998726');
  const [tillNumber, setTillNumber] = useState('9538519');
  const [open, setOpen]=useState(false)



  const copyAddress = () => {
    navigator.clipboard.writeText(walletAddress).then(() => {
      toast.success('Wallet Address Copied!');
    });
  };
  const copyNumber = () => {
    navigator.clipboard.writeText(phoneNumber).then(() => {
      toast.success('Phone Number Copied!');
    });
  };
  const copyTill = () => {
    navigator.clipboard.writeText(tillNumber).then(() => {
      toast.success('Till Number Copied!');
    });
  };

  return (
    <div className='payment-page'>

    <div className="payment-container">
      <h2>Pay for your selected Bot.</h2>
      <div className="payment-content">
        <div className="input-group">
        <h3>Method 1. Pay via:</h3>
        <div className="network-info">
          <p><strong><span className='send-money'>M-PESA-</span> </strong> Send Money</p>
          
        </div>
          <label htmlFor="wallet-address">Phone Number:</label>
          <div className="wallet-input-container">
            <input 
              type="text" 
              id="wallet-address" 
              value={phoneNumber} 
              readOnly
              className="wallet-input"
            />
            <button className="copy-button" onClick={copyNumber}>Copy</button>
          </div>
        </div>
        
        <div className="button-container">
          <button className="mybutton" onClick={()=>{setOpen(true);}}>DOWNLOAD</button>
          {open && <Withdraw closeModal={setOpen}/>}
        </div>
      </div>



      <div className="payment-content">
        <div className="input-group">
        <h3>Method 2. Pay via:</h3>
        <div className="network-info">
       
          <p><strong><span className='send-money'> USDT TRANSFER-</span> </strong> Tron TRC-20</p>
          
        </div>
          <label htmlFor="wallet-address">Wallet Address:</label>
          <div className="wallet-input-container">
            <input 
              type="text" 
              id="wallet-address" 
              value={walletAddress} 
              readOnly
              className="wallet-input"
            />
            <button className="copy-button" onClick={copyAddress}>Copy</button>
          </div>
        </div>
        
        <div className="button-container">
          <button className="mybutton" onClick={()=>{setOpen(true);}}>DOWNLOAD </button>
          {open && <Withdraw closeModal={setOpen}/>}
        </div>
      </div>

      <div className="payment-content">
        <div className="input-group">
        <h3>Method 3. Pay via:</h3>
        <div className="network-info">
        
          <p><strong><span className='send-money'>M-PESA-</span></strong> Buy Goods</p>
          
        </div>
          <label htmlFor="wallet-address">TILL NUMBER</label>
          <div className="wallet-input-container">
            <input 
              type="text" 
              id="wallet-address" 
              value={tillNumber} 
              readOnly
              className="wallet-input"
            />
            <button className="copy-button" onClick={copyTill}>Copy</button>
          </div>
        </div>
        
        <div className="button-container">
          <button className="mybutton" onClick={()=>{setOpen(true);}}>DOWNLOAD </button>
          {open && <Withdraw closeModal={setOpen}/>}
        </div>
      </div>
      
      <Toaster richColors position='top-center'/>
    </div>
   
    <h4 className='notice-down-h4'> Skrill, Word Remit, BTC , LITECOIN & Others Available. </h4>
    <p className='notice-down'>Use HELP ICON on the bottom right incase you have a different Payment Method.</p>
    
    </div>
  );
};

export default PaymentPage;
