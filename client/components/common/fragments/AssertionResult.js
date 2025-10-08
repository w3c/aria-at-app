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
      atBugs {
        id
        title
        bugId
        url
      }
    }
  }
`;

export default ASSERTION_RESULT_FIELDS;
