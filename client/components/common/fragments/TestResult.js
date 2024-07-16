import { gql } from '@apollo/client';

const TEST_RESULT_FIELDS = gql`
  fragment TestResultFields on TestResult {
    __typename
    id
    startedAt
    completedAt
  }
`;

export default TEST_RESULT_FIELDS;
