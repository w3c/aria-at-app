import { gql } from '@apollo/client';

const BROWSER_VERSION_FIELDS = gql`
  fragment BrowserVersionFields on BrowserVersion {
    __typename
    id
    name
  }
`;

export default BROWSER_VERSION_FIELDS;
