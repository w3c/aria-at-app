import { gql } from '@apollo/client';
import { ASSERTION_RESULT_FIELDS } from '@components/common/fragments/index';

const SCENARIO_RESULT_FIELDS = (type = 'simple') => {
  switch (type) {
    case 'simple':
      return gql`
        fragment ScenarioResultFieldsSimple on ScenarioResult {
          __typename
        }
      `;
    case 'all':
      return gql`
        ${ASSERTION_RESULT_FIELDS}
        fragment ScenarioResultFieldsAll on ScenarioResult {
          __typename
          id
          output
          scenario {
            commands {
              id
              text
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
          unexpectedBehaviors {
            id
            text
            impact
            details
          }
        }
      `;
  }
};

export default SCENARIO_RESULT_FIELDS;
