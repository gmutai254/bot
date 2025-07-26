import React, { useEffect, useState, useRef } from 'react';
import './LastDigitsAnalysis.css';

const getDecimalPlaces = (symbol) => {
  if (symbol.startsWith('1HZ')) return 2;
  if (symbol === 'R_100') return 2;
  if (symbol === 'R_75' || symbol === 'R_50') return 4;
  if (symbol === 'R_25' || symbol === 'R_10') return 3;
  return 3;
};

const LastDigitsAnalysis = ({ symbol, tickCount }) => {
  const [allDigits, setAllDigits] = useState([]);
  const [percentages, setPercentages] = useState(Array(10).fill(0));
  
  const [highlightDigit, setHighlightDigit] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    if (ws.current) ws.current.close();

    ws.current = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=1089');

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          ticks_history: symbol,
          style: 'ticks',
          count: tickCount,
          end: 'latest',
          subscribe: 1,
        })
      );
    };

    ws.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);

      const getLastDigit = (price) => {
        const decimals = getDecimalPlaces(symbol);
        const str = Number(price).toFixed(decimals);
        return parseInt(str.slice(-1));
      };

      if (data.msg_type === 'history') {
        const digits = data.history.prices.map(getLastDigit);
        setAllDigits(digits);
      } else if (data.msg_type === 'tick') {
        const newDigit = getLastDigit(data.tick.quote);
        
        setHighlightDigit(newDigit);
        setAllDigits((prev) => {
          const updated = [...prev, newDigit].slice(-tickCount);
          return updated;
        });
        setTimeout(() => setHighlightDigit(null), 600);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [symbol, tickCount]);

  useEffect(() => {
    const counts = Array(10).fill(0);
    allDigits.forEach((d) => counts[d]++);
    const total = allDigits.length || 1;
    const percentages = counts.map((count) => ((count / total) * 100).toFixed(2));
    setPercentages(percentages);
  }, [allDigits]);

  const max = Math.max(...percentages);
  const min = Math.min(...percentages);

  return (
    <div className="last-digits-container">
      <div className="last-digits-header">LAST DIGITS</div>

     

      <div className="digits-grid">
        {percentages.map((percent, digit) => (
          <div
            key={digit}
            className={`digit-box ${percent == max ? 'max' : ''} ${percent == min ? 'min' : ''} ${highlightDigit === digit ? 'highlight' : ''}`}
          >
            <div className="digit-label">{digit}</div>
            <div className="digit-percentage">{percent}%</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default LastDigitsAnalysis;
