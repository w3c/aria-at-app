export const isSupportedByResponseCollector = ({ at, browser }) =>
    at?.name === 'NVDA' && browser?.name === 'Chrome';
