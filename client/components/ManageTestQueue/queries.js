import { gql } from '@apollo/client';
import { AT_VERSION_FIELDS } from '@components/common/fragments';

export const ADD_AT_VERSION_MUTATION = gql`
  ${AT_VERSION_FIELDS}
  mutation AddAtVersion($atId: ID!, $name: String!, $releasedAt: Timestamp!) {
    at(id: $atId) {
      findOrCreateAtVersion(input: { name: $name, releasedAt: $releasedAt }) {
        ...AtVersionFields
      }
    }
  }
`;

export const EDIT_AT_VERSION_MUTATION = gql`
  ${AT_VERSION_FIELDS}
  mutation EditAtVersion(
    $atVersionId: ID!
    $name: String!
    $releasedAt: Timestamp!
  ) {
    atVersion(id: $atVersionId) {
      updateAtVersion(input: { name: $name, releasedAt: $releasedAt }) {
        ...AtVersionFields
      }
    }
  }
`;

export const DELETE_AT_VERSION_MUTATION = gql`
  mutation DeleteAtVersion($atVersionId: ID!) {
    atVersion(id: $atVersionId) {
      deleteAtVersion {
        isDeleted
        failedDueToTestResults {
          testPlanVersion {
            id
            title
          }
          testResult {
            id
          }
          testPlanReport {
            at {
              name
            }
            browser {
              name
            }
          }
        }
      }
    }
  }
`;
