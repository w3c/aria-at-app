import { gql } from '@apollo/client';

const USER_FIELDS = gql`
  fragment UserFields on User {
    __typename
    id
    username
    roles
    isBot
  }
`;

export default USER_FIELDS;
