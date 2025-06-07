import React, { useState } from 'react';
import '../Styles/calculator.css';

function Calculator() {
    const [capital, setCapital] = useState('');
    const [stake, setStake] = useState('0.00');
    const [sessionProfit, setSessionProfit] = useState('0.00');
    const [sessions, setSessions] = useState('0');
    const [dailyProfit, setDailyProfit] = useState('0.00');
  
    const calculate = () => {
      const cap = parseFloat(capital);
      if (isNaN(cap) || cap <= 0) {
        alert("Please enter a valid capital amount.");
        return;
      }
  
      const newStake = (cap * 0.025).toFixed(2); // 2.5%
      const newSessionProfit = (cap * 0.035).toFixed(2); // 4.5%
      const randomSessions = Math.floor(Math.random() * 3) + 6; // 6 to 8
      const newDailyProfit = (newSessionProfit * randomSessions).toFixed(2);
  
      setStake(newStake);
      setSessionProfit(newSessionProfit);
      setSessions(randomSessions);
      setDailyProfit(newDailyProfit);
    };
  
    const reset = () => {
      setCapital('');
      setStake('0.00');
      setSessionProfit('0.00');
      setSessions('0');
      setDailyProfit('0.00');
    };
  
    return (
      <div className="calc-container">
        <h1>Risk Management</h1>
        
        <div className="card">
          <input
            type="number"
            placeholder="Enter Your Deriv Balance"
            value={capital}
            onChange={(e) => setCapital(e.target.value)}
          />
          <div className="buttons">
            <button onClick={calculate}>Calculate</button>
            <button className="reset" onClick={reset}>Reset</button>
          </div>
  
          <table className="results-table">
  <thead>
    <tr>
      <th className="description">Description</th>
      <th className="value">Value</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td className="description">Stake </td>
      <td className="value">${stake}</td>
    </tr>
    <tr>
      <td className="description">Session Profit</td>
      <td className="value">${sessionProfit}</td>
    </tr>
    <tr>
      <td className="description">Sessions Today</td>
      <td className="value">{sessions}</td>
    </tr>
    <tr>
      <td className="description">Daily Profit</td>
      <td className="value">${dailyProfit}</td>
    </tr>
  </tbody>
</table>


  <p className="note">
    Your daily profit is {(100 * parseFloat(dailyProfit) / parseFloat(capital)).toFixed(2)}% of your capital.
  </p>

        </div>
      </div>
  );
}

export default Calculator;
