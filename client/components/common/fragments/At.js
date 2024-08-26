import { gql } from '@apollo/client';

const AT_FIELDS = gql`
  fragment AtFields on At {
    __typename
    id
    key
    name
  }
`;

export default AT_FIELDS;
