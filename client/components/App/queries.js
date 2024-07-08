import { gql } from '@apollo/client';
import { ME_FIELDS } from '@components/common/fragments';

export const ME_QUERY = gql`
  ${ME_FIELDS}
  query Me {
    me {
      ...ME_FIELDS
    }
  }
`;
