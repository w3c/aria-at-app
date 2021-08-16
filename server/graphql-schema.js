/* TODO for Alex:
- commandMappings and commandLabel
*/

const { gql } = require('apollo-server');

const graphqlSchema = gql`
    """
    Freeform data.
    """
    scalar Any

    """
    The field does not return a response (useful for some mutations).
    """
    scalar NoResponse

    """
    ISO-8601-formatted timestamp.
    """
    scalar Timestamp

    """
    The categories of actions a user can complete in the app.
    """
    enum Role {
        """
        Whether the user can perform testing. Testers are specified in
        testers.txt. Note that all admins are testers.
        """
        TESTER
        """
        Whether the user can perform administrative actions. Admins are members
        of a special GitHub team, which is different for each app environment.
        """
        ADMIN
    }

    type User {
        id: ID!
        username: String!
        roles: [Role]!
    }

    type Browser {
        id: ID!
        name: String!
        browserVersions: [String]!
    }

    """
    Some ATs like JAWS have modes - for example, normally pushing "h" would
    navigate to the next header, but when you are interacting with a text input,
    typing "h" would insert the letter "h" into that input. Our tests are aware
    of these modes.
    """
    enum AtMode {
        """
        JAWS "browse" mode or NVDA "browse" mode.
        """
        READING
        """
        JAWS "forms" mode or NVDA "focus" mode.
        """
        INTERACTION
        """
        Used with ATs like VoiceOver which do not have modes.
        """
        MODELESS
    }

    type At {
        id: ID!
        name: String!
        # modes: [AtMode]! # TODO: Waiting on test authoring format updates
        atVersions: [String]!
    }

    type Command {
        id: String!
    }

    """
    Specifies a AT and browser combination to test, divided into buckets by
    major version.
    """
    type TestPlanTarget {
        id: ID!
        title: String!
        at: At!
        atVersion: String!
        browser: Browser!
        browserVersion: String!
    }

    input TestPlanTargetInput {
        atId: ID!
        atVersion: String!
        browserId: ID!
        browserVersion: String!
    }

    # TODO: Determine if needed following 2021 Working Mode changes
    # https://github.com/w3c/aria-at/wiki/Working-Mode
    # """
    # To make sure Test Plans are relevant, they need to be reviewed by community
    # stakeholders such as AT vendors.
    # """
    # enum TestPlanVersionStatus {
    #     """
    #     Default value meaning the source has been imported and the test plan
    #     can be reviewed internally.
    #     """
    #     DRAFT
    #     """
    #     Receiving review from stakeholders.
    #     """
    #     WIDE_REVIEW
    #     """
    #     Wide review complete and ready to record test results.
    #     """
    #     FINALIZED
    # }

    """
    A suite of tests which keeps its identity as it evolves over time.
    """
    type TestPlan {
        """
        This is the same as the directory field. Sometimes you want to think of
        that string as an ID and sometimes you want to explicitly refer to it
        as a directory, and this allows you to do both.
        """
        id: ID!

        """
        Corresponds to directory in the ARIA-AT repo which stores the test plan,
        e.g. "checkbox-tri-state" or "disclosure-navigation"
        """
        directory: String!
        # TODO: determine what to do when a directory is removed from the
        # ARIA-AT repo
        # isObsolete: Boolean!
        """
        Gets the most recent version imported from the test plan's directory.
        """
        latestTestPlanVersion: TestPlanVersion!
        # latestTestPlanVersion(
        #     # TODO: Waiting for TestPlanVersionStatus to be implemented
        #     status: TestPlanVersionStatus
        #
        #     # TODO: determine if we need to filter test plans with no results
        #     testPlanReportStatuses: [TestPlanReportStatus]
        # ): TestPlanVersion

        """
        Gets all historic versions of the test plan.
        """
        testPlanVersions: [TestPlanVersion]!
        # testPlanVersions(
        #     # TODO: Waiting for TestPlanVersionStatus to be implemented
        #     status: TestPlanVersionStatus
        #
        #     # TODO: determine if we need to filter test plans with no results
        #     testPlanReportStatuses: [TestPlanReportStatus]
        # ): [TestPlanVersion]!
    }

    """
    A snapshot of time for a test plan, containing all the test plan data,
    including the actual executable tests.
    """
    type TestPlanVersion {
        id: ID!
        """
        The title of the TestPlan at this point in time.
        """
        title: String
        # TODO: Waiting for TestPlanVersionStatus to be needed
        # status: TestPlanVersionStatus!

        # TODO: decide whether to use this approach, since we think gitShas are
        # a bit intimidating and hard to use.
        # """
        # A version label set in the ARIA-AT repo. The app will only import new
        # versions when that label has changed.
        # """
        # label: String!
        """
        A git sha corresponding to the current git commit at the time the
        version was imported from the ARIA-AT repo. Used to version the test
        plan over time.
        """
        gitSha: String! # TODO: remove if using version labels
        """
        Git commit message corresponding to the git sha's commit.
        """
        gitMessage: String! # TODO: remove if using version labels
        """
        The date (originating in Git) corresponding to the Git sha's commit.
        """
        updatedAt: Timestamp!
        """
        Loosely structured data which may or may not be consistent or fully
        populated across all test plan versions.
        """
        metadata: Any
        """
        The tests as they stand at this point in time.
        """
        tests: [Test]!
    }

    """
    Interface type allowing TestResults to have the same fields as Tests.
    """
    interface BaseTest {
        # More documentation in the Test type below
        id: ID!
        title: String!
        ats: [At]!
        atMode: AtMode!
        exampleUrl: String!
        startupScriptUrl: String!
        instructions: [String]!
        commandMappings: Any!
        scenarios(atId: ID!): [Scenario]!
        assertions(priority: AssertionPriority): [Assertion]!
    }

    """
    A parsed version of an ARIA-AT test, which, although it may produce multiple
    executable artifacts, originated from a single row in the test authoring
    format CSV maintained in the ARIA-AT repo.
    """
    type Test implements BaseTest {
        """
        A unique ID for the test.
        """
        id: ID!
        """
        A human-readable sentence describing the function of the test.
        """
        title: String!
        """
        The ATs the test was written to expect.
        """
        ats: [At]!

        # TODO: consider moving to the Scenario type if we support a single test
        # applying to multiple AT modes.
        """
        The AT mode the test was written to expect.
        """
        atMode: AtMode!

        # TODO: consider moving to the Scenario type if we support multiple
        # examples for one test (i.e. testing that <input type="button"> and
        # <button> have equivalent behavior).
        """
        Link the HTML page which will be tested.
        """
        exampleUrl: String!

        # TODO: consider converting to an array if we support a larger number of
        # more-focused and "compositional" startup scripts
        """
        Link to JS file which, when run, will prepare the example for testing.
        """
        startupScriptUrl: String!

        # TODO: determine whether this field should remain following the
        # introduction of machine-readable instructions
        """
        Human-readable sentences detailing steps that must be completed by
        testers before the step which captures the AT output.
        """
        instructions: [String]!
        # TODO: reconsider when adding machine-readable instuctions
        """
        An object containing nested dictionaries of commands indexed by AtMode
        and AtId, and used when creating scenarios.
        """
        commandMappings: Any!
        """
        List of ways the test can be completed, each of which needs to be
        executed separately. There might be a different number of Scenarios
        for each AT.
        """
        scenarios(atId: ID!): [Scenario]!
        """
        Assertions to apply to the output captured for each Scenario. More
        info on the Assertion type.
        """
        assertions(priority: AssertionPriority): [Assertion]!
    }

    """
    Using the Test type as a base, TestResults include all the outputs and
    assertion results which were collected while executing the test, as well as
    metadata about the test execution.
    """
    type TestResult implements BaseTest {
        """
        A unique ID for the TestResult.
        """
        id: ID!
        """
        The ID of the test which was used to create the results.
        """
        testId: ID!
        """
        See Test type for more information.
        """
        title: String!

        """
        See Test type for more information.
        """
        ats: [At]!
        """
        See Test type for more information.
        """
        atMode: AtMode!
        """
        See Test type for more information.
        """
        exampleUrl: String!
        """
        See Test type for more information.
        """
        startupScriptUrl: String!
        """
        See Test type for more information.
        """
        instructions: [String]!
        """
        See Test type for more information.
        """
        commandMappings: Any!
        """
        See Test type for more information.
        """
        scenarios(atId: ID!): [Scenario]!
        """
        See Test type for more information.
        """
        assertions(priority: AssertionPriority): [Assertion]!

        """
        The AT associated with these results.
        """
        at: At!
        """
        When this particular test was started, which is interesting to collect
        for analytics.
        """
        startedAt: Timestamp!
        """
        Used to determine if a test was completed or skipped.
        """
        completedAt: Timestamp!
        """
        The captured output for each of the Scenarios required to test the
        AT, including the results of all assertions.
        """
        scenarioResults: [ScenarioResult]!
    }

    """
    Minimal plain representation of a test result. The test data, i.e. the
    title, instructions, etc. is stored with the TestPlanVersion and does not
    need to be included here. The AT used is knowable via the TestPlanTarget.
    """
    input TestResultInput {
        """
        See TestResult type for more information.
        """
        testId: ID!
        """
        See TestResult type for more information.
        """
        startedAt: Timestamp!
        """
        See TestResult type for more information.
        """
        completedAt: Timestamp!
        """
        See TestResult type for more information.
        """
        scenarioResults: [ScenarioResultInput]!
    }

    """
    Just like the BaseTest type, this interface allows the ScenarioResult
    type to build off the fields in the plain Scenario type.
    """
    interface BaseScenario {
        """
        See Scenario type for more information.
        """
        index: Int!
        """
        See Scenario type for more information.
        """
        command: Any!
    }

    """
    A single test may describe a feature which is accessible in many different
    ways, i.e. there may be several commands which should produce the same
    output. Instead of writing dozens of nearly-identical tests, the test
    authoring format allows a single test to have multiple Scenarios, each
    testing a slightly different scenario.
    """
    type Scenario implements BaseScenario {
        """
        The index you can use to find this ScenarioResult in the TestResult's
        array of ScenarioResults.
        """
        index: Int!
        # TODO: reconsider when adding machine-readable instuctions
        """
        Object keys needed to load the exact command from the testResult's
        commandMappings field.
        """
        command: Any!
    }

    type ScenarioResult implements BaseScenario {
        """
        The index you can use to find this ScenarioResult in the TestResult's
        array of ScenarioResults.
        """
        index: Int!
        """
        See Scenario type for more information.
        """
        commandLabel: String!

        """
        The output captured from the AT.
        """
        output: String!
        assertionResults(priority: AssertionPriority): [AssertionResult]!
        unexpectedBehaviors: [UnexpectedBehavior]!
    }

    input ScenarioResultInput {
    }

    """
    Some assertions are more akin to recommendations or best practices, and,
    while we want to record whether they are passing or failing, we do not want
    to count the entire test as failing when they fail.
    """
    enum AssertionPriority {
        """
        All required assertions must pass for the test to pass.
        """
        REQUIRED
        """
        This assertion is not considered when deciding if a test is passing.
        """
        OPTIONAL
    }

    # TODO: figure out if this field can be removed and NO_OUTPUT can become an
    # unexpected behavior instead
    enum AssertionFailedReason {
        INCORRECT_OUTPUT
        NO_OUTPUT
    }

    """
    Just like the BaseTest type, this interface allows the AssertionResult type
    to build off the fields in the plain Assertion type.
    """
    interface BaseAssertion {
        # More documentation in the Assertion type below
        priority: AssertionPriority!
        manualAssertion: String!
        # TODO: account for at-specific assertions
        # TODO: account for automation
    }

    type Assertion implements BaseAssertion {
        priority: AssertionPriority!
        manualAssertion: String!
    }

    type AssertionResult implements BaseAssertion {
        priority: AssertionPriority!
        manualAssertion: String!
        passed: Boolean!
        failedReason: AssertionFailedReason
    }

    input AssertionResultInput {
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
        testPlanTarget: TestPlanTargetInput!
    }

    """
    A particular traversal of the TestPlan data - allowing for highlighting a
    TestPlan, TestPlanVersion, TestPlanReport, or even subsets of those.
    """
    input LocationOfDataInput {
        testPlanId: ID
        testPlanVersionId: ID
        testIndex: Int
        scenarioIndex: Int
        testPlanReportId: ID
        testPlanTargetId: ID
        browserId: ID
        browserVersion: String
        atId: ID
        atVersion: String
        testPlanRunId: ID
        testResultIndex: Int
        scenarioResultIndex: Int
    }
    """
    A particular traversal of the TestPlan data - allowing for highlighting a
    TestPlan, TestPlanVersion, TestPlanReport, or even subsets of those.
    """
    type LocationOfData {
        testPlanId: ID
        testPlanVersionId: ID
        testIndex: Int
        scenarioIndex: Int
        testPlanReportId: ID
        testPlanTargetId: ID
        browserId: ID
        browserVersion: String
        atId: ID
        atVersion: String
        testPlanRunId: ID
        testResultIndex: Int
        scenarioResultIndex: Int
    }

    """
    All the records that are associated with the id(s) of a given locationOfData
    """
    type PopulatedData {
        locationOfData: LocationOfData!
        testPlan: TestPlan
        testPlanVersion: TestPlanVersion
        testPlanTarget: TestPlanTarget
        at: At
        browser: Browser
        atVersion: String
        browserVersion: String
        test: Test
        scenario: Scenario
        testPlanReport: TestPlanReport
        testPlanRun: TestPlanRun
        testResult: TestResult
        scenarioResult: ScenarioResult
    }

    type Query {
        me: User
        users: [User]
        ats: [At]
        browsers: [Browser]
        testPlans: [TestPlan]!
        testPlanVersions: [TestPlanVersion]
        testPlan(id: ID!): TestPlan
        testPlanReport(id: ID): TestPlanReport
        testPlanReports(statuses: [TestPlanReportStatus]): [TestPlanReport]!
        testPlanTargets: [TestPlanTarget]!
        testPlanRun(id: ID): TestPlanRun
        populateData(locationOfData: LocationOfDataInput!): PopulatedData!
    }

    # Mutation-specific types below

    type TestPlanReportOperations {
        assignTester(userId: ID!): PopulatedData!
        deleteTestPlanRun(userId: ID!): PopulatedData!
        deleteTestPlanRunResults(userId: ID!): PopulatedData!
        updateStatus(status: TestPlanReportStatus!): PopulatedData!
    }

    type TestPlanRunOperations {
        updateTestResult(input: TestResultInput!): PopulatedData!
        clearTestResult(input: TestResultInput!): PopulatedData!
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
        testPlanRun(id: ID!): TestPlanRunOperations!
    }
`;

module.exports = graphqlSchema;
