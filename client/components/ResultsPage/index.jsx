import React, { Component, Fragment } from 'react';
import PropTypes, { object } from 'prop-types';
import { Helmet } from 'react-helmet';
import { connect } from 'react-redux';
import Datasort from 'react-data-sort';
import { getTestCycles, getTestsForRunsCycle } from '../../actions/cycles';

class ResultsPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            sortBy: "name",
            direction: "asc",
            activePage: 0
        };
    };

    setSortBy = sortBy => {
        this.setState({ sortBy });
    };
    toggleDirection = () => {
        this.setState({
            direction: this.state.direction === "asc" ? "desc" : "asc"
        });
    };
    goToPage = activePage => {
        this.setState({ activePage });
    };
    prevPage = () => {
        this.setState(({ activePage }) => ({
            activePage: activePage - 1
        }));
    };
    nextPage = () => {
        this.setState(({ activePage }) => ({
            activePage: activePage + 1
        }));
    };

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
            testsByRunId,
            sortBy,
            direction,
            activePage,
        } = this.props;

        if (!Object.keys(cyclesById).length) {
            return <div>Loading</div>;
        }

        // eslint-disable-next-line no-console
        console.log('cyclesById', cyclesById);
        // eslint-disable-next-line no-console
        console.log('testsByRunId', testsByRunId);


        for (let cycle of Object.values(cyclesById)) {
            // eslint-disable-next-line no-console
            console.log('Cycle: ', cycle.name);

            for (let run of Object.values(cycle.runsById)) {
                // The run object has:
                //    run.run_status   -- set to "null" (which is inprogress) or "draft" or "final"
                //    run.at_name      -- the name of the at
                //    run.browser_name -- the name of the browser
                //    etc
                // eslint-disable-next-line no-console
                console.log('Run data: ', run);

                // The tests are a list of tests, with meta data about the test and:
                //     test.results     -- an object of test results keyed by user_id of the tester who produced the results
                // eslint-disable-next-line no-console
                console.log('Test results data: ', testsByRunId[run.id]);
            }
        }
        let data = Object.values(cyclesById);

        return (
            <Fragment>
                <Helmet>
                    <title>{`ARIA-AT Results`}</title>
                </Helmet>
                <h1>Test Reports</h1>
            </Fragment>
        ),
            <Datasort
                data={data}
                sortBy={sortBy}
                direction={direction}
                activePage={activePage}
                paginate
                render={({ data, pages }) => {
                    return (
                        <div style={{ minWidth: 500 }}>
                            <table border={1} cellPadding={2} style={{ width: "100%" }}>
                                <TableHead
                                    setSortBy={this.setSortBy}
                                    sortBy={sortBy}
                                    direction={direction}
                                    toggleDirection={this.toggleDirection}
                                />
                                <TableBody data={data}/>
                            </table>
                            <Flex style={{ justifyContent: "space-between" }}>
                                <GoToPage goToPage={this.goToPage} pages={pages}/>
                                <PageIndicator pages={pages} activePage={activePage}/>
                                <Navigation
                                    activePage={activePage}
                                    goToPage={this.goToPage}
                                    nextPage={this.nextPage}
                                    prevPage={this.prevPage}
                                    pages={pages}
                                />
                            </Flex>
                        </div>
                    );
                }}
            />
    }
}


function TableHead({ setSortBy, sortBy, direction, toggleDirection }) {
    const columns = [
        { key: "cycle", title: "Test Cycle" },
        { key: "at", title: "Assistive Technology" },
        { key: "browser", title: "Browser" },
        { key: "plan", title: "Test Plan" },
        { key: "status", title: "Status (pass/fail)"}
    ];
    const items = columns.map(({ key, title }) => {
        const active = key === sortBy;
        return (
            <HeadToggle
                key={key}
                active={active}
                onClick={() => {
                    if (active) {
                        toggleDirection();
                    }
                    setSortBy(key);
                }}
            >
                {title} {active ? direction === "asc" ? "▲" : "▼" : null}
            </HeadToggle>
        );
    });
    return (
        <thead>
        <tr>{items}</tr>
        </thead>
    );
}

function HeadToggle({ children, active, onClick }) {
    return (
        <td
            onClick={onClick}
            style={{ fontWeight: active ? "bold" : "normal", cursor: "pointer" }}
        >
            {children}
        </td>
    );
}

function TableBody({ data }) {
    return <tbody>
    {data.map(({ test_cycle_id, at_name, browser_name, apg_example_name, run_status }) => <tr key={test_cycle_id}>
            <td>{test_cycle_id}</td>
            <td>{at_name}</td>
            <td>{browser_name}</td>
            <td>{apg_example_name}</td>
            <td>{run_status}</td>
        </tr>)}
    </tbody>;
}

function Flex({ children, style }) {
    return <div style={{ display: "flex", ...style }}>{children}</div>;
}

function GoToPage({ goToPage, pages }) {
    const options = [];
    for (let i = 0; i < pages; i++) {
        options.push(<option value={i}>{i + 1}</option>);
    }
    return (
        <div>
            Go to page{" "}
            <select onChange={e => goToPage(parseInt(e.target.value))}>
                {options}
            </select>
        </div>
    );
}

function Navigation({ activePage, goToPage, nextPage, prevPage, pages }) {
    return (
        <Flex>
            <button disabled={activePage === 0} onClick={() => goToPage(0)}>
                {"<<"}
            </button>
            <button disabled={activePage === 0} onClick={prevPage}>
                {"<"}
            </button>

            <button disabled={activePage === pages - 1} onClick={nextPage}>
                {">"}
            </button>
            <button
                disabled={activePage === pages - 1}
                onClick={() => goToPage(pages - 1)}
            >
                {">>"}
            </button>
        </Flex>
    );
}

function PageIndicator({ pages, activePage }) {
    return (
        <div>
            <b>{activePage + 1}</b> / {pages}
        </div>
    );
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
