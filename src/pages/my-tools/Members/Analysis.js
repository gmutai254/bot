import React, { useState, useEffect } from "react";
import { FaSignal, FaSearch, FaHourglass } from "react-icons/fa"; // Importing the necessary icons
import '../Styles/analysis.css'
import { auth, db } from '../firebase';
import { doc, getDoc} from 'firebase/firestore';

const DerivPriceTracker = () => {
  const [prices, setPrices] = useState({});
  const [selectedIndex, setSelectedIndex] = useState("Volatility 10");
  const [ws, setWs] = useState(null);
  const [lastDigits, setLastDigits] = useState([]);
  const [marketSignal, setMarketSignal] = useState("waiting for you");
  const [startingPrediction, setStartingPrediction] = useState("");
  const [recoveryPrediction, setRecoveryPrediction] = useState("");
  const [isAnalysisStarted, setIsAnalysisStarted] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [cooldownActive, setCooldownActive] = useState(false);
  const [previousPrice, setPreviousPrice] = useState(null);  // Track previous price
  const [priceColor, setPriceColor] = useState("white"); // Track price color
  const [userData, setUserData] = useState("loading");
  const [loading, setLoading] = useState(true); 
 
  

  const indices = [
    { value: "R_10", label: "Volatility 10" },
    { value: "R_25", label: "Volatility 25" },
    { value: "R_50", label: "Volatility 50" },
    { value: "R_75", label: "Volatility 75" },
    { value: "R_100", label: "Volatility 100" },
    { value: "1HZ10V", label: "Volatility 10 (1s)" },
    { value: "1HZ25V", label: "Volatility 25 (1s)" },
    { value: "1HZ50V", label: "Volatility 50 (1s)" },
    { value: "1HZ75V", label: "Volatility 75 (1s)" },
    { value: "1HZ100V", label: "Volatility 100 (1s)" }
  ];

  // Establish WebSocket connection and get the market data (price)
  useEffect(() => {
    if (ws) {
      ws.close();
    }

    const selectedSymbol = indices.find(index => index.label === selectedIndex)?.value;
    if (!selectedSymbol) return;

    const newWs = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=70505");
    setWs(newWs);

    newWs.onopen = () => {
      newWs.send(
        JSON.stringify({
          ticks: selectedSymbol,
          subscribe: 1
        })
      );
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.tick) {
        const price = data.tick.quote;
        const lastDigit = parseInt(price.toFixed(selectedIndex.includes("(1s)") ? 2 : 3).slice(-1));

        setPrices(prevPrices => ({
          ...prevPrices,
          [selectedIndex]: price
        }));

        setLastDigits(prevDigits => {
          const updatedDigits = [lastDigit, ...prevDigits.slice(0, 6)];
          return updatedDigits;
        });

        // Compare price with previous price
        if (previousPrice !== null) {
          if (price > previousPrice) {
            setPriceColor("green"); // Set color to blue if price is higher
          } else if (price < previousPrice) {
            setPriceColor("red"); // Set color to orange if price is lower
          }
        }

        // Update previous price to current price for next comparison
        setPreviousPrice(price);
      }
    };

    newWs.onerror = (error) => {
      console.error("WebSocket Error:", error);
    };

    return () => newWs.close();
  }, [selectedIndex, previousPrice]);

  // Handle the logic for analysis when started
  useEffect(() => {
    if (isAnalysisStarted && !isPaused && lastDigits.length >= 2 && !cooldownActive) {
      const latestDigit = lastDigits[0];
      const previousDigit = lastDigits[1];

      const isGoodMarket = latestDigit <= startingPrediction && previousDigit >= recoveryPrediction;

      if (isGoodMarket) {
        setMarketSignal("GOOD");
        setIsPaused(true);

        // Display GOOD signal for 30 seconds
        setTimeout(() => {
          setMarketSignal("NO SIGNAL");  // Hide GOOD market after 30 seconds
          setCooldownActive(true); // Enable cooldown for 20 seconds
          setTimeout(() => {
            setCooldownActive(false); // Reset cooldown after 20 seconds
            setIsPaused(false); // Resume analysis
          }, 20000); // 20 seconds cooldown
        }, 30000); // 30 seconds for GOOD market display
      } else {
        setMarketSignal("BAD");
      }
    }
  }, [lastDigits, startingPrediction, recoveryPrediction, isAnalysisStarted, cooldownActive]);


   useEffect(() => {
        
  
        const fetchUserData = async () => {
          setLoading(true); // Set loading to true when starting to fetch data
          const user = auth.currentUser;
          if (user) {
            // Set the user's email when logged in
            const userDoc = await getDoc(doc(db, 'Users', user.uid));
            setUserData(userDoc.data());
            setLoading(false); 
            
          }
        };


          const unsubscribe = auth.onAuthStateChanged(user => {
                if (user) {
                  fetchUserData();
                  
                } 
              });

              return () => unsubscribe();
       
      },[]);

  const handleStartClick = () => {
    setIsAnalysisStarted(true);
    setMarketSignal("Scanning...");
  };

  const handleStopClick = () => {
    setIsAnalysisStarted(false);
    setMarketSignal("waiting for you");
  };

  // Icon logic for headers
  const renderIcon = () => {
    if (marketSignal === "GOOD") {
      return <FaSignal  style={{ color: "white", marginLeft: "10px" , marginRight: "6px"}} />;
    } else if (marketSignal === "waiting for you") {
      return <FaHourglass style={{ color: "gray", marginLeft: "10px", marginRight: "6px" }} />;
    } else {
      return <FaSearch style={{ color: "orange", marginLeft: "10px" , marginRight: "6px"}} />;
    }
  };

  return (
    <> 
    {(userData.latestBot === "Market Sprinter" || userData.latestBot === "Sprinter Advanced" || userData.latestBot === "All")?(
    <div className="container-fluid d-flex justify-content-center analysis-page ">
      <div className="general-container">
       

        {/* Market Selection Dropdown */}
        <div className="volatility-selection">
          <select className="form-select" value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}>
            {indices.map(index => (
              <option key={index.value} value={index.label}>{index.label}</option>
            ))}
          </select>
         
          {/* Displaying Price Always */}
        {prices[selectedIndex] !== undefined && (
          <div className="price-section">
            <p  style={{ color: priceColor }}>
              {prices[selectedIndex].toFixed(selectedIndex.includes("(1s)") ? 2 : 3)}
            </p>
          </div>
        )}
        </div>

        

        {/* Starting Prediction and Recovery Prediction Inputs */}
        <div className="predictions-section">
          {/* Starting Prediction */}
          <div>
          <select className="contract-select">
            <option value="">Select Contract</option>
            <option>OVER</option>
            <option>UNDER</option>
         </select>
            
          </div>
          <div className="prediction-column">
           <label className="label-title">Starting Prediction:</label>
            <input className='prediction-input'type="text" value={startingPrediction} onChange={(e) => setStartingPrediction((e.target.value))} />
            </div>
          {/* Recovery Prediction */}
          <div className="prediction-column">
            <label className="label-title">Recovery Prediction:</label>
            <input type="text" value={recoveryPrediction} onChange={(e) => setRecoveryPrediction((e.target.value))} />
          </div>
        </div>

        {/* Start and Stop Buttons */}
        <div className="button-section">
          <button className="start-btn" onClick={handleStartClick}>{isAnalysisStarted? ("Running..."):("FIND ENTRY POINT")}</button>
          <button className="stop-btn" onClick={handleStopClick}>STOP</button>
        </div>

        <div className="row justify-content-center">
          {/* Signal Column */}
          <div className="col-md-4 w-100">
            <div className="card signal-column text-white mb-3" style={{ backgroundColor: marketSignal === "GOOD" ? "green" : marketSignal === "BAD" ? "red" : "red" }}>
              <div className="card-header">
                <span className="mr-2">
                {renderIcon()}
                  {marketSignal === "waiting for you" ? "About to analyze" : marketSignal === "GOOD" ? "ENTRY FOUND" : "Searching Entry..."}
                </span>
              
              </div>
              <div className="info-container">
                {marketSignal === "waiting for you" ? (
                  <h5 className="card-title">Set Predictions & START</h5>
                ) : marketSignal === "GOOD" ? (<>
                  <h5 className="card-title">Run the bot now!</h5>
                  </>
                ) : (
                  <>
                    <h4 className="card-title">{lastDigits.slice(0, 7).join(", ")}</h4>
                    <div className="loaderr">
                      {/*<div className="progress-bar progress-bar-striped progress-bar-animated" role="progressbar" style={{ width: "100%" }}>Scanning...</div>*/}
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>):(<div className="not-allowed" >
                <p className="access-denied"> <strong>ACCESS DENIED!</strong> You need to have Market Sprinter Bot to access its tool.</p>
                <p>Your Bot is :<span className="bot-name">{userData.latestBot}</span> </p>
                <a href="https://wa.me/254748998726?text=How%20much%20discount%20for%20the%20Market%20Sprinter%20Bot%20and%20Tool." className="mybutton">Get at a Discount</a>
            </div>)}
    </>
  );
};

export default DerivPriceTracker;
