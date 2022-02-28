import { act } from 'react-dom/test-utils';

let isLoading;
let loadedOnceListeners = [];
let waitForWaterfallingQueries = null;
const getNumberOfActiveQueries = numberOfActiveQueries => {
    if (waitForWaterfallingQueries !== null) {
        clearTimeout(waitForWaterfallingQueries);
        waitForWaterfallingQueries = null;
    }
    if (numberOfActiveQueries === 0) {
        waitForWaterfallingQueries = setTimeout(() => {
            isLoading = false;
            loadedOnceListeners.forEach(listener => listener(isLoading));
            loadedOnceListeners = [];
        }, 1);
        return;
    }
    isLoading = true;
};

const waitForGraphQL = async () => {
    return act(async () => {
        if (isLoading === false) return;
        return new Promise(resolve => {
            loadedOnceListeners.push(resolve);
        });
    });
};

export default waitForGraphQL;
export { getNumberOfActiveQueries };
