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
import { FaRobot, FaUserCheck } from "react-icons/fa";

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
                        <div className='hub-section'>
                            <button onClick={() => handleTabChange(4)} className='botsnav-button'
                                >
                                   <FaRobot /> Get Our Trading Bots
                                </button>
                                    

                                <a className='creation-button' href='https://track.deriv.com/_UEAPSNb_-9UKqFKZ7JdnQ2Nd7ZgqdRLk/1/'> 
                                <FaUserCheck />Create a Trading Account</a>
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
                                    'Import a bot from your Computer, Google Drive or Phone to start trading.'
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
