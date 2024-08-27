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

export const CREATE_REQUIRED_REPORT_MUTATION = gql`
  mutation CreateRequiredReport(
    $atId: ID!
    $browserId: ID!
    $phase: RequiredReportPhase!
  ) {
    requiredReport(atId: $atId, browserId: $browserId, phase: $phase) {
      createRequiredReport {
        atId
        browserId
        phase
      }
    }
  }
`;

export const UPDATE_REQUIRED_REPORT_MUTATION = gql`
  mutation UpdateRequiredReport(
    $atId: ID!
    $browserId: ID!
    $phase: RequiredReportPhase!
    $updateAtId: ID!
    $updateBrowserId: ID!
  ) {
    requiredReport(atId: $atId, browserId: $browserId, phase: $phase) {
      updateRequiredReport(atId: $updateAtId, browserId: $updateBrowserId) {
        atId
        browserId
        phase
      }
    }
  }
`;

export const DELETE_REQUIRED_REPORT_MUTATION = gql`
  mutation DeleteRequiredReport(
    $atId: ID!
    $browserId: ID!
    $phase: RequiredReportPhase!
  ) {
    requiredReport(atId: $atId, browserId: $browserId, phase: $phase) {
      deleteRequiredReport {
        atId
        browserId
        phase
      }
    }
  }
`;
