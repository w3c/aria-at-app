import React from 'react';
import Enzyme, { shallow } from 'enzyme';
import EnzymeAdapter from 'enzyme-adapter-react-16';
Enzyme.configure({ adapter: new EnzymeAdapter() });
import { storeFactory } from './util';
import {
    generateStateMatrix,
    calculateTotalObjectPercentage,
    findAndCalculatePercentage
} from '../components/ReportsPage/utils';
import ReportsPage from '../components/ReportsPage';

const publishedRunsById = {
    1: {
        id: 1,
        apg_example_name: 'Editor Menubar Example',
        at_name: 'JAWS',
        browser_name: 'Firefox',
        tests: [
            {
                execution_order: 1,
                file:
                    'tests/menubar-editor/test-01-navigate-to-menubar-reading.html',
                id: 57,
                name: 'Navigate to menubar in reading mode',
                results: {
                    1: {
                        result: {
                            status: 'PASS'
                        }
                    }
                }
            }
        ]
    },
    2: {
        id: 2,
        apg_example_name: 'Checkbox Example (Two State)',
        at_name: 'NVDA',
        browser_name: 'Firefox',
        tests: [
            {
                execution_order: 1,
                file:
                    'tests/checkbox/test-01-navigate-to-unchecked-checkbox-reading.html',
                id: 1,
                name: 'Navigate to an unchecked checkbox in reading mode',
                results: {
                    1: {
                        result: {
                            status: 'PASS'
                        }
                    }
                }
            }
        ]
    }
};

describe('utils', () => {
    test('generateStateMatrix', () => {
        /**
         *  Expecting a matrix like this:
         * 
         * 
            [
                [null, "JAWS", "NVDA"],
                ["Firefox", { "Editor Menubar Example" : { total: 1, pass: 1 } }, { "Checkbox Example (Two State)" : { total: 1, pass: 1 } }]
            ]
         * 
         */
        const matrix = generateStateMatrix(publishedRunsById);

        // Check the number of rows
        expect(matrix.length).toBe(2);

        // Check the number of columns
        expect(matrix[0].length).toBe(3);

        // Check that the intersection of JAWS and Firefox is an object
        expect(matrix[1][1]).toEqual({
            'Editor Menubar Example': { total: 1, pass: 1 }
        });

        // Check that the intersection of NVDA and Firefox is an object
        expect(matrix[1][2]).toEqual({
            'Checkbox Example (Two State)': { total: 1, pass: 1 }
        });
    });

    test('calculateTotalObjectPercentage', () => {
        const objectToTotal = {
            'Editor Menubar Example': { total: 1, pass: 1 },
            'Checkbox Example (Two State)': { total: 1, pass: 1 }
        };

        const totalPercent = calculateTotalObjectPercentage(objectToTotal);
        expect(totalPercent).toBe(100);
    });

    test('findAndCalculatePercentage', () => {
        const matrix = generateStateMatrix(publishedRunsById);
        const percentage = findAndCalculatePercentage(
            matrix,
            publishedRunsById[1].at_name,
            publishedRunsById[1].browser_name,
            publishedRunsById[1].apg_example_name
        );
        expect(percentage).toBe(100);
    });
});

describe('render', () => {
    test('generateTopLevelData()', () => {
        const techMatrix = generateStateMatrix(publishedRunsById);
        const store = storeFactory({});
        const wrapper = shallow(<ReportsPage store={store} />)
            .dive()
            .dive();
        wrapper.setState({
            techMatrix
        });
        const {
            techPairHeaders,
            topLevelRowData
        } = wrapper.instance().generateTopLevelData();

        expect(techPairHeaders.length).toBe(2);
        expect(techPairHeaders[0].props.children.join('')).toBe(
            'JAWS with Firefox'
        );
        expect(techPairHeaders[1].props.children.join('')).toBe(
            'NVDA with Firefox'
        );

        expect(topLevelRowData.length).toBe(3);
        // Second child is the string. First child is the icon
        expect(topLevelRowData[0].props.children[1]).toBe(
            'ARIA Design Pattern Example'
        );
    });

    test('generateApgExampleRows()', () => {
        const techMatrix = generateStateMatrix(publishedRunsById);
        const store = storeFactory({ runs: { publishedRunsById } });
        const wrapper = shallow(<ReportsPage store={store} />)
            .dive()
            .dive();
        wrapper.setState({
            techMatrix
        });

        let apgExampleRows = [];
        const { techPairHeaders } = wrapper.instance().generateTopLevelData();
        wrapper
            .instance()
            .generateApgExampleRows(apgExampleRows, techPairHeaders);

        expect(apgExampleRows[0].key).toContain('Editor Menubar Example');
        expect(apgExampleRows[1].key).toContain('Checkbox Example (Two State)');
    });
});
