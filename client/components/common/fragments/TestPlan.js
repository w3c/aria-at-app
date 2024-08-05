import { gql } from '@apollo/client';

const TEST_PLAN_FIELDS = gql`
  fragment TestPlanFields on TestPlan {
    __typename
    id
    title
    directory
  }
`;

export default TEST_PLAN_FIELDS;
