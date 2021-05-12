const { gql } = require('apollo-server');

const graphqlSchema = gql`
    type Query {
        testPlanReports(testPlan: ID): [TestPlanReport]!
        testPlanReport(id: ID): TestPlanReport
    }

    type TestPlan {
        id: ID!
        title: String!
        publishStatus: TestPlanStatus!
        revision: String!
        sourceGitCommit: String!
        exampleUrl: String! # ????
        createdAt: Timestamp! # Wait, what about the source code age?
        tests: [Test]!
        testCount: Int!
    }

    enum TestPlanStatus {
        DRAFT
        IN_REVIEW
        FINALIZED
    }

    scalar Timestamp
    scalar TBD

    type TestPlanReport {
        id: ID!
        publishStatus: TestPlanReportStatus!
        coveragePercent: Int!
        testPlan: TestPlan!
        testPlanTarget: TestPlanTarget!
        canonicalRun: TestPlanRun
        testPlanRuns: [TestPlanRun]!
        createdAt: Timestamp!
    }

    enum TestPlanReportStatus {
        DRAFT
        IN_REVIEW
        FINALIZED
        # ????
    }

    type TestPlanTarget {
        id: ID!
        title: String!
        at: At!
        atVersion: AtVersion!
        browser: Browser!
        browserVersion: BrowserVersion!
        testPlanReports: [TestPlanReport]!
    }

    type At {
        name: String!
        modes: [AtMode]!
        versions: [AtVersion]!
    }

    enum AtMode {
        READING
        INTERACTION
        MODELESS
    }

    scalar AtVersion
    scalar BrowserVersion

    type Browser {
        name: String!
        versions: [BrowserVersion]!
    }

    type TestPlanRun {
        id: ID!
        isManuallyTested: Boolean!
        tester: User
        testPlanReport: TestPlanReport!
        testResults: [TestResult]!
        testResultCount: Int!
    }

    interface Test {
        title: String!
        totalAssertions: Int!
    }

    type TestResult implements Test {
        title: String!
        startedAt: Timestamp!
        completedAt: Timestamp
        testPlanRun: TestPlanRun
        passedAssertions: Int
        totalAssertions: Int!
        # results
    }

    type User {
        id: ID
        username: String
        roles: [String]
    }
`;

module.exports = graphqlSchema;
