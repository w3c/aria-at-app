import { gql } from '@apollo/client';
import { ASSERTION_RESULT_FIELDS } from '@components/common/fragments/index';

/**
 * @param {'simple'|'all'} type
 * @returns {*}
 */
const SCENARIO_RESULT_FIELDS = (type = 'simple') => {
  switch (type) {
    case 'simple':
      return gql`
        fragment ScenarioResultFieldsSimple on ScenarioResult {
          __typename
          id
          scenario {
            commands {
              id
              text
              atOperatingMode
            }
          }
        }
      `;
    case 'all':
      return gql`
        ${ASSERTION_RESULT_FIELDS}
        fragment ScenarioResultFieldsAll on ScenarioResult {
          __typename
          id
          output
          untestable
          match {
            type
            source {
              testPlanReportId
              testPlanVersionId
              testResultId
              scenarioId
              atVersionId
              atVersionName
              browserVersionId
              browserVersionName
              output
            }
          }
          scenario {
            id
            commands {
              id
              text
              atOperatingMode
            }
          }
          assertionResults {
            ...AssertionResultFields
          }
          mustAssertionResults: assertionResults(priority: MUST) {
            ...AssertionResultFields
          }
          shouldAssertionResults: assertionResults(priority: SHOULD) {
            ...AssertionResultFields
          }
          mayAssertionResults: assertionResults(priority: MAY) {
            ...AssertionResultFields
          }
          hasNegativeSideEffect
          negativeSideEffects {
            id
            text
            impact
            details
            encodedId
            atBugs {
              id
              title
              url
              at {
                id
                name
              }
            }
          }
        }
      `;
  }
};

export default SCENARIO_RESULT_FIELDS;
