import React, { useState, useEffect, useRef } from 'react';
import './RiseFallAnalysis.css';

const getVolatilityLabel = (value) => {
  if (value.startsWith('1HZ')) {
    const num = value.replace('1HZ', '').replace('V', '');
    return `Volatility ${num} (1s)`;
  }
  return `Volatility ${value.replace('R_', '')}`;
};

const getDecimalPlaces = (symbol) => {
  if (symbol.startsWith('1HZ')) return 2;
  if (symbol === 'R_100') return 2;
  if (symbol === 'R_75' || symbol === 'R_50') return 4;
  if (symbol === 'R_25' || symbol === 'R_10') return 3;
  return 3;
};

const RiseFallAnalysis = ({ selectedSymbol = 'R_100', selectedCount = 100 }) => {
  const [prices, setPrices] = useState([]);
  const [percentages, setPercentages] = useState({ rise: 0, fall: 0 });

  const ws = useRef(null);

  useEffect(() => {
    if (ws.current) ws.current.close();

    ws.current = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=70505');

    ws.current.onopen = () => {
      ws.current.send(JSON.stringify({
        ticks_history: selectedSymbol,
        style: 'ticks',
        count: selectedCount,
        adjust_start_time: 1,
        end: 'latest',
      }));
    };

    ws.current.onmessage = (event) => {
      const data = JSON.parse(event.data);

      if (data.history?.prices) {
        const priceList = data.history.prices.map(p => parseFloat(p));
        setPrices(priceList);
        updatePercentages(priceList);
        

        ws.current.send(JSON.stringify({ ticks: selectedSymbol, subscribe: 1 }));
      }

      if (data.tick?.quote) {
        const quote = parseFloat(data.tick.quote);
        
        setPrices(prev => {
          const updated = [...prev, quote].slice(-selectedCount);
          updatePercentages(updated);
          return updated;
        });
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [selectedSymbol, selectedCount]);

  const updatePercentages = (priceList) => {
    let rise = 0, fall = 0;
    for (let i = 1; i < priceList.length; i++) {
      if (priceList[i] > priceList[i - 1]) rise++;
      else if (priceList[i] < priceList[i - 1]) fall++;
    }
    const total = priceList.length - 1;
    setPercentages({
      rise: total ? ((rise / total) * 100).toFixed(2) : 0,
      fall: total ? ((fall / total) * 100).toFixed(2) : 0,
    });
  };

  const last8 = prices.slice(-8);
  const decimalPlaces = getDecimalPlaces(selectedSymbol);

  return (
    <div className="risefall-container">
      <h3 className="risefall-header">Rise/Fall Analysis</h3>


      <div className="risefall-digits">
        {last8.map((p, i) => {
          const change = i > 0 && p > last8[i - 1] ? 'rise' : 'fall';
          return (
            <div key={i} className={change === 'rise' ? 'rise-box' : 'fall-box'}>
              {change === 'rise' ? 'R' : 'F'}
            </div>
          );
        })}
      </div>

      <div className="risefall-labels">
        <span style={{ color: '#4caf50' }}>Rise {percentages.rise}%</span>
        <span style={{ color: '#f44336' }}>Fall {percentages.fall}%</span>
      </div>

      <div className="risefall-bars">
        <div className="rise-bar" style={{ width: `${percentages.rise}%` }}></div>
        <div className="fall-bar" style={{ width: `${percentages.fall}%` }}></div>
      </div>
    </div>
  );
};

export default RiseFallAnalysis;
