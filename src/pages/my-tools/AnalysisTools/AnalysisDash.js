import React, { useState, useEffect, useRef } from 'react';
import LastDigitsAnalysis from './LastDigits';
import EvenOddAnalysis from './EvenOdd';
import OverUnderAnalysis from './OverUnderAnalysis';
import RiseFallAnalysis from './RiseFall';
import './AnalysisDash.css';

const getDecimalPlaces = (symbol) => {
  if (symbol.startsWith('1HZ')) return 2;
  if (symbol === 'R_100') return 2;
  if (symbol === 'R_75' || symbol === 'R_50') return 4;
  if (symbol === 'R_25' || symbol === 'R_10') return 3;
  return 3;
};

const Dashboard = () => {
  const [selectedVolatility, setSelectedVolatility] = useState('R_100');
  const [tickCount, setTickCount] = useState(120);
  const [currentPrice, setCurrentPrice] = useState(null);
  const ws = useRef(null);

  useEffect(() => {
    if (ws.current) ws.current.close();

    ws.current = new WebSocket('wss://ws.binaryws.com/websockets/v3?app_id=70505');

    ws.current.onopen = () => {
      ws.current.send(
        JSON.stringify({
          ticks: selectedVolatility,
          subscribe: 1,
        })
      );
    };

    ws.current.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.msg_type === 'tick') {
        setCurrentPrice(data.tick.quote);
      }
    };

    return () => {
      if (ws.current) ws.current.close();
    };
  }, [selectedVolatility]);

  const decimalPlaces = getDecimalPlaces(selectedVolatility);

  return (
    <div className="dashboard-container">
      <div className="dashboard-controls">
        <label>
          <select
            value={selectedVolatility}
            onChange={(e) => setSelectedVolatility(e.target.value)}
          >
            <option value="R_10">Volatility 10</option>
            <option value="R_25">Volatility 25</option>
            <option value="R_50">Volatility 50</option>
            <option value="R_75">Volatility 75</option>
            <option value="R_100">Volatility 100</option>
            <option value="1HZ10V">Volatility 10 (1s)</option>
            <option value="1HZ25V">Volatility 25 (1s)</option>
            <option value="1HZ50V">Volatility 50 (1s)</option>
            <option value="1HZ75V">Volatility 75 (1s)</option>
            <option value="1HZ100V">Volatility 100 (1s)</option>
          </select>
        </label>

        <label>
          Ticks:
        </label>
        <input
            type="number"
            value={tickCount}
            min={1}
            onChange={(e) => setTickCount(parseInt(e.target.value))}
          />

       
      </div>
       <div className="current-price-display">
          Price:{' '}
          {currentPrice !== null ? parseFloat(currentPrice).toFixed(decimalPlaces) : 'Loading...'}
        </div>
<div className='container-section-my'>
      <div className="analysis-card-section">
        <LastDigitsAnalysis symbol={selectedVolatility} tickCount={tickCount} />
      </div>
      <div className="analysis-card-section">
        <EvenOddAnalysis symbol={selectedVolatility} tickCount={tickCount} />
      </div>
      <div className="analysis-card-section">
        <RiseFallAnalysis symbol={selectedVolatility} tickCount={tickCount} />
      </div>
      <div className="analysis-card-section">
        <OverUnderAnalysis symbol={selectedVolatility} tickCount={tickCount} />
      </div>
   </div>   
    </div>
  );
};

export default Dashboard;
