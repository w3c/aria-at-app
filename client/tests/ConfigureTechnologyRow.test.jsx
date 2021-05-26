import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import ConfigureTechnologyRow from '../components/ConfigureTechnologyRow';

describe('render', () => {
    describe('runTechnologies props', () => {
        test('when runTechnologies present, table rows should not have form elements', () => {
            const runTechnologies = {
                at_id: 1,
                at_version: 1,
                browser_id: 1,
                browser_version: 1,
            };
            const availableAts = [
                {
                    at_id: 1,
                    at_name: 'foo',
                },
            ];
            const availableBrowsers = [
                {
                    id: 1,
                    name: 'bar',
                },
            ];

            const component = shallow(
                <ConfigureTechnologyRow
                    runTechnologies={runTechnologies}
                    availableAts={availableAts}
                    availableBrowsers={availableBrowsers}
                />
            );
            expect(component.find('td')).toHaveLength(5);
            expect(component.find('td').every('.form-control')).toBe(false);
        });
    });
});
