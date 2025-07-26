import React, { useState, useEffect } from "react";
import { FaSignal, FaSearch, FaHourglass } from "react-icons/fa";
import '../Styles/analysis.css';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

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
  const [priceColor, setPriceColor] = useState("white");
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

  // WebSocket connection
  useEffect(() => {
    if (ws) ws.close();

    const selectedSymbol = indices.find(index => index.label === selectedIndex)?.value;
    if (!selectedSymbol) return;

    const newWs = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=70505");
    let localPreviousPrice = null;

    newWs.onopen = () => {
      newWs.send(JSON.stringify({ ticks: selectedSymbol, subscribe: 1 }));
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.tick) {
        const price = data.tick.quote;
        const precision = selectedIndex.includes("(1s)") ? 2 :
                          selectedIndex.includes("75") || selectedIndex.includes("50") ? 4 :
                          selectedIndex.includes("10") || selectedIndex.includes("25") ? 3 : 2;
        const formattedPrice = price.toFixed(precision);
        const lastDigit = parseInt(formattedPrice.slice(-1));

        setPrices(prev => ({ ...prev, [selectedIndex]: price }));

        setLastDigits(prev => [lastDigit, ...prev.slice(0, 6)]);

        if (localPreviousPrice !== null) {
          if (price > localPreviousPrice) {
            setPriceColor("green");
          } else if (price < localPreviousPrice) {
            setPriceColor("red");
          }
        }
        localPreviousPrice = price;
      }
    };

    newWs.onerror = (err) => console.error("WebSocket Error:", err);
    setWs(newWs);

    return () => newWs.close();
  }, [selectedIndex]);

  // Analysis logic
  useEffect(() => {
    if (isAnalysisStarted && !isPaused && lastDigits.length >= 2 && !cooldownActive) {
      const latestDigit = lastDigits[0];
      const previousDigit = lastDigits[1];
      const isGoodMarket = latestDigit <= startingPrediction && previousDigit >= recoveryPrediction;

      if (isGoodMarket) {
        setMarketSignal("GOOD");
        setIsPaused(true);

        setTimeout(() => {
          setMarketSignal("NO SIGNAL");
          setCooldownActive(true);
          setTimeout(() => {
            setCooldownActive(false);
            setIsPaused(false);
          }, 20000); // cooldown
        }, 40000); // show GOOD signal
      } else {
        setMarketSignal("BAD");
      }
    }
  }, [lastDigits, startingPrediction, recoveryPrediction, isAnalysisStarted, cooldownActive]);

  // Fetch user data
  useEffect(() => {
    const fetchUserData = async () => {
      setLoading(true);
      const user = auth.currentUser;
      if (user) {
        const userDoc = await getDoc(doc(db, 'Users', user.uid));
        setUserData(userDoc.data());
        setLoading(false);
      }
    };

    const unsubscribe = auth.onAuthStateChanged(user => {
      if (user) fetchUserData();
    });

    return () => unsubscribe();
  }, []);

  const handleStartClick = () => {
    setIsAnalysisStarted(true);
    setMarketSignal("Scanning...");
  };

  const handleStopClick = () => {
    setIsAnalysisStarted(false);
    setMarketSignal("waiting for you");
  };

  const renderIcon = () => {
    if (marketSignal === "GOOD") {
      return <FaSignal style={{ color: "white", marginLeft: "10px", marginRight: "6px" }} />;
    } else if (marketSignal === "waiting for you") {
      return <FaHourglass style={{ color: "gray", marginLeft: "10px", marginRight: "6px" }} />;
    } else {
      return <FaSearch style={{ color: "orange", marginLeft: "10px", marginRight: "6px" }} />;
    }
  };

  return (
    <>
      {(userData.latestBot === "Market Sprinter"|| userData.latestBot === "Advanced Marvel" || userData.latestBot === "Sprinter Advanced" || userData.latestBot === "All") ? (
        <div className="container-fluid d-flex justify-content-center analysis-page">
          <div className="general-container">
            {/* Market Dropdown */}
            <div className="volatility-selection">
              <select className="form-select" value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}>
                {indices.map(index => (
                  <option key={index.value} value={index.label}>{index.label}</option>
                ))}
              </select>

              {prices[selectedIndex] !== undefined && (
                <div className="price-section">
                  <p style={{ color: priceColor }}>
                    {prices[selectedIndex].toFixed(selectedIndex.includes("(1s)") ? 2 : selectedIndex.includes("75") || selectedIndex.includes("50") ? 4 : selectedIndex.includes("10") || selectedIndex.includes("25") ? 3 : 2)}
                  </p>
                </div>
              )}
            </div>

            {/* Predictions */}
            <div className="predictions-section">
              <div>
                <select className="contract-select">
                  <option value="">Select Contract</option>
                  <option>OVER</option>
                  <option>UNDER</option>
                </select>
              </div>
              <div className="prediction-column">
                <label className="label-title">Starting Prediction:</label>
                <input className='prediction-input' type="text" value={startingPrediction} onChange={(e) => setStartingPrediction(e.target.value)} />
              </div>
              <div className="prediction-column">
                <label className="label-title">Recovery Prediction:</label>
                <input type="text" value={recoveryPrediction} onChange={(e) => setRecoveryPrediction(e.target.value)} />
              </div>
            </div>

            {/* Start/Stop Buttons */}
            <div className="button-section">
              <button className="start-btn" onClick={handleStartClick}>
                {isAnalysisStarted ? "Running..." : "FIND ENTRY POINT"}
              </button>
              <button className="stop-btn" onClick={handleStopClick}>STOP</button>
            </div>

            {/* Signal */}
            <div className="row justify-content-center">
              <div className="col-md-4 w-100">
                <div className="card signal-column text-white mb-3" style={{ backgroundColor: marketSignal === "GOOD" ? "green" : "#5f0707" }}>
                  <div className="card-header">
                    {renderIcon()}
                    {marketSignal === "waiting for you" ? "About to analyze" : marketSignal === "GOOD" ? "ENTRY FOUND" : "Searching Signal..."}
                  </div>
                  <div className="info-container">
                    {marketSignal === "waiting for you" ? (
                      <h5 className="card-title">Set Predictions & START</h5>
                    ) : marketSignal === "GOOD" ? (
                      <h5 className="card-title">Run the bot now!</h5>
                    ) : (
                      <>
                        <h4 className="card-title">{lastDigits.slice(0, 7).join(", ")}</h4>
                        <div className="loaderr"></div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="not-allowed">
          <p className="access-denied"><strong>ACCESS DENIED!</strong> Contact Admin for help.</p>
        </div>
      )}
    </>
  );
};

export default DerivPriceTracker;
