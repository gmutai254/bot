import React from 'react'
import '../Styles/LoadBots.css'
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import OnboardTourHandler from '../tutorials/dbot-tours/onboarding-tour';
import InfoPanel from './info-panel';
import axios from 'axios';



type TMobileIconGuide = {
    handleTabChange: (active_number: number) => void;
};




const Freebots = observer(({ handleTabChange }: TMobileIconGuide) => {
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
  return (
    <div className='page-container-bots'>
      <div className='bot-card'>
        <p className='bot-name'>MARKET SPRINTER BOT</p>
        <p className='bot-description'>Over Under trades</p>
        <button className='loadbot-btn'onClick={() => loadFreeBot('sprinter.xml')}>Load Bot</button>
      </div>
      <div className='bot-card'>
        <p className='bot-name'>ADVANCED MARVEL BOT</p>
        <p className='bot-description'>Over/Under Autoswitch</p>
        <button className='loadbot-btn' onClick={() => loadFreeBot('advanced.xml')}>Load Bot</button>
      </div>
      <div className='bot-card'>
        <p className='bot-name'>360 SNIPER BOT </p>
        <p className='bot-description'>All Trade Types</p>
        <button className='loadbot-btn'onClick={() => loadFreeBot('sniperbot.xml')}>Load Bot</button>
      </div>
      <div className='bot-card'>
        <p className='bot-name'>MASTERJET RISE FALL </p>
        <p className='bot-description'>Fully Automated!</p>
        <button className='loadbot-btn'onClick={() => loadFreeBot('masterjet.xml')}>Load Bot</button>
      </div>
       <div className='bot-card'>
        <p className='bot-name'>RISE & FALL BOT</p>
        <p className='bot-description'>No Analysis</p>
        <button className='loadbot-btn'onClick={() => loadFreeBot('risefall.xml')}>Load Bot</button>
      </div>
       <div className='bot-card'>
        <p className='bot-name'>SPLIT MARTINGALE BOT</p>
        <p className='bot-description'>Over/Under Bot</p>
        <button className='loadbot-btn'onClick={() => loadFreeBot('split.xml')}>Load Bot</button>
      </div>
      
   
    </div>
  );
}
);

export default Freebots