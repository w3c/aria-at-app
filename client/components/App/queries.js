import { gql } from '@apollo/client';

export const ME_QUERY = gql`
    query {
        me {
            id
            username
            roles
        }
    }
`;
