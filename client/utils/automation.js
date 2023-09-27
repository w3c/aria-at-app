export const isSupportedByResponseCollector = ({ at, browser }) =>
    at?.name === 'NVDA' && browser?.name === 'Chrome';

export const isBot = user => user?.username?.toLowerCase().slice(-3) === 'bot';
