import { gql } from '@apollo/client';

const TEST_FIELDS = (type = 'simple') => {
  switch (type) {
    case 'simple':
      return gql`
        fragment TestFieldsSimple on Test {
          __typename
          id
          title
          rowNumber
          renderedUrl
          testFormatVersion
        }
      `;
    case 'all':
      return gql`
        fragment TestFieldsAll on Test {
          __typename
          id
          title
          rowNumber
          renderedUrl
          testFormatVersion
          ats {
            id
            key
            name
          }
          renderedUrl
          scenarios {
            id
            at {
              id
              key
              name
            }
            commands {
              id
              text
              atOperatingMode
            }
          }
          assertions {
            id
            text
            phrase
            priority
          }
        }
      `;
  }
};

export default TEST_FIELDS;
