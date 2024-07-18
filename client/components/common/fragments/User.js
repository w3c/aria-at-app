import { gql } from '@apollo/client';

const USER_FIELDS = gql`
  fragment UserFields on User {
    __typename
    id
    username
    isBot
  }
`;

export default USER_FIELDS;
