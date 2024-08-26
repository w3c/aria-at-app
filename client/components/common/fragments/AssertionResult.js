import { gql } from '@apollo/client';

const ASSERTION_RESULT_FIELDS = gql`
  fragment AssertionResultFields on AssertionResult {
    __typename
    id
    passed
    assertion {
      id
      text
      phrase
      priority
    }
  }
`;

export default ASSERTION_RESULT_FIELDS;
