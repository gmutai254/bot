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
  
  
        }
      };
  
      newWs.onerror = (error) => {
        console.error("WebSocket Error:", error);
      };
  
      return () => newWs.close();
    }, [selectedIndex]);

  useEffect(() => {
    let entryTimer;
    if (entryFound) {
      entryTimer = setTimeout(() => {
        setEntryFound(false);
        setInCooldown(true); // Start cooldown after entry
        setTimeout(() => {
          setInCooldown(false); // End cooldown after 30 seconds
        }, 30000);
      }, 20000); // Entry active for 20 seconds
    }
    return () => clearTimeout(entryTimer);
  }, [entryFound]);

  const toggleAnalysis = () => {
    setAnalyzing((prev) => {
      if (prev) {
        setEntryFound(false);
      }
      return !prev;
    });
  };

  const displayStatus = useMemo(() => {
    if (!analyzing) {
      return {
        title: 'ABOUT TO ANALYZE',
        message: 'Set Predictions to check signal',
      };
    }

    if (entryFound) {
      return {
        title: 'ENTRY FOUND',
        message: 'Run Marvel Bot NOW',
      };
    }

    if (
      attemptPrediction === '' ||
      recoveryPrediction === '' ||
      startingPrediction === '' ||
      lastDigits.length < 3 ||
      inCooldown
    ) {
      return {
        title: 'SEARCHING ENTRY',
        message: 'Please wait for Signal',
      };
    }

    const latestDigit = lastDigits[0];
    const previousDigit = lastDigits[1];
    const secondPreviousDigit = lastDigits[2];

    const attempt = parseInt(attemptPrediction);
    const recovery = parseInt(recoveryPrediction);
    const starting = parseInt(startingPrediction);

    if (
      !isNaN(attempt) &&
      !isNaN(recovery) &&
      !isNaN(starting) &&
      latestDigit > 6 &&
      previousDigit <= 2 &&
      secondPreviousDigit <= recovery
    ) {
      setEntryFound(true);
      return {
        title: 'ENTRY FOUND',
        message: 'Run Marvel Bot NOW',
      };
    }

    return {
      title: 'SEARCHING ENTRY',
      message: 'Please wait for Signal',
    };
  }, [analyzing, attemptPrediction, recoveryPrediction, startingPrediction, lastDigits, entryFound, inCooldown]);

  const analysisClass = useMemo(() => {
    switch (displayStatus.title) {
      case 'ABOUT TO ANALYZE':
        return 'analysis-display golden';
      case 'SEARCHING ENTRY':
        return 'analysis-display red';
      case 'ENTRY FOUND':
        return 'analysis-display green';
      default:
        return 'analysis-display';
    }
  }, [displayStatus]);

 

  const [userData, setUserData] = useState("loading");
  const [loading, setLoading] = useState(true);

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

    const unsubscribe = auth.onAuthStateChanged((user) => {
      if (user) {
        fetchUserData();
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <>
      {(userData.latestBot === "Advanced" || userData.latestBot === "Sprinter Advanced" || userData.latestBot === "All"|| userData.latestBot === "Advanced Marvel") ? (
        <div className="marvel-container">
          <h2>Advanced Marvel Tool</h2>
          <div className="vol-selection">
            <select value={selectedIndex} onChange={(e) => setSelectedIndex(e.target.value)}>
            {indices.map(index => (
              <option key={index.value} value={index.label}>{index.label}</option>
            ))}
          </select>
            {prices[selectedIndex] !== undefined && (
          
            <h4 >
              {prices[selectedIndex].toFixed(selectedIndex.includes("(1s)") ? 2 : 3)}
            </h4>
          
        )}
          </div>
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

          <button
            className={`analyze-btn ${analyzing ? 'stop' : 'start'}`}
            onClick={toggleAnalysis}
          >
            {analyzing ? 'STOP' : 'FIND ENTRY POINT'}
          </button>

          <div className={analysisClass}>
            <h3>{displayStatus.title}</h3>
            {displayStatus.title !== 'SEARCHING ENTRY' && <p>{displayStatus.message}</p>}
            {displayStatus.title === 'SEARCHING ENTRY' && <div className="s-loader"></div>}
          </div>
        </div>
      ) : (
        <div className="not-allowed">
          <p className="access-denied">
            <strong>ACCESS DENIED!</strong> You need to have Advanced Marvel Premium to access its tool.
          </p>
          <p>Your Bot is :{loading?(<span className="bot-name">{userData.latestBot}</span>):(<span>Loading...</span>)} </p>
          <a
            href="https://wa.me/254748998726?text=How%20much%20discount%20for%20Advanced%20Marvel%20Bot%20&%20Tool."
            className="mybutton"
          >
            Get at a Discount
          </a>
        </div>
      )}
    </>
  );
};

export default Marvel;
