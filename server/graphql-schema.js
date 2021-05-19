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
        revision: String!
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
        commands: [Command]!
    }

    type TestResult implements Test {
        title: String!
        startedAt: Timestamp!
        completedAt: Timestamp!
        commands: [Command]!

        requiredAssertionsCount: Int!
        requiredAssertionsPassed: Int!
        optionalAssertionsCount: Int!
        optionalAssertionsPassed: Int!
        unexpectedBehaviorCount: Int!

        passThroughs: [PassThrough]!
    }

    type UnexpectedBehavior {
        id: ID!
        description: String!
    }

    type PassThrough {
        atMode: String!
        nthInput: Int!
        # Examples are expected to go here when multiple examples can be
        # associated with one test.
        commandResults: [CommandResult]!
    }

    type Command {
        """
        Raw test authoring format for command, e.g. "assert role: checkbox"
        """
        source: String!
        """
        The parsed decorators of the command format - in the case of "(optional)
        assert role: checkbox" they would be ["optional"].
        """
        decorators: [String]!
        """
        The parsed function part of the command format - in the case of "assert
        role: checkbox" it would be "assert role".
        """
        function: String!
        """
        The arguments part of the command format - in the case of "assert role:
        checkbox" it would be ["checkbox"].
        """
        arguments: [String]!
    }

    interface CommandResult {
        # Also implements Command
        source: String!
        decorators: [String]!
        function: String!
        arguments: [String]!

        # Result only
        """
        Not all commands need to have results. This allows a CommandResult to
        point back to the index of the command that created it.
        """
        nthCommand: Int!
    }

    type CollectInputResult implements CommandResult {
        # All Commands include
        source: String!
        decorators: [String]!
        function: String!
        arguments: [String]!

        # All CommandResults include
        nthCommand: Int!

        # CollectInputResult only
        output: String!
        unexpectedBehaviors: [UnexpectedBehavior]!
    }

    type AssertionResult implements CommandResult {
        # All commands include
        source: String!
        decorators: [String]!
        function: String!
        arguments: [String]!

        # All CommandResults include
        nthCommand: Int!

        # AssertionResult only
        passed: Boolean!
    }

    type TestPlanRun {
        id: ID!
        isManuallyTested: Boolean!
        tester: User
        testPlanReport: TestPlanReport!
        testResults: [TestResult]!
        testResultCount: Int!
    }

    enum TestPlanReportStatus {
        DRAFT
        IN_REVIEW
        FINALIZED
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
