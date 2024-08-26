import { gql } from '@apollo/client';

const BROWSER_FIELDS = gql`
  fragment BrowserFields on Browser {
    __typename
    id
    key
    name
  }
`;

export default BROWSER_FIELDS;
