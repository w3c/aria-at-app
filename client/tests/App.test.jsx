/**
 * @jest-environment jsdom
 */

import React from 'react';
import { render } from '@testing-library/react';
import App from '../components/App';
import GraphQLProvider from '../components/GraphQLProvider';

const setup = () => {
    return render(
        <GraphQLProvider>
            <App />
        </GraphQLProvider>
    );
};

test.skip('renders without crashing', () => {
    const wrapper = setup();
    expect(wrapper).toBeTruthy();
});
