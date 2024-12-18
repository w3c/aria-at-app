import { gql } from '@apollo/client';
import { AT_FIELDS, ME_FIELDS } from '@components/common/fragments';

export const TESTER_SETTINGS_QUERY = gql`
  ${AT_FIELDS}
  ${ME_FIELDS}
  query CurrentSettings {
    me {
      ...MeFields
      ats {
        ...AtFields
      }
    }
    ats {
      ...AtFields
    }
  }
`;

export const ADMIN_SETTINGS_QUERY = gql`
  query AdminSettings {
    latestTestPlanVersion {
      id
      updatedAt
    }
  }
`;

export const UPDATE_ME_MUTATION = gql`
  ${AT_FIELDS}
  mutation UpdateMe($input: UserInput) {
    updateMe(input: $input) {
      ats {
        ...AtFields
      }
    }
  }
`;
