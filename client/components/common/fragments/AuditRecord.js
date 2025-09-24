import { gql } from '@apollo/client';

const AUDIT_RECORD_FIELDS = gql`
  fragment AuditRecordFields on AuditRecord {
    __typename
    id
    eventType
    description
    createdAt
    performedBy {
      id
      username
    }
    entityId
    metadata
  }
`;

export default AUDIT_RECORD_FIELDS;
