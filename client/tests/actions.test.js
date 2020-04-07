import { LOG_IN } from '../actions/types';
import { logIn } from '../actions/login';

describe('logIn Action', () => {
    test('returns an action with type `LOG_IN`', () => {
        const action = logIn();
        expect(action).toEqual({ type: LOG_IN });
    });
});
