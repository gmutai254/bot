import React, { useState, useEffect, useRef } from 'react';
import './EvenOddAnalysis.css';

const getDecimalPlaces = (symbol) => {
  if (symbol.startsWith('1HZ')) return 2;
  if (symbol === 'R_100') return 2;
  if (symbol === 'R_75' || symbol === 'R_50') return 4;
  if (symbol === 'R_25' || symbol === 'R_10') return 3;
  return 3; // fallback
};

const EvenOddAnalysis = ({ symbol, tickCount }) => {
  const [digits, setDigits] = useState([]);
  const [percentages, setPercentages] = useState({ even: 0, odd: 0 });
  const ws = useRef(null);

  useEffect(() => {
    if (ws.current) ws.current.close();

    ws.current = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=70505');

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        ticks_history: symbol,
        style: 'ticks',
        count: tickCount,
        adjust_start_time: 1,
        end: 'latest'
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.history?.prices) {
        const digitList = data.history.prices.map(p => getLastDigit(p));
        setDigits(digitList);
        updatePercentages(digitList);
        

        ws.current.send(JSON.stringify({ ticks: symbol, subscribe: 1 }));
      }

      if (data.tick?.quote) {
        const digit = getLastDigit(data.tick.quote);
        
        setDigits(prev => {
          const updated = [...prev, digit].slice(-tickCount);
          updatePercentages(updated);
          return updated;
        });
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [symbol, tickCount]);

  const getLastDigit = (price) => {
    const decimals = getDecimalPlaces(symbol);
    const formatted = parseFloat(price).toFixed(decimals);
    const digit = formatted.split('.')[1]?.slice(-1) || '0';
    return parseInt(digit, 10);
  };

  const updatePercentages = (digitList) => {
    const total = digitList.length;
    const even = digitList.filter(d => d % 2 === 0).length;
    const odd = total - even;

    setPercentages({
      even: ((even / total) * 100).toFixed(2),
      odd: ((odd / total) * 100).toFixed(2),
    });
  };

  const last8 = digits.slice(-8);
  const decimalPlaces = getDecimalPlaces(symbol);

  return (
    <div className="evenodd-container">
      <h3 className="evenodd-header">Even/Odd Analysis</h3>

   

      <div className="evenodd-digits">
        {last8.map((digit, i) => (
          <div key={i} className={digit % 2 === 0 ? 'even-box' : 'odd-box'}>
            {digit % 2 === 0 ? 'E' : 'O'}
          </div>
        ))}
      </div>

      <div className="evenodd-labels">
        <span style={{ color: '#4caf50' }}>Even {percentages.even}%</span>
        <span style={{ color: '#f44336' }}>Odd {percentages.odd}%</span>
      </div>

      <div className="evenodd-bars">
        <div className="even-bar" style={{ width: `${percentages.even}%` }}></div>
        <div className="odd-bar" style={{ width: `${percentages.odd}%` }}></div>
      </div>
    </div>
  );
};

export default EvenOddAnalysis;
