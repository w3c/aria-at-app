import React from 'react';
import PropTypes from 'prop-types';
import { Table } from 'react-bootstrap';
import nextId from 'react-id-generator';
import { getMetrics } from 'shared';
import './TestPlanResultsTable.css';
import {
  TestPlanReportMetricsPropType,
  TestPropType,
  TestResultPropType
} from '../proptypes';
import { NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES } from '../../../utils/constants';
import getAssertionPhraseOrText from '../../../utils/getAssertionPhraseOrText';

const getAssertionResultText = (assertionResult, untestable) => {
  const { passed, priorityString, describesSideEffects } = assertionResult;

  // In untestable scenarios, the result of test-specific assertions should be
  // reported as "untestable" because their state is indeterminate. The other
  // assertions (that is, those describing the presence of side effects) should
  // be reported as "Passed" or "Failed" as normal because the absence/presence
  // of side effects *can* be conclusively reported.
  if (untestable && !describesSideEffects) {
    return 'Untestable';
  }
  if (priorityString === 'MAY') {
    return passed ? 'Supported' : 'Unsupported';
  }
  return passed ? 'Passed' : 'Failed';
};

const renderAssertionRow = (assertionResult, untestable) => {
  return (
    <tr key={`${assertionResult.id}__${nextId()}`}>
      <td>{assertionResult.priorityString}</td>
      <td>{getAssertionPhraseOrText(assertionResult.assertion)}</td>
      <td>{getAssertionResultText(assertionResult, untestable)}</td>
    </tr>
  );
};

const CommandHeading = ({ level, commandsString, metrics }) => {
  const Heading = `h${level}`;
  const {
    assertionsPassedCount,
    assertionsUntestableCount,
    mustAssertionsFailedCount,
    shouldAssertionsFailedCount,
    mayAssertionsFailedCount
  } = metrics;

  const mustShouldAssertionsFailedCount =
    mustAssertionsFailedCount + shouldAssertionsFailedCount;
  const ambiguousText = assertionsUntestableCount
    ? `${assertionsUntestableCount} untestable`
    : `${mayAssertionsFailedCount} unsupported`;

  return (
    <Heading>
      {commandsString}&nbsp;Results:&nbsp;
      {assertionsPassedCount} passed,&nbsp;
      {mustShouldAssertionsFailedCount} failed,&nbsp;
      {ambiguousText}
    </Heading>
  );
};

CommandHeading.propTypes = {
  level: PropTypes.number.isRequired,
  commandsString: PropTypes.string.isRequired,
  metrics: TestPlanReportMetricsPropType.isRequired
};

