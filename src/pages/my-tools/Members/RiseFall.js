import React, { useState, useEffect, useMemo } from 'react';
import '../Styles/Risefall.css';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import OnboardTourHandler from '../tutorials/dbot-tours/onboarding-tour';
import InfoPanel from './info-panel';
import axios from 'axios';

const RiseFall = () => {
  const [volatilities, setVolatilities] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastUpdated, setLastUpdated] = useState(null);
  const [timeframeFilter, setTimeframeFilter] = useState('all');
      const { load_modal, dashboard } = useStore();
      const { dashboard_strategies } = load_modal;
      const { active_tab, active_tour } = dashboard;
      const has_dashboard_strategies = !!dashboard_strategies?.length;
      const { isDesktop, isTablet } = useDevice();
      const PREMIUM_BOTS = 4;

  const loadXMLToBotBuilder = (xml_string: string): void => {
          try {
              const strategy_id = window.Blockly.utils.idGenerator.genUid();
      
              window.Blockly.xmlValues = {
                  block_string: xml_string,
                  convertedDom: window.Blockly.utils.xml.textToDom(xml_string),
                  file_name: 'freebot',
                  from: 'my_computer',
                  strategy_id,
              };
      
              if (load_modal?.loadStrategyOnBotBuilder) {
                  load_modal.loadStrategyOnBotBuilder();
              } else {
                  const workspace = window.Blockly.getMainWorkspace();
                  workspace.clear();
                  window.Blockly.Xml.domToWorkspace(window.Blockly.xmlValues.convertedDom, workspace);
                  workspace.strategy_to_load = xml_string;
              }
      
              dashboard.setActiveTab(2);
          } catch (error) {
              console.error('Failed to load bot from XML:', error);
          }
      };
      
          const loadFreeBot = async (botFilename) => {
      try {
          const response = await axios.get(`/${botFilename}`, { responseType: 'text' });
          loadXMLToBotBuilder(response.data);
      } catch (error) {
          console.error(`Failed to fetch ${botFilename}`, error);
      }
  };

  // Volatility markets data
  const volatilityMarkets = [
    // Standard volatility indices
    { id: 1, name: 'Volatility 10 Index', symbol: 'R_10', timeframe: 'default' },
    { id: 2, name: 'Volatility 25 Index', symbol: 'R_25', timeframe: 'default' },
    { id: 3, name: 'Volatility 50 Index', symbol: 'R_50', timeframe: 'default' },
    { id: 4, name: 'Volatility 75 Index', symbol: 'R_75', timeframe: 'default' },
    { id: 5, name: 'Volatility 100 Index', symbol: 'R_100', timeframe: 'default' },
 
    
    // 1-second volatility indices
    { id: 8, name: 'Volatility 10 (1s) Index', symbol: '1HZ10V', timeframe: '1s' },
    { id: 9, name: 'Volatility 25 (1s) Index', symbol: '1HZ25V', timeframe: '1s' },
    { id: 10, name: 'Volatility 50 (1s) Index', symbol: '1HZ50V', timeframe: '1s' },
    { id: 11, name: 'Volatility 75 (1s) Index', symbol: '1HZ75V', timeframe: '1s' },
    { id: 12, name: 'Volatility 100 (1s) Index', symbol: '1HZ100V', timeframe: '1s' },

  ];

  // Sort volatilities with signals first, then neutral ones
  const sortedVolatilities = useMemo(() => {
    return [...volatilities].sort((a, b) => {
      if (a.signal && !b.signal) return -1;
      if (!a.signal && b.signal) return 1;
      return 0;
    });
  }, [volatilities]);

  // Filter and sort volatilities based on selected timeframe
  const filteredVolatilities = useMemo(() => {
    const filtered = sortedVolatilities.filter(market => {
      if (timeframeFilter === 'all') return true;
      return market.timeframe === timeframeFilter;
    });
    
    // Further sort by signal strength (trendStrength) for signaled markets
    return filtered.sort((a, b) => {
      if (a.signal && b.signal) {
        return b.trendStrength - a.trendStrength;
      }
      return 0;
    });
  }, [sortedVolatilities, timeframeFilter]);

  // Analyze volatilities for signals
  const analyzeVolatilities = () => {
    setIsLoading(true);
    
    setTimeout(() => {
      const updatedVolatilities = volatilityMarkets.map(market => {
        // Generate market metrics
        const is1sMarket = market.timeframe === '1s';
        const baseVolatility = is1sMarket ? Math.random() * 30 + 10 : Math.random() * 15 + 5;
        const volatility = baseVolatility.toFixed(2);
        
        const baseMomentum = is1sMarket ? Math.random() * 40 - 20 : Math.random() * 20 - 10;
        const momentum = baseMomentum.toFixed(2);
        
        const trendStrength = (Math.random() * 100).toFixed(2);
        
        // Determine signal
        let signal = null;
        const signalThreshold = is1sMarket ? 8 : 5;

        if (momentum > signalThreshold && trendStrength > (is1sMarket ? 55 : 60)) {
          signal = 'TRADE RISE';
        } else if (momentum < -signalThreshold && trendStrength > (is1sMarket ? 55 : 60)) {
          signal = 'TRADE FALL';
        }
        
        return {
          ...market,
          momentum,
          trendStrength,
          volatility,
          signal
        };
      });
      
      setVolatilities(updatedVolatilities);
      setIsLoading(false);
      setLastUpdated(new Date().toLocaleTimeString());
    }, 1000);
  };

  // Initial load and periodic refresh every 2 minutes
  useEffect(() => {
    analyzeVolatilities();
    const interval = setInterval(analyzeVolatilities, 120000); // 120000ms = 2 minutes
    return () => clearInterval(interval);
  }, []);

  return (
    <div className='risefall-main'>
    <div className="rise-fall-container">
      <header className="my-app-header">
        <div>
          <h1>Rise Fall Stats</h1>
          <div className="timeframe-filter">
            <button 
              className={timeframeFilter === 'all' ? 'active' : ''}
              onClick={() => setTimeframeFilter('all')}
            >
              All Markets
            </button>
            <button 
              className={timeframeFilter === 'default' ? 'active' : ''}
              onClick={() => setTimeframeFilter('default')}
            >
              Standard
            </button>
            <button 
              className={timeframeFilter === '1s' ? 'active' : ''}
              onClick={() => setTimeframeFilter('1s')}
            >
              1-Second
            </button>
          </div>
        </div>
        <div className="header-right">
          <div className="last-updated">
            {isLoading ? 'Analyzing...' : `Updated: ${lastUpdated}`}
            <div className="refresh-info">Auto-refresh in 2 minutes</div>
          </div>
          <button 
            onClick={analyzeVolatilities} 
            disabled={isLoading}
            className="refresh-btn"
          >
            {isLoading ? (
              <span className="spinner"></span>
            ) : (
              'Refresh Now'
            )}
          </button>
        </div>
      </header>

      <div className="markets-section">
        <h2>
          
          <span className="timeframe-indicator">
            {timeframeFilter !== 'all' && ` (${timeframeFilter === '1s' ? '1-Second' : 'Standard'})`}
          </span>
          <span className="signal-count">
            {filteredVolatilities.filter(m => m.signal).length} signals detected
          </span>
        </h2>
        <div className="markets-grid">
          {filteredVolatilities.length > 0 ? (
            filteredVolatilities.map(market => (
              <div 
                key={market.id} 
                className={`market-card ${market.signal ? market.signal.toLowerCase() : 'neutral'} ${market.timeframe === '1s' ? 'one-second' : ''}`}
              >
                <div className="market-header">
                  <h3>
                    {market.name}
                    {market.timeframe === '1s' && (
                      <span className="timeframe-badge">1s</span>
                    )}
                  </h3>
                  {market.signal && (
                    <button 
                      className="trade-button" 
                      onClick={() => loadFreeBot('fallrise.xml')}
                    >
                      Trade
                    </button>
                  )}
                 {/* <span className="market-symbol">{market.symbol}</span>*/ }
                </div>
                <div className="market-metrics">
                  <div className="metric-row">
                    <span className="metric-label">Volatility:</span>
                    <span className="metric-value">{market.volatility}%</span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Momentum:</span>
                    <span className={`metric-value ${market.momentum > 0 ? 'positive' : 'negative'}`}>
                      {market.momentum}
                    </span>
                  </div>
                  <div className="metric-row">
                    <span className="metric-label">Trend Strength:</span>
                    <span className="metric-value">{market.trendStrength}%</span>
                  </div>
                </div>
                <div className={`market-signal ${market.signal ? market.signal.toLowerCase() : 'neutral'}`}>
                  <span className="signal-text">{market.signal || 'No Signal'}</span>
                  {market.signal && (
                    <span className="signal-confidence">
                      {Math.round(market.trendStrength)}% confidence
                    </span>
                  )}
                </div>
              </div>
            ))
          ) : (
            <div className="loading-markets">
              {isLoading ? 'Loading markets...' : 'No markets available'}
            </div>
          )}
        </div>
      </div>

    </div>
    </div>
  );
};

export default RiseFall;