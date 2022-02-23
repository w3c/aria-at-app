import React from 'react';
import { render, screen } from '@testing-library/react';
import TestPlanUpdater from './TestPlanUpdater';
import TestProviders from '../TestProviders/TestProviders';
import { waitForGraphQL } from '../GraphQLProvider';

describe('TestPlanUpdater', () => {
    it('completes initial queries and renders the loaded UI', async () => {
        render(
            <TestProviders setInitialUrl="/?id=1">
                <TestPlanUpdater />
            </TestProviders>
        );

        await waitForGraphQL();

        expect(
            screen.getByText('Pick a Version', { selector: 'h2' })
        ).toBeTruthy();

        expect(screen.getByText(/Current version is .+ (\w{7})/)).toBeTruthy();
    });

    it('allows the user to pick a version', () => {});
});
