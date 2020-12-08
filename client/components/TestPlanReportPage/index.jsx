import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Table } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getPublishedRuns } from '../../actions/runs';
import PropTypes from 'prop-types';
import { ProgressBar } from 'react-bootstrap';
import {
    generateTechPairs,
    generateApgExample,
    calculateTotalPercentageForTechPair,
    calculatePercentage,
    formatFraction,
    formatInteger
} from '../ReportsPage/utils';

class TestPlanReportPage extends Component {
    constructor() {
        super();
        this.state = {
            techPairs: [],
            apgExample: null
        };

        this.generateTables = this.generateTables.bind(this);
        this.generateTableRows = this.generateTableRows.bind(this);
    }

    componentDidMount() {
        const { dispatch, publishedRunsById } = this.props;
        if (!publishedRunsById) {
            dispatch(getPublishedRuns());
        } else {
            this.generateInitialStateFromRuns();
        }
    }

    componentDidUpdate(prevProps) {
        const { publishedRunsById } = this.props;
        if (publishedRunsById !== prevProps.publishedRunsById) {
            this.generateInitialStateFromRuns();
        }
    }

    generateInitialStateFromRuns() {
        const { publishedRunsById, testPlanId } = this.props;
        let techPairs = generateTechPairs(publishedRunsById);
        let apgExample = generateApgExample(publishedRunsById, techPairs, testPlanId);
        this.setState({ techPairs, apgExample });
    }

    generateTableRows(testsWithMetaData) {
		const { apgExample } = this.state;
		const {
			requiredAssertions,
			passingRequiredAssertions,
			optionalAssertions,
			passingOptionalAssertions,
			unexpectedBehaviors
		} = testsWithMetaData;
		let rows = [];
		rows.push(
			<tr key='summary'>
				<th scope="row" key="summary">
					All Tests
				</th>

				<td
					key='summary-required'
				>
					{formatFraction(
						passingRequiredAssertions,
						requiredAssertions
					)}
				</td>
				<td
					key='summary-optional'
				>
					{formatFraction(
						passingOptionalAssertions,
						optionalAssertions
					)}
				</td>
				<td
					key='summary-unexpected'
				>
					{formatInteger(unexpectedBehaviors)}
				</td>
			</tr>
		);
		return rows;
	}

    generateTables() {
        const { apgExample, techPairs } = this.state;
        let tables = [];

        this.state.techPairs
            .forEach(({ browser, at }, techPairIndex) => {
                const testsWithMetaData =
                    apgExample.testsWithMetaDataIndexedByTechPair[techPairIndex];
                if (testsWithMetaData.testsWithResults.length > 0) {
                    tables.push(
                        <Table bordered hover>
                            <caption>
                                {at} with {browser}
                            </caption>
                            <thead>
                                <tr>
                                    <th key="tests" scope="col">
                                    	Test Name
                                    </th>
                                    <th key="required" scope="col">
                                        Required Assertions
                                    </th>
                                    <th key="optional" scope="col">
                                        Optional Assertions
                                    </th>
                                    <th key="unexpected" scope="col">
                                        Unexpected Behaviors
                                    </th>
                                </tr>
                            </thead>
                            <tbody>
                                {this.generateTableRows(testsWithMetaData)}
                            </tbody>
                        </Table>
                    );
                }
            });

        return tables;
    }

    render() {
        const { apgExample } = this.state;

        if (!apgExample) {
            return <div>Loading Test Plan Report Page...</div>;
        }

        return (
            <Fragment>
                <Helmet>
                    <title>{`ARIA-AT Report ${apgExample.exampleName}`}</title>
                </Helmet>
                <h1>{apgExample.exampleName} Report Page</h1>
                {this.generateTables()}
            </Fragment>
        );
    }
}

TestPlanReportPage.propTypes = {
    dispatch: PropTypes.func,
    publishedRunsById: PropTypes.object,
    testPlanId: PropTypes.number
};


const mapStateToProps = (state, ownProps) => {
    const { publishedRunsById } = state.runs;

    const testPlanId = parseInt(ownProps.match.params.testPlanId);

    return { publishedRunsById, testPlanId };
};

export default connect(mapStateToProps)(TestPlanReportPage);
