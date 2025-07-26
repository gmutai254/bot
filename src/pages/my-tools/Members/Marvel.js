import React, { useEffect, useState, useMemo } from 'react';
import '../Styles/marvel.css';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const Marvel = () => {
  const [selectedIndex, setSelectedIndex] = useState("Volatility 10 (1s)");
  const [prices, setPrices] = useState({});
  const [lastDigits, setLastDigits] = useState([]);
  const [startingPrediction, setStartingPrediction] = useState('');
  const [attemptPrediction, setAttemptPrediction] = useState('');
  const [recoveryPrediction, setRecoveryPrediction] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [entryFound, setEntryFound] = useState(false);
  const [inCooldown, setInCooldown] = useState(false);
  const [ws, setWs] = useState(null);
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

  // ✅ WebSocket for real-time price fetch
  useEffect(() => {
    if (ws) ws.close();

    const selectedSymbol = indices.find(index => index.label === selectedIndex)?.value;
    if (!selectedSymbol) return;

    const newWs = new WebSocket("wss://ws.binaryws.com/websockets/v3?app_id=70505");
    let localPreviousPrice = null;

    newWs.onopen = () => {
      newWs.send(JSON.stringify({
        ticks: selectedSymbol,
        subscribe: 1,
      }));
    };

    newWs.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.tick) {
        const price = data.tick.quote;
        const precision = selectedIndex.includes("(1s)") ? 2 :
                          selectedIndex.includes("75") || selectedIndex.includes("50") ? 4 :
                          selectedIndex.includes("10") || selectedIndex.includes("25") ? 3 : 2;
        const lastDigit = parseInt(price.toFixed(precision).slice(-1));

        setPrices(prev => ({ ...prev, [selectedIndex]: price }));

        setLastDigits(prev => [lastDigit, ...prev.slice(0, 6)]);
      }
    };

    newWs.onerror = err => console.error("WebSocket error:", err);

    setWs(newWs);
    return () => newWs.close();
  }, [selectedIndex]);

  // ✅ Handle cooldown & entry lifecycle
  useEffect(() => {
    if (!entryFound) return;

    const entryTimer = setTimeout(() => {
      setEntryFound(false);
      setInCooldown(true);
      setTimeout(() => setInCooldown(false), 30000); // 30s cooldown
    }, 40000); // 40s signal active

    return () => clearTimeout(entryTimer);
  }, [entryFound]);

  const toggleAnalysis = () => {
    setAnalyzing((prev) => {
      if (prev) setEntryFound(false);
      return !prev;
    });
  };

  // ✅ Entry Detection (moved out of useMemo to avoid side effects inside memo)
  useEffect(() => {
    if (!analyzing || entryFound || inCooldown) return;
    if (
      attemptPrediction === '' || recoveryPrediction === '' ||
      startingPrediction === '' || lastDigits.length < 3
    ) return;

    const latest = lastDigits[0];
    const prev = lastDigits[1];
    const prev2 = lastDigits[2];

    const attempt = parseInt(attemptPrediction);
    const recovery = parseInt(recoveryPrediction);
    const starting = parseInt(startingPrediction);

    if (!isNaN(attempt) && !isNaN(recovery) && !isNaN(starting)) {
      if (latest > 6 && prev <= 2 && prev2 <= recovery) {
        setEntryFound(true);
      }
    }
  }, [analyzing, lastDigits, attemptPrediction, recoveryPrediction, startingPrediction, inCooldown, entryFound]);

  // ✅ Display Message
  const displayStatus = useMemo(() => {
    if (!analyzing) return {
      title: 'ABOUT TO ANALYZE',
      message: 'Set Predictions to check signal',
    };

    if (entryFound) return {
      title: 'ENTRY FOUND',
      message: 'Run Marvel Bot NOW',
    };

    return {
      title: 'SEARCHING ENTRY',
      message: 'Please wait for Signal',
    };
  }, [analyzing, entryFound]);

  const analysisClass = useMemo(() => {
    switch (displayStatus.title) {
      case 'ABOUT TO ANALYZE': return 'analysis-display golden';
      case 'SEARCHING ENTRY': return 'analysis-display red';
      case 'ENTRY FOUND': return 'analysis-display green';
      default: return 'analysis-display';
    }
  }, [displayStatus]);

  // ✅ Firebase user fetch
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

  return (
    <>
      {(userData.latestBot === "Market Sprinter" || userData.latestBot === "Sprinter Advanced" || userData.latestBot === "All" || userData.latestBot === "Advanced Marvel") ? (
        <div className="marvel-container">
          <h2>Advanced Marvel Tool</h2>

          {/* Index Selector */}
          <div className="vol-selection">
            <select value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}>
              {indices.map(index => (
                <option key={index.value} value={index.label}>{index.label}</option>
              ))}
            </select>

            {prices[selectedIndex] !== undefined && (
              <h4>
                {prices[selectedIndex].toFixed(selectedIndex.includes("(1s)") ? 2 : 3)}
              </h4>
            )}
          </div>

          {/* Predictions Input */}
          <div className="input-row">
            <div className="input-group">
              <label htmlFor="startingPrediction">Starting Prediction</label>
              <input
                id="startingPrediction"
                type="text"
                placeholder='UNDER'
                maxLength="1"
                value={startingPrediction}
                onChange={(e) => setStartingPrediction(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="attemptPrediction">Attempt Prediction</label>
              <input
                id="attemptPrediction"
                type="text"
                placeholder='UNDER'
                maxLength="1"
                value={attemptPrediction}
                onChange={(e) => setAttemptPrediction(e.target.value)}
              />
            </div>
            <div className="input-group">
              <label htmlFor="recoveryPrediction">Recovery Prediction</label>
              <input
                id="recoveryPrediction"
                type="text"
                placeholder='OVER'
                maxLength="1"
                value={recoveryPrediction}
                onChange={(e) => setRecoveryPrediction(e.target.value)}
              />
            </div>
          </div>

          {/* Analyze Button */}
          <button
            className={`analyze-btn ${analyzing ? 'stop' : 'start'}`}
            onClick={toggleAnalysis}
          >
            {analyzing ? 'STOP' : 'FIND ENTRY POINT'}
          </button>

          {/* Status Display */}
          <div className={analysisClass}>
            <h3>{displayStatus.title}</h3>
            {displayStatus.title !== 'SEARCHING ENTRY' ? (
              <p>{displayStatus.message}</p>
            ) : (
              <div className="s-loader"></div>
            )}
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

export default Marvel;
