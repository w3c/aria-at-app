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
        url
        commandIds
        at {
          id
          name
        }
      references {
        refId
        value
        type
        linkText
      }
    }
  }
`;

export default ASSERTION_RESULT_FIELDS;
