import React from 'react';
// import { mount } from 'enzyme';
import { render, screen } from '@testing-library/react';
import TestPlanUpdater from './TestPlanUpdater';
import { MemoryRouter } from 'react-router-dom';
import { waitForGraphQL } from '../GraphQLProvider/IsGraphQLLoadingProvider';
import GraphQLProvider from '../GraphQLProvider';

describe('TestPlanUpdater', () => {
    // eslint-disable-next-line
    it('tbd', async () => {
        render(
            <GraphQLProvider isTestMode={true}>
                <MemoryRouter initialEntries={['/?id=1']}>
                    <TestPlanUpdater />
                </MemoryRouter>
            </GraphQLProvider>
        );

        await waitForGraphQL();

        console.log(screen.getByText('Pick a Version', { selector: 'h2' }));

        screen.debug();
        // await new Promise(resolve => setTimeout(resolve, 1000));
        // console.log(wrapper.exists('h1'));
    });
});
