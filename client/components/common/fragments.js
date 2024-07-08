import { gql } from '@apollo/client';

export const ME_FIELDS = gql`
  fragment ME_FIELDS on User {
    __typename
    id
    username
    roles
  }
`;

export const USER_FIELDS = gql`
  fragment USER_FIELDS on User {
    __typename
    id
    username
    roles
    isBot
  }
`;

export const TEST_PLAN_VERSION_FIELDS = gql`
  fragment TEST_PLAN_VERSION_FIELDS on TestPlanVersion {
    __typename
  }
`;

export const TEST_PLAN_REPORT_FIELDS = gql`
  fragment TEST_PLAN_REPORT_FIELDS on TestPlanReport {
    __typename
  }
`;

export const SCENARIO_RESULT_FIELDS = gql`
  fragment SCENARIO_RESULT_FIELDS on ScenarioResult {
    __typename
  }
`;

export const TEST_PLAN_RUN_FIELDS = gql`
  fragment TEST_PLAN_RUN_FIELDS on TestPlanRun {
    __typename
  }
`;
