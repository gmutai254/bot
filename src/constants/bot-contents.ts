type TTabsTitle = {
    [key: string]: string | number;
};

type TDashboardTabIndex = {
    [key: string]: number;
};

export const tabs_title: TTabsTitle = Object.freeze({
    WORKSPACE: 'Workspace',
    CHART: 'Chart',
    SIGNAL_TOOL: 'Signal Tool'
});

export const DBOT_TABS: TDashboardTabIndex = Object.freeze({
    DASHBOARD: 0,
    SIGNAL_TOOL:1,
    BOT_BUILDER: 2,
    CALCULATOR:3,
    PREMIUM_BOTS:4,
    CHART: 5,
    TUTORIAL: 6,
});

export const MAX_STRATEGIES = 10;

export const TAB_IDS = ['id-dbot-dashboard','id-signal-tool', 'id-bot-builder', 'id-stake-calculator', 'id-premium-bots','id-charts', 'id-tutorials'];

export const DEBOUNCE_INTERVAL_TIME = 500;
