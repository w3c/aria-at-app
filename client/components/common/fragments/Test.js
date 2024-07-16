import { gql } from '@apollo/client';

const TEST_FIELDS = gql`
  fragment TestFields on Test {
    __typename
    id
    title
    rowNumber
    testFormatVersion
  }
`;

export default TEST_FIELDS;
