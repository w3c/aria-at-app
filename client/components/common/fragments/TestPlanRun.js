import { gql } from '@apollo/client';

const TEST_PLAN_RUN_FIELDS = gql`
  fragment TestPlanRunFields on TestPlanRun {
    __typename
    id
    initiatedByAutomation
    tester {
      id
      username
      isBot
    }
  }
`;

export default TEST_PLAN_RUN_FIELDS;
