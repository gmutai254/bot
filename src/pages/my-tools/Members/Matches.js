import React, { useEffect, useRef, useState } from "react";
import "../Styles/matches.css";
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

export default function Matches() {
  const [percentages, setPercentages] = useState(Array(10).fill("0.0"));
  const [volatility, setVolatility] = useState("R_100");
  const [error, setError] = useState("");
  const [currentPrice, setCurrentPrice] = useState(null);
  const [matchDigit, setMatchDigit] = useState(null);
  const [differDigit, setDifferDigit] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const analysisTimeoutRef = useRef(null);
  const wsRef = useRef(null);
  const digitsBuffer = useRef([]);

  const getDecimalPlaces = (vol) => {
    if (vol.startsWith("1HZ") || vol === "R_100") return 2;
    if (vol === "R_10" || vol === "R_25") return 3;
    if (vol === "R_50" || vol === "R_75") return 4;
    return 3;
  };

  const formatPrice = (price, vol) => {
    const decimals = getDecimalPlaces(vol);
    return Number(price).toFixed(decimals);
  };

  const getLastDigit = (priceStr) => {
    for (let i = priceStr.length - 1; i >= 0; i--) {
      const ch = priceStr.charAt(i);
      if (ch >= "0" && ch <= "9") return parseInt(ch, 10);
    }
    return NaN;
  };

  const triggerSignal = (under6Index, percents) => {
    const maxVal = Math.max(...percents.map(parseFloat));
    const maxIndex = percents.findIndex(
      (p) => parseFloat(p) === maxVal
    );

    setMatchDigit(under6Index);
    setDifferDigit(maxIndex);
    setIsAnalyzing(false);

    if (analysisTimeoutRef.current)
      clearTimeout(analysisTimeoutRef.current);

    analysisTimeoutRef.current = setTimeout(() => {
      setMatchDigit(null);
      setDifferDigit(null);
    }, 30000); // 20 seconds
  };

  const updatePercentages = (digitsArr) => {
    const counts = Array(10).fill(0);
    digitsArr.forEach((d) => {
      if (!isNaN(d) && d >= 0 && d <= 9) counts[d]++;
    });
    const total = digitsArr.length || 1;
    const newPercents = counts.map((count) =>
      ((count / total) * 100).toFixed(1)
    );
    setPercentages(newPercents);
  };

  // EFFECT: when isAnalyzing becomes true, check if digit <6% exists to trigger immediately
  useEffect(() => {
    if (isAnalyzing && matchDigit === null) {
      const under6Index = percentages.findIndex(
        (p) => parseFloat(p) < 2.5
      );
      if (under6Index !== -1) {
        triggerSignal(under6Index, percentages);
      }
    }
  }, [isAnalyzing, percentages, matchDigit]);

  useEffect(() => {
    digitsBuffer.current = [];
    setPercentages(Array(10).fill("0.0"));
    setError("");
    setCurrentPrice(null);
    setMatchDigit(null);
    setDifferDigit(null);
    setIsAnalyzing(false);

    if (wsRef.current) {
      wsRef.current.close();
    }

    wsRef.current = new WebSocket(
      "wss://ws.binaryws.com/websockets/v3?app_id=70505"
    );

    wsRef.current.onopen = () => {
      wsRef.current.send(
        JSON.stringify({
          ticks_history: volatility,
          count: 50,
          style: "ticks",
          end: "latest",
        })
      );

      wsRef.current.send(
        JSON.stringify({
          ticks: volatility,
          subscribe: 1,
        })
      );
    };

    wsRef.current.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        if (data.error) {
          setError(data.error.message);
          return;
        }

        if (data.msg_type === "history" && data.history?.prices) {
          const digits = data.history.prices
            .map((p) => getLastDigit(formatPrice(p, volatility)))
            .filter((d) => !isNaN(d));
          digitsBuffer.current = digits.slice(-100);
          updatePercentages(digitsBuffer.current);
        }

        if (data.msg_type === "tick" && data.tick?.quote !== undefined) {
          setCurrentPrice(data.tick.quote);
          const lastDigit = getLastDigit(
            formatPrice(data.tick.quote, volatility)
          );
          if (!isNaN(lastDigit)) {
            digitsBuffer.current.push(lastDigit);
            if (digitsBuffer.current.length > 100)
              digitsBuffer.current.shift();
            updatePercentages(digitsBuffer.current);
          }
        }
      } catch (e) {
        setError("Error parsing data");
      }
    };

    wsRef.current.onerror = () => {
      setError("WebSocket error");
    };

    return () => {
      wsRef.current?.close();
      if (analysisTimeoutRef.current)
        clearTimeout(analysisTimeoutRef.current);
    };
  }, [volatility]);

  const numericPercents = percentages.map(parseFloat);
  const minPercent = Math.min(...numericPercents);
  const maxPercent = Math.max(...numericPercents);

  const handleAnalysisClick = () => {
    if (isAnalyzing) {
      setIsAnalyzing(false);
      setMatchDigit(null);
      setDifferDigit(null);
      if (analysisTimeoutRef.current)
        clearTimeout(analysisTimeoutRef.current);
    } else {
      setMatchDigit(null);
      setDifferDigit(null);
      // Start analyzing: signal will be triggered by useEffect if digit <6% exists
      setIsAnalyzing(true);
    }
  };

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
    {(userData.latestBot === "Matches" || userData.latestBot === "All") ?
    (
    <div className="matches-container">
      <div className="vol-select">
        <select
          id="volatility-select"
          value={volatility}
          onChange={(e) => setVolatility(e.target.value)}
          disabled={isAnalyzing}
        >
          
            <option value="1HZ10V">Volatility 10 1s</option>
            <option value="R_10">Volatility 10 index</option>
            <option value="1HZ25V">Volatility 25 1s</option>
            <option value="R_25">Volatility 25 index</option>
            <option value="1HZ50V">Volatility 50 1s</option>
            <option value="R_50">Volatility 50 index</option>
            <option value="1HZ75V">Volatility 75 1s</option>
            <option value="R_75">Volatility 75 index</option>
            <option value="1HZ100V">Volatility 100 1s</option>
            <option value="R_100">Volatility 100 index</option>
            
          
        </select>
        <h2>
        {currentPrice !== null
          ? formatPrice(currentPrice, volatility)
          : "Loading..."}</h2>
      </div>

      {error && <p className="error">{error}</p>}

      <div className="digit-list">
        {percentages.map((percent, digit) => {
          const numericPercent = parseFloat(percent);
          let className = "digit-box";
          if (numericPercent === minPercent) className += " least";
          if (numericPercent === maxPercent) className += " most";
          return (
            <div key={digit} className={className}>
              <span className="digit">{digit}</span>
              <span className="percent">{percent}%</span>
            </div>
          );
        })}
      </div>

      <div
        className="signal-row"
        style={{
          display: "flex",
          justifyContent: "center",
          gap: "2rem",
          marginTop: "1rem",
        }}
      >
        <div className="signal-box">
          <strong>Matches Digit:</strong>{" "}
          <span style={{ color: "orange", fontSize: "25px" }}>
            {matchDigit !== null ? matchDigit : "-"}
          </span>
        </div>
        <div className="signal-box">
          <strong>Differs Digit:</strong>{" "}
          <span style={{ color: "orange", fontSize: "25px" }}>
            {differDigit !== null ? differDigit : "-"}
          </span>
        </div>
      </div>

      {isAnalyzing && (
        <div className="loader-section"
        >
          

<div className="🤚">
	<div className="👉"></div>
	<div className="👉"></div>
	<div className="👉"></div>
	<div className="👉"></div>
	<div className="🌴"></div>		
	<div className="👍"></div>
</div>
        <h3>Analyzing...</h3>
        </div>
      )}

      <button
        onClick={handleAnalysisClick}
        style={{
          marginTop: "1.5rem",
          padding: "10px 20px",
          fontSize: "16px",
          cursor: "pointer",
          backgroundColor: isAnalyzing ? "#ff4d4d" : "#234581",
          color: "white",
          border: "none",
          borderRadius: "5px",
        }}
      >
        {isAnalyzing ? "STOP ANALYSIS" : "START ANALYSIS"}
      </button>
    </div>
    ):(

        <div>
           {loading?(<h1>Checking eligibility...</h1>):
           (
             <h2>Coming Soon for you...</h2>)}
        </div>
        
    )}
    </>
  );
}
