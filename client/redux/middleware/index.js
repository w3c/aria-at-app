import thunk from 'redux-thunk';
import logger from 'redux-logger';
import { applyMiddleware, compose } from 'redux';

let composeEnhancers = compose;
let middleware = [thunk];

if (process.env.ENVIRONMENT === 'dev') {
    middleware = [...middleware, logger];

    // add support for React dev tools
    composeEnhancers =
        typeof window === 'object' &&
        window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
            ? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__({
                  // name, actionsBlacklist, actionsCreators, serialize, etc ...
              })
            : compose;
}

export default composeEnhancers(applyMiddleware(...middleware));
