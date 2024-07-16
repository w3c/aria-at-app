import { gql } from '@apollo/client';

const SCENARIO_RESULT_FIELDS = gql`
  fragment ScenarioResultFields on ScenarioResult {
    __typename
  }
`;

export default SCENARIO_RESULT_FIELDS;
