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
        index: Int!
        # TODO: account for running scripts
        instructions: [Instruction]!
        assertions: [Assertion]!
        passThroughs: [PassThrough]!
        requiredAssertionsCount: Int!
        optionalAssertionsCount: Int!
    }

    type Instruction {
        # TODO: account for automation
        manualInstruction: String!
    }

    interface Assertion {
        # TODO: account for at-specific assertions
        # TODO: account for optional assertions
        # TODO: account for automation
        manualAssertion: String!
    }

    interface PassThrough {
        atMode: String!
        nthInput: Int!
        # Examples would go here if multiple examples can be linked to one test.
    }

    type TestResult implements Test {
        title: String!
        index: Int!
        instructions: [Instruction]!
        assertions: [Assertion]!
        passThroughs: [PassThrough]!
        requiredAssertionsCount: Int!
        optionalAssertionsCount: Int!

        startedAt: Timestamp!
        completedAt: Timestamp!
        isComplete: Boolean!

        passThroughResults: [PassThroughResult]!
        requiredAssertionsPassed: Int!
        optionalAssertionsPassed: Int!
        unexpectedBehaviorCount: Int!
    }

    type PassThroughResult implements PassThrough {
        atMode: String!
        nthInput: Int!

        output: String!
        assertionResults: [AssertionResult]!
        unexpectedBehaviors: [UnexpectedBehavior]!
    }

    type AssertionResult implements Assertion {
        manualAssertion: String!
        passed: Boolean!
    }

    type UnexpectedBehavior {
        id: ID!
        description: String!
    }

    type TestResultConflict {
        testPlan: TestPlan!
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
    # input PassThroughResultInput {
    #     atMode: String!
    #     nthInput: Int!
    #     output: String!
    #     assertionResults: [AssertionResultInput]!
    #     unexpectedBehaviors: [ID]!
    # }
    # input AssertionResultInput {
    #     manualAssertion: String!
    #     passed: Boolean!
    # }

    type TestPlanRun {
        id: ID!
        tester: User
        isManuallyTested: Boolean!
        isComplete: Boolean!
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
        status: TestPlanReportStatus!
        """
        Results from new test plan runs are only permitted in a draft state.
        """
        isAcceptingResults: Boolean!
        """
        Can be finalized if all test plan runs are complete and no conflicts are
        found.
        """
        canBeFinalized: Boolean!
        supportPercent: Int!
        testPlan: TestPlan!
        testPlanTarget: TestPlanTarget!
        conflicts: [TestResultConflict]!
        conflictCount: Int!
        """
        Finalizing a test plan report requires resolving any conflicts between
        runs. At this stage a single set of results is able to represent all
        results, and is much more convenient to work with.
        """
        finalizedTestPlanRun: TestPlanRun
        draftTestPlanRuns: [TestPlanRun]!
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
        # TODO: Determine if this is a valid approach
        # resolveConflict(resolution: TestResultConflictResolution): NoResponse
        resultingTestPlanReport: TestPlanReport!
    }

    type TestPlanTargetOperations {
        delete: NoResponse # UI should warn this will delete any runs as well
        resultingTestPlanTarget: TestPlanTarget
    }

    type Mutation {
        createTestPlanReport(
            input: TestPlanReportInput
        ): TestPlanReportOperations!
        createTestPlanTarget(
            input: TestPlanTargetInput
        ): TestPlanTargetOperations!
        testPlanReport(id: ID): TestPlanReportOperations!
        testPlanTarget(id: ID): TestPlanTargetOperations!
    }
`;

module.exports = graphqlSchema;
