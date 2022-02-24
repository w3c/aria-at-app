import React from 'react';
import { mount } from 'enzyme';
import TestPlanUpdater from './TestPlanUpdater';
import TestProviders from '../TestProviders/TestProviders';
import { waitForGraphQL } from '../GraphQLProvider';
import { Alert, Button } from 'react-bootstrap';

describe('TestPlanUpdater', () => {
    let wrapper;

    beforeAll(async () => {
        wrapper = mount(
            <TestProviders setInitialUrl="/?id=1">
                <TestPlanUpdater />
            </TestProviders>
        );

        await waitForGraphQL();
        wrapper.update();
    });

    it('renders loaded UI', async () => {
        const selectedReportAlert = wrapper.find(Alert).at(0);
        expect(selectedReportAlert.text()).toMatch(
            /^(JAWS|NVDA|VoiceOver.+) .+ with (Chrome|Firefox|Safari) .+ .+$/
        );
    });

    it('allows the user to pick a version', async () => {
        const versionSelect = wrapper.find('select');

        const disabledOption = versionSelect.find('option[disabled=true]');
        expect(disabledOption.text()).toMatch(/^\[Current Version\]/);

        const firstValidOption = versionSelect
            .find('option[disabled=false]')
            .at(1);

        versionSelect.simulate('change', {
            target: { value: firstValidOption.instance().value }
        });

        await waitForGraphQL();
        wrapper.update();

        const createNewReportAlert = wrapper.find(Alert).at(2);
        expect(createNewReportAlert.text()).toMatch(
            /Found \d+ test results for testers? \w+/
        );
    });

    it('creates a new report', async () => {
        const createNewReportButton = wrapper.find(Button).first();
        expect(createNewReportButton.text()).toBe('Create Updated Report');

        // createNewReportButton.simulate('click');
        // await waitForGraphQL();
        // wrapper.update();

        // console.log(wrapper.debug());
    });
});
