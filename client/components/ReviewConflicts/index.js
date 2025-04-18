import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import clsx from 'clsx';
import TurndownService from 'turndown';
import { TestPlanReportPropType, TestPropType } from '../common/proptypes';
import styles from './ReviewConflicts.module.css';

const ReviewConflicts = ({
  testPlanReport,
  test,
  hideHeadline = false,
  conflictMarkdownRef = null
}) => {
  const contentRef = useRef();

  useEffect(() => {
    if (!contentRef.current || !conflictMarkdownRef) return;
    const turndownService = new TurndownService({ headingStyle: 'atx' });
    conflictMarkdownRef.current = turndownService.turndown(
      contentRef.current.outerHTML
    );
  });

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
    return renderUnexpectedBehaviorConflict(conflict);
  };

  const renderAssertionResultConflict = ({
    source: { scenario, assertion },
    conflictingResults
  }) => {
    const results = conflictingResults.map(result => {
      const { testPlanRun, scenarioResult, assertionResult } = result;
      let assertionResultFormatted;
      assertionResultFormatted = assertionResult.passed ? 'passing' : 'failing';
      return (
        <li key={testPlanRun.id}>
          Tester {testPlanRun.tester.username} recorded output &quot;
          {scenarioResult.output}&quot; and marked assertion as{' '}
          {assertionResultFormatted}.
        </li>
      );
    });

    return (
      <li key={`${assertion.id}-${commandString(scenario)}`}>
        <h3>
          Assertion Results for &quot;
          {commandString(scenario)}&quot; Command and &quot;
          {assertion.text}&quot; Assertion
        </h3>
        <ul>{results}</ul>
      </li>
    );
  };

  const renderUnexpectedBehaviorConflict = ({
    source: { scenario },
    conflictingResults
  }) => {
    const results = conflictingResults.map(result => {
      const { testPlanRun, scenarioResult } = result;
      let resultFormatted;
      if (scenarioResult.unexpectedBehaviors.length) {
        resultFormatted = scenarioResult.unexpectedBehaviors
          .map(({ text, impact, details }) => {
            return `"${text} (Details: ${details}, Impact: ${impact})"`;
          })
          .join(' and ');
      } else {
        resultFormatted = 'no unexpected behavior';
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
          Unexpected Behaviors for &quot;{commandString(scenario)}
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
      ref={contentRef}
    >
      <h2>Review Conflicts for &quot;{test.title}&quot;</h2>
      <ol>{conflicts.map(renderConflict)}</ol>
    </div>
  );
};

ReviewConflicts.propTypes = {
  testPlanReport: TestPlanReportPropType.isRequired,
  test: TestPropType.isRequired,
  hideHeadline: PropTypes.bool,
  conflictMarkdownRef: PropTypes.shape({
    current: PropTypes.string
  })
};

export default ReviewConflicts;
