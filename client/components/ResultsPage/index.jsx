import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import { getTestCycles, getTestsForRunsCycle } from '../../actions/cycles';

class ResultsPage extends Component {
    constructor(props) {
        super(props);
    }

    componentDidMount() {
        const { dispatch, cycleById, fetchCycleResults } = this.props;

        if (!cycleById) {
            dispatch(getTestCycles());
        }

        if (fetchCycleResults.length) {
            for (let cycleId of fetchCycleResults) {
                dispatch(getTestsForRunsCycle(cycleId));
            }
        }
    }

    componentDidUpdate(prevProps, prevState, snapshot) {
        const { dispatch, fetchCycleResults } = this.props;

        // If we now know which cycle's results to fetch, fetch them
        if (fetchCycleResults.length !== prevProps.fetchCycleResults.length) {
            for (let cycleId of this.props.fetchCycleResults) {
                dispatch(getTestsForRunsCycle(cycleId));
            }
        }
        return null;
    }


    render() {
        const {
            cyclesById,
            testsByRunId
        } = this.props;

        const loading = <div data-test="test-queue-loading">Loading</div>;

        if (!Object.keys(cyclesById).length) {
            return loading;
        }

        console.log("cyclesById", cyclesById);
        console.log("testsByRunId", testsByRunId);

        for (let cycle of Object.values(cyclesById)) {
            console.log("Cycle: ", cycle.name);

            for (let run of Object.values(cycle.runsById)) {

                // The run object has:
                //    run.run_status   -- set to "null" (which is inprogress) or "draft" or "final"
                //    run.at_name      -- the name of the at
                //    run.browser_name -- the name of the browser
                //    etc
                console.log("Run data: ", run);

                // The tests are a list of tests, with meta data about the test and:
                //     test.results     -- an object of test results keyed by user_id of the tester who produced the results
                console.log("Test results data: ", testsByRunId[run.id]);
            }
        }

        return (
            <Fragment>
                <Helmet>
                    <title>{`ARIA-AT Results`}</title>
                </Helmet>
                <h1>Results</h1>
            </Fragment>
        );
    }
}

ResultsPage.propTypes = {
    cyclesById: PropTypes.object,
    testsByRunId: PropTypes.object,
    fetchCycleResults: PropTypes.array,
    dispatch: PropTypes.func
};

const mapStateToProps = (state, ownProps) => {
    const { cyclesById, testsByRunId } = state.cycles;

    let fetchCycleResults = Object.keys(cyclesById);

    return {
        cyclesById,
        testsByRunId,
        fetchCycleResults
    };
};

export default connect(mapStateToProps)(ResultsPage);
