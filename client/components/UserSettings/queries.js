import { gql } from '@apollo/client';

export const CURRENT_SETTINGS_QUERY = gql`
    query {
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
