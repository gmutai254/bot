import React, { useEffect, useState, useRef } from 'react';
import './OverUnderAnalysis.css';

const OverUnderAnalysis = ({ selectedSymbol = 'R_100', selectedCount = 100 }) => {
  const [selectedDigit, setSelectedDigit] = useState(null);
  const [overPercentage, setOverPercentage] = useState(0);
  const [underPercentage, setUnderPercentage] = useState(0);
  const [recentDigits, setRecentDigits] = useState([]);
  const [allDigits, setAllDigits] = useState([]);
  
  const ws = useRef(null);

  useEffect(() => {
    if (ws.current) ws.current.close();

    ws.current = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=70505');

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          ticks_history: selectedSymbol,
          style: 'ticks',
          count: selectedCount,
          end: 'latest',
          subscribe: 1,
        })
      );
    };

    ws.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      if (data.msg_type === 'history') {
        const digits = data.history.prices.map((p) => parseInt(p.toString().slice(-1)));
        setAllDigits(digits);
        setRecentDigits(digits.slice(-8));
      } else if (data.msg_type === 'tick') {
        const newDigit = parseInt(data.tick.quote.toString().slice(-1));
        
        setAllDigits((prev) => {
          const updated = [...prev, newDigit].slice(-selectedCount);
          return updated;
        });
        setRecentDigits((prev) => [...prev, newDigit].slice(-8));
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [selectedSymbol, selectedCount]);

  useEffect(() => {
    const digits = allDigits;
    const target = selectedDigit !== null ? selectedDigit : 4;
    let over = 0;
    let under = 0;

    over = digits.filter((d) => d > target).length;
    under = digits.filter((d) => d <= target).length;

    if (target === 9) over = 0;
    if (target === 0) under = 0;

    const total = digits.length || 1;
    setOverPercentage(((over / total) * 100).toFixed(1));
    setUnderPercentage(((under / total) * 100).toFixed(1));
  }, [allDigits, selectedDigit]);

  const handleDigitClick = (digit) => {
    setSelectedDigit(digit);
  };

  return (
    <div className="overunder-container">
      <h4>Over/Under Analysis</h4>

      <div className="digit-buttons">
        {[...Array(10).keys()].map((digit) => (
          <button
            key={digit}
            className={digit === selectedDigit ? 'selected' : ''}
            onClick={() => handleDigitClick(digit)}
          >
            {digit}
          </button>
        ))}
      </div>

      <div className="bars-section">
        <div className="bar over">
          <div className="label">Over {overPercentage}%</div>
          <div className="bar-fill" style={{ width: `${overPercentage}%` }}></div>
        </div>
        <div className="bar under">
          <div className="label">Under {underPercentage}% </div>
          <div className="bar-fill" style={{ width: `${underPercentage}%` }}></div>
        </div>
      </div>

      <div className="recent-digits">
        {recentDigits.map((digit, index) => (
          <div
            key={index}
            className={`result-box ${digit > (selectedDigit ?? 4) ? 'over' : 'under'}`}
          >
            {digit > (selectedDigit ?? 4) ? 'O' : 'U'}
          </div>
        ))}
      </div>
    </div>
  );
};

export default OverUnderAnalysis;
