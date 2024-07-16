import { gql } from '@apollo/client';

const AT_VERSION_FIELDS = gql`
  fragment AtVersionFields on AtVersion {
    __typename
    id
    name
    releasedAt
  }
`;

export default AT_VERSION_FIELDS;