const TestPlanResultsTable = ({
  test,
  testResult,
  tableClassName = '',
  optionalHeader = null,
  commandHeadingLevel = 3
}) => {
  const NegativeSideEffectsHeading = `h${commandHeadingLevel}`;

  return (
    <>
      {optionalHeader}
      {testResult.scenarioResults.map((scenarioResult, index) => {
        const metrics = getMetrics({ scenarioResult });
        const {
          severeImpactPassedAssertionCount,
          moderateImpactPassedAssertionCount
        } = metrics;

        const hasNoSevereNegativeSideEffect =
          severeImpactPassedAssertionCount > 0;
        const hasNoModerateNegativeSideEffect =
          moderateImpactPassedAssertionCount > 0;

        // Rows are sorted by priority descending, then result (failures then passes), then
        // assertion order. Assertion order refers to the order of assertion columns in the
        // tests.csv file.
        const mustAssertionResults = scenarioResult.mustAssertionResults
          .slice()
          .sort((a, b) => (a.passed === b.passed ? 0 : a.passed ? 1 : -1));

        const shouldAssertionResults = scenarioResult.shouldAssertionResults
          .slice()
          .sort((a, b) => (a.passed === b.passed ? 0 : a.passed ? 1 : -1));

        const mayAssertionResults = scenarioResult.mayAssertionResults
          .slice()
          .sort((a, b) => (a.passed === b.passed ? 0 : a.passed ? 1 : -1));

        // Workaround:
        // Remove instances of content inside '()' to address edge case of
        // COMMAND_TEXT (OPERATING_MODE) then COMMAND_TEXT (OPERATING_MODE).
        // OPERATING_MODE should only show once
        const bracketsRegex = /\((.*?)\)/g;

        const commandsString = scenarioResult.scenario.commands
          .map(({ text }, index) => {
            if (index !== scenarioResult.scenario.commands.length - 1)
              text = text.replace(bracketsRegex, '');
            return text.trim();
          })
          .join(' then ');

        const sortedAssertionResults = [
          ...mustAssertionResults.map(e => ({
            ...e,
            priorityString: 'MUST'
          })),
          // NOTE: Each command has 2 additional assertions:
          // * Other behaviors that create severe negative impact
          // * Other behaviors that create moderate negative impact
          // TODO: Include this from the db assertions now that this has been agreed upon
          {
            id: `NegativeSideEffect_MUST_${nextId()}`,
            assertion: {
              text: NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES.SEVERE
            },
            describesSideEffects: true,
            passed: hasNoSevereNegativeSideEffect,
            priorityString: 'MUST'
          },
          ...shouldAssertionResults.map(e => ({
            ...e,
            priorityString: 'SHOULD'
          })),
          // TODO: Include this in the assertions now that it has been agreed upon
          {
            id: `NegativeSideEffect_SHOULD_${nextId()}`,
            assertion: {
              text: NEGATIVE_SIDE_EFFECT_ASSERTION_PHRASES.MODERATE
            },
            describesSideEffects: true,
            passed: hasNoModerateNegativeSideEffect,
            priorityString: 'SHOULD'
          },
          ...mayAssertionResults.map(e => ({
            ...e,
            priorityString: 'MAY'
          }))
        ].sort((a, b) => a.passed - b.passed);

        return (
          <React.Fragment key={scenarioResult.id}>
            <CommandHeading
              level={commandHeadingLevel}
              commandsString={commandsString}
              metrics={metrics}
            />
            <p className="test-plan-results-response-p">
              {test.at?.name} Response:
            </p>
            <blockquote className="test-plan-results-blockquote">
              {scenarioResult.output}
            </blockquote>
            <Table
              bordered
              responsive
              aria-label={`Results for test ${test.title}`}
              className={`test-plan-results-table ${tableClassName}`}
            >
              <caption>{commandsString} Results</caption>
              <thead>
                <tr>
                  <th>Priority</th>
                  <th>Assertion</th>
                  <th>Result</th>
                </tr>
              </thead>
              <tbody>
                {sortedAssertionResults.map(assertionResult =>
                  renderAssertionRow(assertionResult, scenarioResult.untestable)
                )}
              </tbody>
            </Table>
            {scenarioResult.negativeSideEffects.length ? (
              <>
                <NegativeSideEffectsHeading>
                  Negative side effects of {commandsString}
                </NegativeSideEffectsHeading>
                <Table
                  bordered
                  responsive
                  aria-label={`Negative side effects of ${commandsString}`}
                  className={`test-plan-negative-side-effects-table ${tableClassName}`}
                >
                  <thead>
                    <tr>
                      <th>Side Effect</th>
                      <th>Details</th>
                      <th>Impact</th>
                    </tr>
                  </thead>
                  <tbody>
                    {scenarioResult.negativeSideEffects.map(
                      ({ id, text, details, impact }) => (
                        <tr key={id}>
                          <td>{text}</td>
                          <td>{details}</td>
                          <td>{impact}</td>
                        </tr>
                      )
                    )}
                  </tbody>
                </Table>
              </>
            ) : (
              `The command '${commandsString}' did not cause any negative side effects.`
            )}
            {/* Do not show separator below last item */}
            {index !== testResult.scenarioResults.length - 1 ? (
              <hr aria-hidden="true" />
            ) : null}
          </React.Fragment>
        );
      })}
    </>
  );
};

TestPlanResultsTable.propTypes = {
  test: TestPropType.isRequired,
  testResult: TestResultPropType.isRequired,
  tableClassName: PropTypes.string,
  optionalHeader: PropTypes.node,
  commandHeadingLevel: PropTypes.number
};

export default TestPlanResultsTable;
