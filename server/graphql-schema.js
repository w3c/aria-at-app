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
        id: ID!
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
        atId: ID!
        atVersion: String!
        browserId: ID!
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
        latestTestPlanVersion(
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
        # isLatest: Boolean!
        updatedAt: Timestamp!
        exampleUrl: String!
        tests: [Test]!
        testCount: Int!
        testPlanReports(status: TestPlanReportStatus): [TestPlanReport]!
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
        REMOVED
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
        testPlanVersionId: ID!
        testPlanTarget: TestPlanTargetInput
    }

    input LocationOfDataInput {
        testPlanId: ID
        testPlanVersionId: ID
        testIndex: Int
        passThroughIndex: Int
        testPlanReportId: ID
        testPlanTargetId: ID
        browserId: ID
        browserVersion: String
        atId: ID
        atVersion: String
        testPlanRunId: ID
        testResultIndex: Int
        passThroughResultIndex: Int
    }
    type LocationOfData {
        testPlanId: ID
        testPlanVersionId: ID
        testIndex: Int
        passThroughIndex: Int
        testPlanReportId: ID
        testPlanTargetId: ID
        browserId: ID
        browserVersion: String
        atId: ID
        atVersion: String
        testPlanRunId: ID
        testResultIndex: Int
        passThroughResultIndex: Int
    }

    type PopulatedData {
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
        ats: [At]
        browsers: [Browser]
        testPlans: [TestPlan]!
        testPlan(id: ID!): TestPlan
        testPlanReport(id: ID): TestPlanReport
        testPlanReports(statuses: [TestPlanReportStatus]): [TestPlanReport]!
        testPlanTargets: [TestPlanTarget]!
        populateData(locationOfData: LocationOfDataInput!): PopulatedData!
    }

    # Mutation-specific types below

    type TestPlanReportOperations {
        assignTester(userId: ID!): PopulatedData!
        deleteTestPlanRun(userId: ID!): PopulatedData!
        updateStatus(status: TestPlanReportStatus!): PopulatedData!
    }

    type findOrCreateResult {
        populatedData: PopulatedData!
        """
        There will be one array item per database record created.
        """
        created: [PopulatedData]!
    }

    type Mutation {
        findOrCreateTestPlanReport(
            input: TestPlanReportInput!
        ): findOrCreateResult!
        testPlanReport(id: ID!): TestPlanReportOperations!
    }
`;

module.exports = graphqlSchema;
