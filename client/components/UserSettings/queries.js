import { gql } from '@apollo/client';

export const CURRENT_SETTINGS_QUERY = gql`
    query CurrentSettings {
        me {
            id
            username
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
