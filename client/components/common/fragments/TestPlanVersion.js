import { gql } from '@apollo/client';

const TEST_PLAN_VERSION_FIELDS = gql`
  fragment TestPlanVersionFields on TestPlanVersion {
    __typename
    id
    title
    phase
    gitSha
    gitMessage
    versionString
    updatedAt
    draftPhaseReachedAt
    candidatePhaseReachedAt
    recommendedPhaseReachedAt
    recommendedPhaseTargetDate
    deprecatedAt
    testPageUrl
    metadata
    testPlan {
      directory
    }
  }
`;

export default TEST_PLAN_VERSION_FIELDS;
