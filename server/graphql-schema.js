const { gql } = require('apollo-server');

const graphqlSchema = gql`
    type Query {
        testPlanReports(testPlan: ID): [TestPlanReport]!
        testPlanReport(id: ID): TestPlanReport
        testPlanTargets: [TestPlanTarget]!
        testPlans: [TestPlan]!
    }

    type TestPlanReport {
        id: ID!
        publishStatus: TestPlanReportStatus!
        coveragePercent: Int!
        testPlan: TestPlan!
        testPlanTarget: TestPlanTarget!
        canonicalRun: TestPlanRun # Present when finalized
        testPlanRuns: [TestPlanRun]!
        createdAt: Timestamp!
    }

    input TestPlanReportInput {
        testPlan: ID!
        testPlanTarget: ID!
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

    type TestPlanTarget {
        id: ID!
        title: String!
        at: At!
        atVersion: String!
        browser: Browser!
        browserVersion: String!
        testPlanReports: [TestPlanReport]!
    }

    input TestPlanTargetInput {
        at: ID!
        atVersion: String!
        browser: ID!
        browserVersion: String!
    }

    enum TestPlanStatus {
        DRAFT
        IN_REVIEW
        FINALIZED
    }

    scalar Timestamp

    enum TestPlanReportStatus {
        DRAFT
        IN_REVIEW
        FINALIZED
        # ????
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

    type Mutation {
        createTestPlanReport(
            input: TestPlanReportInput
        ): TestPlanReportOperations
        createTestPlanTarget(
            input: TestPlanTargetInput
        ): TestPlanTargetOperations
        testPlanReport(id: ID): TestPlanReportOperations
        testPlanTarget(id: ID): TestPlanTargetOperations
    }

    type TestPlanReportOperations {
        assignTester(user: ID): NoResponse
        deleteTestPlanRun(user: ID): NoResponse
        updateStatus(status: TestPlanReportStatus): NoResponse
        resultingTestPlanReport: TestPlanReport!
    }

    type TestPlanTargetOperations {
        delete: NoResponse # UI should warn this will delete any runs as well
        resultingTestPlanTarget: TestPlanTarget
    }

    scalar NoResponse
`;

module.exports = graphqlSchema;
