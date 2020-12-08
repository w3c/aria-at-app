import React, { Component, Fragment } from 'react';
import { Helmet } from 'react-helmet';
import { Table, Collapse } from 'react-bootstrap';
import { connect } from 'react-redux';
import { getPublishedRuns } from '../../actions/runs';
import PropTypes from 'prop-types';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
    faFolderOpen,
    faFileAlt,
    faExternalLinkAlt,
    faFolder
} from '@fortawesome/free-solid-svg-icons';
import { ProgressBar } from 'react-bootstrap';
import {
    generateTechPairs,
    generateApgExamples,
    calculateTotalPercentageForTechPair,
    calculatePercentage,
    formatFraction,
    formatInteger
} from './utils';

class ReportsPage extends Component {
    constructor() {
        super();
        this.state = {
            techPairs: [],
            apgExamples: []
        };

        this.generateInitialStateFromRuns = this.generateInitialStateFromRuns.bind(
            this
        );
        this.generateTechPairTableHeaders = this.generateTechPairTableHeaders.bind(
            this
        );
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
        const { publishedRunsById } = this.props;
        let techPairs = generateTechPairs(publishedRunsById);
        let apgExamples = generateApgExamples(publishedRunsById, techPairs);
        this.setState({ techPairs, apgExamples });
    }

    generateTechPairTableHeaders() {
        return this.state.techPairs
            .map(({ browser, at }) => {
                return (
                    <th scope="col" key={`${at} with ${browser}`}>
                        <span className="text-center">
                            {at} with {browser}
                        </span>
                        <br></br>
                        <span className="text-center">Passing Required Tests</span>
                    </th>
                );
            });
    }

    generateTableRows() {
        const { apgExamples, techPairs } = this.state;
        let tableRows = [];

        let topLevelRowData = [
            <th key="High level pattern" scope="row">
                All Design Pattern Examples
            </th>
        ];

        techPairs.forEach(({ browser, at }, index) => {
              const percentage = calculateTotalPercentageForTechPair(
                  apgExamples,
                  index
              );

              topLevelRowData.push(
                  <td key={`Percentage of ${at} with ${browser}`}>
                      <ProgressBar
                          now={percentage}
                          variant="info"
                          label={`${percentage}%`}
                      />
                  </td>
              );
        });

        tableRows.push(
            <tr key="ARIA Design Pattern Examples">{topLevelRowData}</tr>
        );

        apgExamples.forEach(
            (
                {
                    exampleName,
                    testNames,
                    testsWithMetaDataIndexedByTechPair
                }
            ) => {
                let exampleRow = [];
                exampleRow.push(
                    <th scope="row"
                        key={`example-${exampleName}-name`}
                    >
                        {exampleName}
                    </th>
                );
                techPairs.forEach(({ browser, at }, techPairIndex) => {
                      const testsWithMetaData =
                          testsWithMetaDataIndexedByTechPair[techPairIndex];

                      if (testsWithMetaData.testsWithResults.length > 0) {
                          const percentage = calculatePercentage(
                              testsWithMetaData.passingRequiredAssertions,
                              testsWithMetaData.requiredAssertions
                          );
                          exampleRow.push(
                              <td
                                  key={`data-${exampleName}-${at}-${browser}`}
                              >
                                  <ProgressBar
                                      now={percentage}
                                      variant="info"
                                      label={`${percentage}%`}
                                  />
                              </td>
                          );
                      } else {
                          exampleRow.push(
                              <td
                                  key={`data-${exampleName}-${at}-${browser}`}
                                  aria-label={`No results data for ${exampleName} on ${at} with ${browser}`}
                              >
                                  -
                              </td>
                          );
                      }
                });
                  tableRows.push(<tr key={exampleName}>{exampleRow}</tr>);
            });

        return tableRows;
    }

    render() {
        return (
            <Fragment>
                <Helmet>
                    <title>ARIA-AT Reports</title>
                </Helmet>
                <h1>Reports Page</h1>
                <Table bordered hover>
                    <thead>
                        <tr>
                            <th key="design-pattern-examples">
                                <h2>Design Pattern Examples</h2>
                            </th>
                            {this.generateTechPairTableHeaders()}
                        </tr>
                    </thead>
                    <tbody>{this.generateTableRows()}</tbody>
                </Table>
            </Fragment>
        );
    }
}

ReportsPage.propTypes = {
    dispatch: PropTypes.func,
    publishedRunsById: PropTypes.object
};

const mapStateToProps = state => {
    const { publishedRunsById } = state.runs;
    return { publishedRunsById };
};

export default connect(mapStateToProps)(ReportsPage);
