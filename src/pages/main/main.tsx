import React, { lazy, Suspense, useEffect, useState } from 'react';
import classNames from 'classnames';
import { observer } from 'mobx-react-lite';
import { useLocation, useNavigate } from 'react-router-dom';
import ChunkLoader from '@/components/loader/chunk-loader';
import DesktopWrapper from '@/components/shared_ui/desktop-wrapper';
import Dialog from '@/components/shared_ui/dialog';
import MobileWrapper from '@/components/shared_ui/mobile-wrapper';
import Tabs from '@/components/shared_ui/tabs/tabs';
import TradingViewModal from '@/components/trading-view-chart/trading-view-modal';
import { DBOT_TABS, TAB_IDS } from '@/constants/bot-contents';
import { api_base, updateWorkspaceName } from '@/external/bot-skeleton';
import { CONNECTION_STATUS } from '@/external/bot-skeleton/services/api/observables/connection-status-stream';
import { isDbotRTL } from '@/external/bot-skeleton/utils/workspace';
import { useApiBase } from '@/hooks/useApiBase';
import { useStore } from '@/hooks/useStore';
import {
    LabelPairedChartLineCaptionRegularIcon,
    LabelPairedObjectsColumnCaptionRegularIcon,
    LabelPairedPuzzlePieceTwoCaptionBoldIcon,
} from '@deriv/quill-icons/LabelPaired';
import { LegacyGuide1pxIcon } from '@deriv/quill-icons/Legacy';
import { Localize, localize } from '@deriv-com/translations';
import { useDevice } from '@deriv-com/ui';
import RunPanel from '../../components/run-panel';
import ChartModal from '../chart/chart-modal';
import Dashboard from '../dashboard';
import RunStrategy from '../dashboard/run-strategy';
import LoginPage from '../my-tools/Components/Login';
import CalculatorPage from '../my-tools/Components/Calculator';
import PremiumBots from '../my-tools/Members/Premiumbots';
import AnalysisPage from '../my-tools/AnalysisTools/AnalysisDash';
import { FaSignal , FaCalculator, FaWhatsapp, FaRobot, FaAdjust } from "react-icons/fa";
import { RiAlertFill } from "react-icons/ri";

const ChartWrapper = lazy(() => import('../chart/chart-wrapper'));
const Tutorial = lazy(() => import('../tutorials'));


