import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
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

        const runs = [];

        for (let cycle of Object.values(cyclesById)) {
            for (let run of Object.values(cycle.runsById)) {
                runs.push({
                    cycle: cycle.name,
                    at: run.at_name,
                    browser: run.browser_name,
                    plan: run.apg_example_name,
                    status: run.status
                });
            }
        }

        console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
        console.log(runs.length);


        return (
            <Fragment>
                <Helmet>
                    <title>{`ARIA-AT Results`}</title>
                </Helmet>
                <h1>Test Reports</h1>
            </Fragment>
        ),
            <Datasort
                data={runs}
                sortBy={sortBy}
                direction={direction}
                render={({ data, pages }) => {
                    return (
                        <div style={{ minWidth: 500 }}>
                            <table border={1} cellPadding={2} style={{ width: "100%" }}>
                                <TableHead
                                    setSortBy={this.setSortBy}
                                    sortBy={this.state.sortBy}
                                    direction={direction}
                                    toggleDirection={this.toggleDirection}
                                />
                              <TableBody data={data}/>
                            </table>
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
                <span>{title} {active ? direction === "asc" ? "▲" : "▼" : null}</span>
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
        <th
            tabIndex={-1}
            onClick={onClick}
            style={{ fontWeight: active ? "bold" : "normal", cursor: "pointer" }}
        >
            {children}
        </th>
    );
}

function TableBody({ data }) {
    return <tbody>
             {data.map(d => {
                   return (
                       <tr>
                         <td>{d.cycle}</td>
                         <td>{d.at}</td>
                         <td>{d.browser}</td>
                         <td>{d.plan}</td>
                         <td>{d.status}</td>
                       </tr>
                   );
               })}
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
