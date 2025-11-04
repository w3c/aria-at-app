import React from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import { TestPlanReportPropType, TestPropType } from '../../common/proptypes';
import styles from './ReviewConflicts.module.css';

const ReviewConflictsContent = ({
  testPlanReport,
  test,
  hideHeadline = false
}) => {
  const conflicts = testPlanReport.conflicts.filter(
    conflict => conflict.source.test.id === test.id
  );

  if (conflicts.length === 0) return null;

  const commandString = scenario => {
    return scenario.commands.map(command => command.text).join(', then ');
  };

  const renderConflict = conflict => {
    const assertion = conflict.source.assertion;
    if (assertion) return renderAssertionResultConflict(conflict);
    return renderNegativeSideEffectConflict(conflict);
  };

  const renderAssertionResultConflict = ({
    source: { scenario, assertion },
    conflictingResults
  }) => {
    const results = conflictingResults.map(result => {
      const { testPlanRun, scenarioResult, assertionResult } = result;
      let assertionResultFormatted;
      assertionResultFormatted = scenarioResult.untestable
        ? 'untestable'
        : assertionResult.passed
        ? 'passing'
        : 'failing';
      return (
        <li key={testPlanRun.id}>
          Tester {testPlanRun.tester.username} recorded output &quot;
          {scenarioResult.output}&quot; and marked assertion as{' '}
          {assertionResultFormatted}.
        </li>
      );
    });

    return (
      <li key={`${assertion.id}-${scenario.id}`}>
        <h3>
          Assertion Results for &quot;
          {commandString(scenario)}&quot; Command and &quot;
          {assertion.text}&quot; Assertion
        </h3>
        <ul>{results}</ul>
      </li>
    );
  };

  const renderNegativeSideEffectConflict = ({
    source: { scenario },
    conflictingResults
  }) => {
    const results = conflictingResults.map(result => {
      const { testPlanRun, scenarioResult } = result;
      let resultFormatted;
      if (scenarioResult.negativeSideEffects.length) {
        resultFormatted = scenarioResult.negativeSideEffects
          .map(({ text, impact, details }) => {
            return `"${text} (Details: ${details}, Impact: ${impact})"`;
          })
          .join(' and ');
        if (scenarioResult.untestable)
          resultFormatted = `${resultFormatted} and marked the assertions as untestable`;
      } else {
        resultFormatted = 'no negative side effect';
      }
      return (
        <li key={testPlanRun.id}>
          Tester {testPlanRun.tester.username} recorded output &quot;
          {scenarioResult.output}&quot; and noted {resultFormatted}.
        </li>
      );
    });

    return (
      <li key={scenario.id}>
        <h3>
          Negative Side Effects for &quot;{commandString(scenario)}
          &quot; Command
        </h3>
        <ul>{results}</ul>
      </li>
    );
  };

  return (
    <div
      className={clsx(
        styles.conflictsContainer,
        hideHeadline && styles.hideHeadline
      )}
    >
      <h2>Review Conflicts for &quot;{test.title}&quot;</h2>
      <ol>{conflicts.map(renderConflict)}</ol>
    </div>
  );
};

ReviewConflictsContent.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  test: TestPropType.isRequired,
  hideHeadline: PropTypes.bool,
  conflictMarkdownRef: PropTypes.shape({
    current: PropTypes.string
  })
};

export default ReviewConflictsContent;
