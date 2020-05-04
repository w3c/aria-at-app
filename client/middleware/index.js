import thunk from 'redux-thunk';
import logger from 'redux-logger'
import { applyMiddleware } from 'redux';

let middleware = [thunk];

if (process.env.ENVIRONMENT === 'dev') middleware = [...middleware, logger];

export default applyMiddleware(...middleware);