const AppWrapper = observer(() => {
    const { connectionStatus } = useApiBase();
    const { dashboard, load_modal, run_panel, quick_strategy, summary_card } = useStore();
    const {
        active_tab,
        active_tour,
        is_chart_modal_visible,
        is_trading_view_modal_visible,
        setActiveTab,
        setWebSocketState,
        setActiveTour,
        setTourDialogVisibility,
    } = dashboard;
    const { onEntered, dashboard_strategies } = load_modal;
    const {
        is_dialog_open,
        is_drawer_open,
        dialog_options,
        onCancelButtonClick,
        onCloseDialog,
        onOkButtonClick,
        stopBot,
    } = run_panel;
    const { is_open } = quick_strategy;
    const { cancel_button_text, ok_button_text, title, message } = dialog_options as { [key: string]: string };
    const { clear } = summary_card;
    const { DASHBOARD, BOT_BUILDER } = DBOT_TABS;
    const init_render = React.useRef(true);
    const hash = ['dashboard', 'signal_tool', 'bot_builder', 'calculator','bots', 'analysis_tool','chart', 'tutorial'];
    const { isDesktop } = useDevice();
    const location = useLocation();
    const navigate = useNavigate();

    let tab_value: number | string = active_tab;
    const GetHashedValue = (tab: number) => {
        tab_value = location.hash?.split('#')[1];
        if (!tab_value) return tab;
        return Number(hash.indexOf(String(tab_value)));
    };
    const active_hash_tab = GetHashedValue(active_tab);

    React.useEffect(() => {
        if (connectionStatus !== CONNECTION_STATUS.OPENED) {
            const is_bot_running = document.getElementById('db-animation__stop-button') !== null;
            if (is_bot_running) {
                clear();
                stopBot();
                api_base.setIsRunning(false);
                setWebSocketState(false);
            }
        }
    }, [clear, connectionStatus, setWebSocketState, stopBot]);

    React.useEffect(() => {
        if (is_open) {
            setTourDialogVisibility(false);
        }

        if (init_render.current) {
            setActiveTab(Number(active_hash_tab));
            if (!isDesktop) handleTabChange(Number(active_hash_tab));
            init_render.current = false;
        } else {
            navigate(`#${hash[active_tab] || hash[0]}`);
        }
        if (active_tour !== '') {
            setActiveTour('');
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab]);

    React.useEffect(() => {
        const trashcan_init_id = setTimeout(() => {
            if (active_tab === BOT_BUILDER && Blockly?.derivWorkspace?.trashcan) {
                const trashcanY = window.innerHeight - 250;
                let trashcanX;
                if (is_drawer_open) {
                    trashcanX = isDbotRTL() ? 380 : window.innerWidth - 460;
                } else {
                    trashcanX = isDbotRTL() ? 20 : window.innerWidth - 100;
                }
                Blockly?.derivWorkspace?.trashcan?.setTrashcanPosition(trashcanX, trashcanY);
            }
        }, 100);

        return () => {
            clearTimeout(trashcan_init_id); // Clear the timeout on unmount
        };
        //eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active_tab, is_drawer_open]);

    useEffect(() => {
        let timer: ReturnType<typeof setTimeout>;
        if (dashboard_strategies.length > 0) {
            // Needed to pass this to the Callback Queue as on tab changes
            // document title getting override by 'Bot | Deriv' only
            timer = setTimeout(() => {
                updateWorkspaceName();
            });
        }
        return () => {
            if (timer) clearTimeout(timer);
        };
    }, [dashboard_strategies, active_tab]);

    const handleTabChange = React.useCallback(
        (tab_index: number) => {
            setActiveTab(tab_index);
            const el_id = TAB_IDS[tab_index];
            if (el_id) {
                const el_tab = document.getElementById(el_id);
                setTimeout(() => {
                    el_tab?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
                }, 10);
            }
        },
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [active_tab]
    );

     const [showOverlay, setShowOverlay] = useState(false);

  const handleOpen = () => setShowOverlay(true);
  const handleClose = () => setShowOverlay(false);

    return (
        <>
        <React.Fragment>
            <div className='main'>
                <div
                    className={classNames('main__container', {
                        'main__container--active': active_tour && active_tab === DASHBOARD && !isDesktop,
                    })}
                >
                    <Tabs
                        active_index={active_tab}
                        className='main__tabs'
                        onTabItemChange={onEntered}
                        onTabItemClick={handleTabChange}
                        top
                    >
                        <div
                            label={
                                <>
                                    <LabelPairedObjectsColumnCaptionRegularIcon
                                        height='24px'
                                        width='24px'
                                        fill='orange'
                                        
                                    />
                                    <Localize i18n_default_text='Dashboard' />
                                </>
                            }
                            id='id-dbot-dashboard'
                        >
                            <Dashboard handleTabChange={handleTabChange} />
                        </div>


                       <div
                            label={ 
                                <span className="my-tab-label">
                                    <FaSignal
                                        height='24px'
                                        width='24px'
                                        fill='white'
                                    />
                                    <Localize i18n_default_text='Signal Tools' />
                                </span>
                            }
                            id='id-signal-tool'
                             
                        >
                            <LoginPage />
                        </div>

                        
                        <div
                            label={
                                <>
                                    <LabelPairedPuzzlePieceTwoCaptionBoldIcon
                                        height='24px'
                                        width='24px'
                                        fill='orange'
                                    />
                                    <Localize i18n_default_text='Bot Editor' />
                                </>
                            }
                            id='id-bot-builder'
                        />
                          
                       <div
                            label={ 
                                <>
                                    <FaCalculator
                                        height='24px'
                                        width='24px'
                                        fill='orange'
                                    />
                                    <Localize i18n_default_text='Stake Calculator' />
                                </>
                            }
                            id='id-stake-calculator'
                             
                        >
                            <CalculatorPage />
                        </div>


                           <div
                            label={ 
                                <>
                                    <FaRobot
                                        height='24px'
                                        width='24px'
                                        fill='orange'
                                    />
                                    <Localize i18n_default_text='Premium Bots' />
                                </>
                            }
                            id='id-premium-bots'
                             
                        >
                            <PremiumBots />
                        </div>
                         <div
                            label={ 
                                <>
                                    <FaAdjust 
                                        height='24px'
                                        width='24px'
                                        fill='orange'
                                    />
                                    <Localize i18n_default_text='Analysis Tool' />
                                </>
                            }
                            id='id-analysis-tool'
                             
                        >
                            <AnalysisPage />
                        </div>

                        <div
                            label={
                                <>
                                    <LabelPairedChartLineCaptionRegularIcon
                                        height='24px'
                                        width='24px'
                                        fill='orange'
                                    />
                                    <Localize i18n_default_text='Charts' />
                                </>
                            }
                            id={
                                is_chart_modal_visible || is_trading_view_modal_visible
                                    ? 'id-charts--disabled'
                                    : 'id-charts'
                            }
                        >
                            <Suspense fallback={<ChunkLoader message={localize('Please wait, loading chart...')} />}>
                                <ChartWrapper show_digits_stats={false} />
                            </Suspense>
                        </div>
                        <div
                            label={
                                <>
                                    <LegacyGuide1pxIcon
                                        height='16px'
                                        width='16px'
                                        fill='orange'
                                        
                                    />
                                    <Localize i18n_default_text='Tutorials' />
                                </>
                            }
                            id='id-tutorials'
                        >
                            <div className='tutorials-wrapper'>
                                <Suspense
                                    fallback={<ChunkLoader message={localize('Please wait, loading tutorials...')} />}
                                >
                                    <Tutorial handleTabChange={handleTabChange} />
                                </Suspense>
                            </div>
                        </div>
                    </Tabs>
                </div>
               
            </div>
            <DesktopWrapper>
                <div className='main__run-strategy-wrapper'>
                    <RunStrategy />
                    <RunPanel />
                </div>
                <ChartModal />
                <TradingViewModal />
            </DesktopWrapper>
            <MobileWrapper>{!is_open && <RunPanel />}</MobileWrapper>
            <Dialog
                cancel_button_text={cancel_button_text || localize('Cancel')}
                className='dc-dialog__wrapper--fixed'
                confirm_button_text={ok_button_text || localize('Ok')}
                has_close_icon
                is_mobile_full_width={false}
                is_visible={is_dialog_open}
                onCancel={onCancelButtonClick}
                onClose={onCloseDialog}
                onConfirm={onOkButtonClick || onCloseDialog}
                portal_element_id='modal_root'
                title={title}
            >
                {message}
            </Dialog>
        </React.Fragment>
        <a href='https://wa.me/254748998726?text=Hi%20360%20Trading%20Hub.'>
        <div className="whatsapp-float">
          <span>Need Help?<br /><span className='admin-tag'>Let's Chat</span></span>
          <span className='whats-icon'><FaWhatsapp /></span>
        </div>
      </a>

      <div>
      <button onClick={handleOpen} className='risk-btn'><RiAlertFill/> Risk Disclaimer!</button>

      {showOverlay && (
        <div className="overlayy">
          <div className="overlayy-content">
            <h2>Risk Disclaimer</h2>
            <p>
              Deriv offers complex derivatives, such as options and contracts for difference (“CFDs”).
              These products may not be suitable for all clients, and trading them puts you at risk.
              Please make sure that you understand the following risks before trading Deriv products:
            </p>
            <ul>
              <li>You may lose some or all of the money you invest in the trade.</li>
              <li>
                If your trade involves currency conversion, exchange rates will affect your profit and loss.
              </li>
              <li>
                You should never trade with borrowed money or with money that you cannot afford to lose.
              </li>
            </ul>
            <button onClick={handleClose} className="close-btnn">I UNDERSTAND</button>
          </div>
        </div>
      )}
    </div>
        </>
    );
});

export default AppWrapper;
