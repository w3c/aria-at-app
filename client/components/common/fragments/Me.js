import { gql } from '@apollo/client';

const ME_FIELDS = gql`
  fragment MeFields on User {
    __typename
    id
    username
    roles
  }
`;

export default ME_FIELDS;
