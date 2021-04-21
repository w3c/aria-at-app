const { gql } = require('apollo-server');

const graphqlSchema = gql`
    type TestPlan {
        title: String
        note: String
    }

    type Query {
        testPlans: [TestPlan]
    }
`;

module.exports = graphqlSchema;
