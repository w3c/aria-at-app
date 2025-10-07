import { gql } from '@apollo/client';

const EVENT_FIELDS = gql`
  fragment EventFields on UpdateEvent {
    __typename
    id
    type
    description
    timestamp
    performedBy {
      id
      username
    }
    entityId
    metadata
  }
`;

export default EVENT_FIELDS;
