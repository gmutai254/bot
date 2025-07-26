// VolChecker.js
import React, { useState, useEffect, useRef, useMemo } from 'react';
import '../Styles/EvenOddSignal.css';
import { auth, db } from '../firebase';
import { doc, getDoc } from 'firebase/firestore';

const alertSound = new Audio(`${process.env.PUBLIC_URL}/alert.mp3`);

const isEven = (digit) => digit % 2 === 0;

const getEvenOddPercentage = (digits) => {
  const even = digits.filter(isEven).length;
  const odd = digits.length - even;
  const total = digits.length;
  return {
    even: ((even / total) * 100).toFixed(1),
    odd: ((odd / total) * 100).toFixed(1),
  };
};

const getDecimalPlaces = (symbol) => {
  if (symbol.startsWith('1HZ')) return 2;
  if (symbol === 'R_100') return 2;
  if (symbol === 'R_75' || symbol === 'R_50') return 4;
  if (symbol === 'R_25' || symbol === 'R_10') return 3;
  return 3;
};

const extractLastDigit = (volatility, price) => {
  const decimalPlaces = getDecimalPlaces(volatility);
  const fixed = Number(price).toFixed(decimalPlaces);
  const [_, decimals = ''] = fixed.split('.');
  if (decimals.length > 0) return parseInt(decimals.slice(-1));
  return parseInt(fixed.slice(-1));
};

const volatilityList = [
  'R_10', 'R_25', 'R_50', 'R_75', 'R_100',
  '1HZ10V', '1HZ25V', '1HZ50V', '1HZ75V', '1HZ100V',
];

const symbolNames = {
  'R_10': 'Volatility 10',
  'R_25': 'Volatility 25',
  'R_50': 'Volatility 50',
  'R_75': 'Volatility 75',
  'R_100': 'Volatility 100',
  '1HZ10V': 'Volatility 10 1s',
  '1HZ25V': 'Volatility 25 1s',
  '1HZ50V': 'Volatility 50 1s',
  '1HZ75V': 'Volatility 75 1s',
  '1HZ100V': 'Volatility 100 1s',
};

const VolChecker = () => {
  const [analysisStarted, setAnalysisStarted] = useState(false);
  const [status, setStatus] = useState('No Signal');
  const [displayData, setDisplayData] = useState({});
  const [visibleIndex, setVisibleIndex] = useState(0);
  const sockets = useRef({});
  const tickData = useRef({});

  useEffect(() => {
    const loop = setInterval(() => {
      setVisibleIndex((prev) => (prev + 4) % volatilityList.length);
    }, 50);
    return () => clearInterval(loop);
  }, []);

  useEffect(() => {
    connectWebSocket('1HZ10V');
  }, []);

  const handleToggleAnalysis = () => {
    if (analysisStarted) {
      stopAllSockets();
      setStatus('No Signal');
      setAnalysisStarted(false);
    } else {
      setAnalysisStarted(true);
      setStatus('Checking entries...');
      tickData.current = {};
      setDisplayData({});
      volatilityList.forEach(connectWebSocket);
    }
  };

  const connectWebSocket = (volatility) => {
    if (sockets.current[volatility]) sockets.current[volatility].close();
    const ws = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');
    sockets.current[volatility] = ws;
    tickData.current[volatility] = [];
    let historyFetched = false;

    ws.onopen = () => {
      ws.send(JSON.stringify({ ticks_history: volatility, style: 'ticks', count: 50, end: 'latest' }));
    };

    ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (!historyFetched && data.history?.prices) {
        data.history.prices.forEach((p) => {
          const digit = extractLastDigit(volatility, p);
          if (!isNaN(digit)) tickData.current[volatility].push(digit);
        });
        historyFetched = true;
        ws.send(JSON.stringify({ ticks: volatility, subscribe: 1 }));
        return;
      }

      if (data.tick?.quote) {
        const digit = extractLastDigit(volatility, data.tick.quote);
        if (!isNaN(digit)) {
          tickData.current[volatility].push(digit);
          if (tickData.current[volatility].length > 50) tickData.current[volatility].shift();
        }
      }

      if (tickData.current[volatility].length === 50) {
        const { even, odd } = getEvenOddPercentage(tickData.current[volatility]);
        setDisplayData((prev) => ({ ...prev, [volatility]: { even, odd } }));
        if (even > 60 || odd > 60) {
          alertSound.play();
          setStatus(`Signal Found: Trade ${even > 60 ? 'EVEN' : 'ODD'} on ${symbolNames[volatility]}`);
          stopAllSockets();
          setAnalysisStarted(false);
        }
      }
    };

    ws.onerror = (err) => console.error(`WebSocket error for ${volatility}:`, err);
  };

  const stopAllSockets = () => {
    Object.values(sockets.current).forEach((ws) => {
      if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) ws.close();
    });
    sockets.current = {};
  };

  const getVisibleEntries = () => {
    return volatilityList.slice(visibleIndex, visibleIndex + 4).map((symbol) => {
      const even = displayData[symbol]?.even || 0;
      const odd = displayData[symbol]?.odd || 0;
      const highlight = even >= 60 || odd >= 60;
      return { symbol, even, odd, highlight };
    });
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

    const [number] = useState(() => Math.floor(Math.random() * 7) + 9);
  return (
    <div className='volcheck-general'>
        {(userData.latestBot === "Havoc" || userData.status === "Active"|| userData.status === "Clicked") ? (
    <div className="volchecker-container">
      <h1>Even/Odd Signal Tool</h1>
      
      <button className={`startt-btn ${analysisStarted ? 'stop' : ''}`} onClick={handleToggleAnalysis}>
        {analysisStarted ? 'STOP ANALYSIS' : 'START A.I ANALYSIS'}
      </button>
      <div className="signal-box">
        {status.startsWith('Signal Found') ? (
          <>
  <div className="signal-header">SIGNAL FOUND !</div>
  <div className=" signal-found">
    Trade <span className="trade-type">
      {status.includes('EVEN') ? 'EVEN' : 'ODD'}
    </span> on <span className="vol-name">
      {status.split('on ')[1]}
    </span>
    <p>MAX. OF {number} RUNS</p>
  </div>
</>

        ) : status === 'Checking entries...' ? (
          <>
            <div className="check-header">Checking entries...</div>
            <div className="scroll-container">
              {getVisibleEntries().map(({ symbol, even, odd, highlight }) => (
                <div key={symbol} className={`scroll-line ${highlight ? 'highlight' : ''}`}>
                  {symbolNames[symbol]}: Even {even}% | Odd {odd}%
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="status-text">{status}</div>
        )}
      </div>
    </div>):(<div className='member-ineligible'>
        <p>You are Not Eligible for this Tool. Contact Admin</p>
    </div>)}
    </div>
  );
};

export default VolChecker;
