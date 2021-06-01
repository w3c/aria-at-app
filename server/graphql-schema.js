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

    enum TestPlanVersionStatus {
        DRAFT
        IN_REVIEW
        FINALIZED
    }

    type TestPlan {
        """
        Corresponds to the ARIA-AT directory storing the test plan.
        """
        id: ID!
        # TODO: determine if isObsolete is needed.
        # """
        # Whether the directory still exists in the ARIA-AT repo.
        # """
        # isObsolete: Boolean!
        """
        A least one argument is required. Determines what type of test plan to
        load. Will load the latest version matching the criteria.
        """
        testPlanVersion(
            status: TestPlanVersionStatus
            testPlanReportStatus: TestPlanReportStatus
            atGitSha: String
            atSemanticVersion: String
        ): TestPlanVersion
        """
        Loads multiple historic versions of the test plan, accepting filter
        criteria.
        """
        testPlanVersions(
            status: TestPlanVersionStatus
            testPlanReportStatus: TestPlanReportStatus
        ): [TestPlanVersion]
    }

    type TestPlanVersion {
        id: ID!
        title: String!
        status: TestPlanVersionStatus!
        gitSha: String!
        gitMessage: String!
        semanticVersion: String
        # TODO: determine if isLatest is needed
        # isLatest: Boolean
        updatedAt: Timestamp!
        exampleUrl: String!
        tests: [Test]!
        testCount: Int!
        testPlanReports(status: TestPlanReportStatus): [TestPlanReport]!
        testPlanReport(id: ID, testPlanTarget: ID): TestPlanReport
    }

    interface Test {
        title: String!
        index: Int!
        # TODO: account for running scripts
        instructions: [Instruction]!
        assertions: [Assertion]!
        assertionCount: Int!
        optionalAssertionCount: Int!
        passThroughs: [PassThrough]!
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
        index: Int!
        atMode: String!
        nthCommand: Int!
        # Examples would go here if we support multiple examples for one test.
    }

    type TestResult implements Test {
        title: String!
        index: Int!
        instructions: [Instruction]!
        assertions: [Assertion]!
        passThroughs: [PassThrough]!
        assertionCount: Int!
        optionalAssertionCount: Int!

        startedAt: Timestamp!
        completedAt: Timestamp!
        isComplete: Boolean!
        isSkipped: Boolean!

        passThroughResults: [PassThroughResult]!
        assertionsPassed: Int!
        optionalAssertionsPassed: Int!
        unexpectedBehaviorCount: Int!
    }

    type PassThroughResult implements PassThrough {
        index: Int!
        atMode: String!
        nthCommand: Int!

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
        breadcrumbs: String! # TBD
    }

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
        supportPercent: Int!
        optionalSupportPercent: Int!
        testPlanTarget: TestPlanTarget!
        testPlanVersion: TestPlanVersion!
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

    input LocationOfDataInput {
        testPlan: ID
        testPlanVersion: ID
        """
        The index of the test
        """
        test: Int
        """
        The index of the passThrough
        """
        passThrough: Int
        testPlanReport: ID
        testPlanRun: ID
        """
        The index of the testResult
        """
        testResult: Int
        """
        The index of the passThroughResult
        """
        passThroughResult: Int
    }
    type LocationOfData {
        testPlan: ID
        testPlanVersion: ID
        test: Int
        passThrough: Int
        testPlanReport: ID
        testPlanRun: ID
        testResult: Int
        passThroughResult: Int
    }

    type PopulatedLocationOfData {
        locationOfData: LocationOfData!
        testPlan: TestPlan
        testPlanVersion: TestPlanVersion
        test: Test
        passThrough: PassThrough
        testPlanReport: TestPlanReport
        testPlanRun: TestPlanRun
        testResult: TestResult
        passThroughResult: PassThroughResult
    }

    type Query {
        me: User
        testPlans: [TestPlan]!
        testPlan(id: ID!): TestPlan
        testPlanReport(id: ID!): TestPlanReport
        testPlanTargets: [TestPlanTarget]!
        """
        Loads data at a specific position in the graph, useful for exploring data,
        identifying the location of conflicts, or, as in the test queue, flattening
        a deep tree of data into an array of simple, flat objects.
        """
        populateLocationOfData(
            locationOfData: LocationOfDataInput!
        ): PopulatedLocationOfData!
    }

    # Mutation-specific types below

    type TestPlanReportOperations {
        assignTester(user: ID!): TestPlanReportOperationResult!
        deleteTestPlanRun(user: ID!): TestPlanReportOperationResult!
        updateStatus(
            status: TestPlanReportStatus!
        ): TestPlanReportOperationResult!
    }

    type TestPlanReportOperationResult {
        resultingTestPlanReport: TestPlanReport!
    }

    type TestPlanTargetOperations {
        delete: NoResponse # UI should warn this will delete any runs as well
        resultingTestPlanTarget: TestPlanTarget
    }

    type Mutation {
        createTestPlanReport(
            input: TestPlanReportInput!
        ): TestPlanReportOperations!
        createTestPlanTarget(
            input: TestPlanTargetInput!
        ): TestPlanTargetOperations!
        testPlanReport(id: ID!): TestPlanReportOperations!
        testPlanTarget(id: ID!): TestPlanTargetOperations!
    }
`;

module.exports = graphqlSchema;
