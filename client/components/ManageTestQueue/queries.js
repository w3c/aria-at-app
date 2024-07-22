import { gql } from '@apollo/client';

export const ADD_AT_VERSION_MUTATION = gql`
  mutation AddAtVersion($atId: ID!, $name: String!, $releasedAt: Timestamp!) {
    at(id: $atId) {
      findOrCreateAtVersion(input: { name: $name, releasedAt: $releasedAt }) {
        id
        name
        releasedAt
      }
    }
  }
`;

export const EDIT_AT_VERSION_MUTATION = gql`
  mutation EditAtVersion(
    $atVersionId: ID!
    $name: String!
    $releasedAt: Timestamp!
  ) {
    atVersion(id: $atVersionId) {
      updateAtVersion(input: { name: $name, releasedAt: $releasedAt }) {
        id
        name
        releasedAt
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
          # To be used when listing the conflicting results
          testResult {
            id
          }
          # To be used when providing more details on the conflicting results
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
