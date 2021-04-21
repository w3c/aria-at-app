const { gql } = require('apollo-server');

const graphqlSchema = gql`
    type Book {
        title: String
        author: String
    }

    type Query {
        books: [Book]
    }
`;

module.exports = graphqlSchema;
