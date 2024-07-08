import { gql } from '@apollo/client';
import { ME_FIELDS } from '@components/common/fragments';

export const CURRENT_SETTINGS_QUERY = gql`
  ${ME_FIELDS}
  query CurrentSettings {
    me {
      ...ME_FIELDS
      ats {
        id
      }
    }
    ats {
      id
      name
    }
  }
`;

export const UPDATE_ME_MUTATION = gql`
  mutation UpdateMe($input: UserInput) {
    updateMe(input: $input) {
      ats {
        id
      }
    }
  }
`;
