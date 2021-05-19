const { gql } = require('apollo-server');

const graphqlSchema = gql`
    # Required for mutations that do not return anything
    scalar NoResponse

    """
    ISO-8601-formatted timestamp.
    """
    scalar Timestamp

    enum Role {
        TESTER
        ADMIN
    }

    type User {
        id: ID!
        username: String!
        roles: [Role]!
    }

    type Browser {
        name: String!
        versions: [String]!
    }

    enum AtMode {
        READING
        INTERACTION
        MODELESS
    }

    type At {
        name: String!
        modes: [AtMode]!
        versions: [String]!
    }

    """
    Specifies which AT and browser combination we are testing, divided into
    buckets for each major version.
    """
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

    type TestPlan {
        id: ID!
        title: String!
        publishStatus: TestPlanStatus!
        # revision: String!
        sourceGitCommitHash: String!
        sourceGitCommitMessage: String!
        exampleUrl: String!
        # TODO: consider renaming createdAt and including the date the source
        # code age was authored as well.
        createdAt: Timestamp!
        tests: [Test]!
        testCount: Int!
    }

    interface Test {
        title: String!
        # TODO: account for running scripts
        instructions: [Instruction]!
        assertions: [Assertion]!
        passThroughs: [PassThrough]!
    }

    type Instruction {
        manualInstruction: String!
        # automatedFunction: String!
        # automatedArguments: String!
    }

    interface Assertion {
        # TODO: account for at-specific assertions
        # TODO: account for optional assertions
        manualAssertion: String!
        # automatedMatcher: String!
    }

    interface PassThrough {
        atMode: String!
        nthInput: Int!
        # Examples are expected to go here when multiple examples can be
        # associated with one test.
    }

    type TestResult implements Test {
        title: String!
        instructions: [Instruction]!
        assertions: [Assertion]!
        passThroughs: [PassThrough]!

        startedAt: Timestamp!
        completedAt: Timestamp!
        isComplete: Boolean!

        requiredAssertionsCount: Int!
        requiredAssertionsPassed: Int!
        optionalAssertionsCount: Int!
        optionalAssertionsPassed: Int!
        unexpectedBehaviorCount: Int!
        passThroughResults: [PassThroughResult]!
    }

    type PassThroughResult implements PassThrough {
        atMode: String!
        nthInput: Int!

        output: String!
        assertionResults: [AssertionResult]!
        unexpectedBehaviors: [UnexpectedBehavior]!
    }

    # TODO: Determine if TestResultConflictResolution below is a valid approach
    # input PassThroughResultInput {
    #     atMode: String!
    #     nthInput: Int!
    #     output: String!
    #     assertionResults: [AssertionResultInput]!
    #     unexpectedBehaviors: [ID]!
    # }

    type AssertionResult implements Assertion {
        manualAssertion: String!
        # automatedMatcher: String!
        passed: Boolean!
    }

    input AssertionResultInput {
        manualAssertion: String!
        passed: Boolean!
    }

    type UnexpectedBehavior {
        id: ID!
        description: String!
    }

    type TestResultConflict {
        id: ID!
        test: Test!
        passThrough: PassThrough!
        passThroughResults: [PassThroughResult]!
    }

    # TODO: Determine if this is a valid approach
    # input TestResultConflictResolution {
    #     testPlan: ID
    #     nthTest: Int!
    #     passThroughResult: PassThroughResultInput
    # }

    type TestPlanRun {
        id: ID!
        isManuallyTested: Boolean!
        tester: User
        testResults: [TestResult]!
        testResultCount: Int!
    }

    enum TestPlanReportStatus {
        DRAFT
        FINALIZED
    }

    type TestPlanReport {
        id: ID!
        publishStatus: TestPlanReportStatus!
        coveragePercent: Int!
        testPlan: TestPlan!
        testPlanTarget: TestPlanTarget!
        conflicts: [TestResultConflict]
        """
        Finalizing a test plan report requires resolving any conflicts between
        runs. At this stage a single set of results is able to represent all
        results, and is much more convenient to work with.
        """
        canonicalRun: TestPlanRun
        testPlanRuns: [TestPlanRun]!
        createdAt: Timestamp!
    }

    input TestPlanReportInput {
        testPlan: ID!
        testPlanTarget: ID!
    }

    type Query {
        me: User
        testPlanReports(testPlan: ID): [TestPlanReport]!
        testPlanReport(id: ID): TestPlanReport
        testPlanTargets: [TestPlanTarget]!
        testPlans: [TestPlan]!
    }

    # Mutation-specific types below

    type TestPlanReportOperations {
        assignTester(user: ID): NoResponse
        deleteTestPlanRun(user: ID): NoResponse
        updateStatus(status: TestPlanReportStatus): NoResponse
        resolveConflict(resolution: TestResultConflictResolution): NoResponse
        resultingTestPlanReport: TestPlanReport!
    }

    type TestPlanTargetOperations {
        delete: NoResponse # UI should warn this will delete any runs as well
        resultingTestPlanTarget: TestPlanTarget
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
`;

module.exports = graphqlSchema;
