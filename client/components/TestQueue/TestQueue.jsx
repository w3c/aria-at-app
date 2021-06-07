import { useQuery, gql } from '@apollo/client';

const TEST_QUEUE_QUERY = gql`
    query {
        me {
            username
        }
    }
`;

const TestQueue = () => {
    const { loading, data } = useQuery(TEST_QUEUE_QUERY);

    if (loading) return null;

    return `I am ${data.me.username}`;
};

export default TestQueue;
