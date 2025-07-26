import React from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import Text from '@/components/shared_ui/text';
import { useStore } from '@/hooks/useStore';
import { localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import OnboardTourHandler from '../tutorials/dbot-tours/onboarding-tour';
import Announcements from './announcements';
import Cards from './cards';
import InfoPanel from './info-panel';
import { FaRobot, FaUserCheck, FaDownload, FaAdjust  } from "react-icons/fa";
import axios from 'axios';

type TMobileIconGuide = {
    handleTabChange: (active_number: number) => void;
};

const DashboardComponent = observer(({ handleTabChange }: TMobileIconGuide) => {
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

    const loadFreeBot = async () => {
    try {
        const response = await axios.get('/sniperbot.xml', { responseType: 'text' });
        loadXMLToBotBuilder(response.data);
    } catch (error) {
        console.error('Failed to fetch freebot.xml', error);
    }
};

    return (
        <>
        
        <React.Fragment>
            
            <div
                className={classNames('tab__dashboard', {
                    'tab__dashboard--tour-active': active_tour,
                })}
            >
               
                <div className='tab__dashboard__content'>
                     
                    <div className='quick-panel'>
                         <div className='tradingsite-link'>
                             <h3>Need your Own <strong>Trading Site?</strong> <a href='https://site.360tradinghub.co.ke/'> Click Here</a></h3> 
                        </div>
                        <div className='hub-section'>
                            <button onClick={() => handleTabChange(4)} className='botsnav-button'
                                >
                                   <FaRobot  className='nav-icon'/> Our Bots & Tools
                                </button>
                                    

                                <a className='creation-button botsnav-button' href='https://track.deriv.com/_UEAPSNb_-9WFfUyb_9NCN2Nd7ZgqdRLk/1/'> 
                                <FaUserCheck className='acct-icon'/>Open a Deriv Account</a>
                                 

                            <button onClick={() => handleTabChange(5)} className='botsnav-button analysis-btn'
                                >
                                   <FaAdjust  className='nav-icon'/> Analysis Tool
                                </button>
                                
                               
                        </div>
                        <div className='freebot-section'>
                                    <p>360 SNIPER BOT V1</p>
                                    <button onClick={loadFreeBot}>Load Bot</button>      
                                </div>
                                
                       
                        <div
                            className={classNames('tab__dashboard__header', {
                                'tab__dashboard__header--listed': isDesktop && has_dashboard_strategies,
                            })}
                        >
                           {/*  {!has_dashboard_strategies && (
                                <Text
                                    className='title'
                                    as='h2'
                                    color='prominent'
                                    size={isDesktop ? 'sm' : 's'}
                                    lineHeight='xxl'
                                    weight='bold'
                                >
                                    {localize('Load your bot')}
                                </Text>
                            )}
                               */} 
                            
                            <Text
                                as='p'
                                color='prominent'
                                lineHeight='s'
                                size={isDesktop ? 's' : 'xxs'}
                                className={classNames('subtitle', { 'subtitle__has-list': has_dashboard_strategies })}
                            >
                                {localize(
                                    'Load 360 SNIPER BOT or Import a bot from your Computer/Phone to start trading.'
                                )}
                            </Text>
                        </div>
                        
                        <Cards has_dashboard_strategies={has_dashboard_strategies} is_mobile={!isDesktop} />
                    </div>
                </div>
            </div>
            <InfoPanel />
            {active_tab === 0 && <OnboardTourHandler is_mobile={!isDesktop} />}
        </React.Fragment>
        </>
    );
});

export default DashboardComponent;
