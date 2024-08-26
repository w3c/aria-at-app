import { gql } from '@apollo/client';

const COLLECTION_JOB_FIELDS = gql`
  fragment CollectionJobFields on CollectionJob {
    __typename
    id
    status
    externalLogsUrl
    testStatus {
      test {
        id
      }
      status
    }
  }
`;

export default COLLECTION_JOB_FIELDS;
