import React, {useRef, useState } from "react";
import "../Components/Toolpay.css";
import { FaCopy, FaWallet } from "react-icons/fa";
import Withdraw from "../Components/details";

const paymentMethods = [
  "M-PESA - Send Money",
  "M-PESA - Till Number",
  "USDT,BTC,LTC -Crypto",
  "Skrill",
  "Mukuru",
  "Eversend",
  "World Remit",
  "Western Union",
  "Other - Contact Admin",
];

const BotPay = () => {
  const [selectedMethod, setSelectedMethod] = useState("");
  const [open, setOpen]= useState(false)
  const email = "kipyegonmutai148@gmail.com"; // your hidden email
  const inputRef = useRef(null);
  const handleChange = (e) => {
    setSelectedMethod(e.target.value);
  };
  

  const walletAddresses = {
  USDT: "TPP7FcJphMHZDS4DBziH6EF7sfGR4Zp6im",
  USDC: "0x8b91e12ecf6e86eaeb6bd9e65c76f295988ee2a9",
  BTC: "1GsE1KbnGAgUV3somxuTBKVc3hjtGgzdrn",
  LITECOIN: "0x8b91e12ecf6e86eaeb6bd9e65c76f295988ee2a9"
};

const networkTypes = {
  USDT: "Tron (TRC-20)",
  USDC: "BNB SmartChain (BEP-20)",
  BTC: "Bitcoin Network",
  LITECOIN: "BNB SmartChain (BEP-20)"
};


  const [selectedAsset, setSelectedAsset] = useState("USDT");
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(walletAddresses[selectedAsset]);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };
  
  const handleMailCopy = () => {
    navigator.clipboard.writeText(email).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000); // reset "copied" state
    });
  };
  return (
    <div className="tool-container">
      <h2>Select Payment Method</h2>
      <select onChange={handleChange} value={selectedMethod}>
        <option value="">-- Choose Method  --</option>
        {paymentMethods.map((method) => (
          <option key={method} value={method}>
            {method}
          </option>
        ))}
      </select>

      {/* Dynamic Display Section */}
      {selectedMethod && (
        <div className="payment-details">
          
          {selectedMethod === "M-PESA - Send Money" && (
            <div className="payment-box">
              Send to Phone Number:
              <h2> 0748 998 726</h2>
              <>
              <a className="confirmation-button" onClick={()=>{setOpen(true)}}>I HAVE PAID</a>
                {open && <Withdraw closeModal={setOpen}/>}
              </>
            </div>
            
          )}
          {selectedMethod === "M-PESA - Till Number" && (
            <div className="payment-box">
              Use Till Number: 
              <h2> 9538519</h2>
             <>
              <a className="confirmation-button" onClick={()=>{setOpen(true)}}>I HAVE PAID</a>
                {open && <Withdraw closeModal={setOpen}/>}
              </>
            </div>
          )}
          {selectedMethod === "USDT,BTC,LTC -Crypto" && (
            <div className="payment-box">
                <div className="wallet-container">
      <h4 className="wallet-subheading">
        <FaWallet /> Copy Wallet Address
      </h4>

      <form className="wallet-form">
        <label className="form-label">Choose Crypto Asset</label>
        <select
          className="form-select"
          value={selectedAsset}
          onChange={(e) => setSelectedAsset(e.target.value)}
        >
          {Object.keys(walletAddresses).map((asset) => (
            <option key={asset} value={asset}>
              {asset}
            </option>
          ))}
        </select>
      </form>

      <div className="wallet-card">
        <h5 className="wallet-card-title">{selectedAsset} Address</h5>
        <p className="wallet-address">{walletAddresses[selectedAsset]}</p>
        <button className="wallet-copy-button" onClick={handleCopy}>
          <FaCopy /> <span>{copied ? "Copied!" : "Copy Address"}</span>
        </button>
        <p className="wallet-network">Network: {networkTypes[selectedAsset]}</p>
        <>
              <a className="confirmation-button" onClick={()=>{setOpen(true)}}>I HAVE PAID</a>
                {open && <Withdraw closeModal={setOpen}/>}
              </>
      </div>
      
    </div>
            </div>
          )}
          {selectedMethod === "Skrill" && (
            <div className="payment-box">
              Skrill Email:{" "}
              <div className="email-container">
      {/* Hidden input field just in case you want to show it in forms */}
                  <input
                    type="text"
                    value={email}
                    ref={inputRef}
                    readOnly
                    style={{ display: "none" }}
                  />

                  <button className="copy-button" onClick={handleMailCopy}>
                    <FaCopy style={{ marginRight: "5px" }} />
                    {copied ? "Copied!" : "Copy Email"}
                  </button>
                </div>
             <>
              <a className="confirmation-button" onClick={()=>{setOpen(true)}}>I HAVE PAID</a>
                {open && <Withdraw closeModal={setOpen}/>}
              </>
            </div>
          )}
          {selectedMethod === "Mukuru" && (
            <div className="payment-box">
              
              <a href="https://wa.me/254748998726?text=Hi,%20I%20want%20to%20make%20Payment%20with%20Mukuru.">Request Details</a>
            </div>
          )}
          {selectedMethod === "Eversend" && (
            <div className="payment-box">
               <a href="https://wa.me/254748998726?text=Hi,%20I%20want%20to%20make%20Payment%20with%20Eversend.">Request Details</a>
            </div>
          )}
          {selectedMethod === "World Remit" && (
            <div className="payment-box">
              <a href="https://wa.me/254748998726?text=Hi,%20I%20want%20to%20make%20Payment%20with%20World%20Remit.">Request Details</a>
            </div>
          )}
          {selectedMethod === "Western Union" && (
            <div className="payment-box">
              <a href="https://wa.me/254748998726?text=Hi,%20I%20want%20to%20make%20Payment%20with%20Western%20Union.">Request Details</a>
            </div>
          )}
          {selectedMethod === "Other - Contact Admin" && (
            <div className="payment-box">
              <a href="https://wa.me/254748998726?text=Hi%20Admin,%20I%20have%20a%20different%20Payment%20Method">WhatsApp Admin</a>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default BotPay;
