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
        """
        Postgres-provided numeric ID.
        """
        id: ID!
        """
        The GitHub username of the person.
        """
        username: String!
        """
        List of types of actions the user can complete.
        """
        roles: [Role]!
        # TODO: Either use this field or eliminate it.
        """
        The ATs the user has indicated they are able to test.
        """
        ats: [At]!
    }

    """
    The fields of the User type which can be updated after the User has been
    created. It is a short list since most of the User fields originate outside
    the app, i.e. the User roles are set by a GitHub team and txt file, and the
    username is set in GitHub, etc.
    """
    input UserInput {
        """
        See User type for more information.
        """
        atIds: [ID]!
    }

    type Browser {
        """
        Postgres-provided numeric ID.
        """
        id: ID!
        """
        Browser name like "Chrome".
        """
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
        JAWS "forms" mode, NVDA "focus" mode, or VoiceOver's one-and-only mode.
        """
        INTERACTION
    }

    """
    An assistive technology to be tested, such as NVDA or JAWS.
    """
    type At {
        """
        Postgres-provided numeric ID.
        """
        id: ID!
        """
        Human-readable name for the AT, such as "NVDA".
        """
        name: String!
        # TODO: reenable when this data is properly flowing into the system
        # """
        # The categories of generalized AT modes the AT supports.
        # """
        # modes: [AtMode]!
        atVersions: [String]!
    }

    # TODO: remove or rework this type in order to support recording exact
    # versions
    """
    Specifies a AT and browser combination to test, divided into buckets by
    major version.
    """
    type TestPlanTarget {
        """
        Postgres-provided numeric ID.
        """
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
    #     CANDIDATE
    #     """
    #     Wide review phase complete and ready to record test results.
    #     """
    #     RECOMMENDED
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
        """
        Postgres-provided numeric ID.
        """
        id: ID!
        # TODO: fix bug where the title is missing and make this field required
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
        # TODO: consider moving to the Scenario type if we support multiple
        # examples for one TestPlanVersion (i.e. testing that
        # <input type="button"> and <button> have equivalent behavior).
        """
        Link to the HTML page which will be tested.
        """
        exampleUrl: String!
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
    A parsed version of an ARIA-AT test, which, although it may produce multiple
    executable artifacts (i.e. the scenarios), originated from a single row in
    the test authoring format CSV maintained in the ARIA-AT repo.
    """
    type Test {
        """
        A unique ID which encodes some information used by the LocationOfData
        system.
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
        # TODO: consider switching to a URL which is more standard
        # TODO: consider converting to an array if we support a larger number of
        # more-focused and "compositional" startup scripts
        """
        JS content which, when run, will prepare the example for testing.
        """
        startupScriptContent: String
        # TODO: rethink when introducing machine-readable instructions
        """
        Human-readable sentences detailing steps that must be completed by
        testers before capturing the AT output.
        """
        instructions: [String]!
        """
        List of ways the test can be completed, each of which needs to be
        executed separately. There might be a different number of Scenarios
        for each AT, based on factors like the number of Commands that the AT
        supports to complete a task.
        """
        scenarios(atId: ID): [Scenario]!
        """
        Assertions to apply to the output captured for each Scenario. More
        info on the Assertion type.
        """
        assertions(priority: AssertionPriority): [Assertion]!
    }

    """
    A single test may describe a feature which is accessible in many different
    ways, i.e. there may be several commands which should produce the same
    output. Instead of writing dozens of nearly-identical tests, the test
    authoring format allows a single test to have multiple Scenarios, each
    testing a different command.
    """
    type Scenario {
        """
        A unique ID which encodes some information used by the LocationOfData
        system.
        """
        id: ID!
        """
        The AT which this scenario is testing.
        """
        at: At
        # TODO: rethink when adding machine-readable instuctions
        """
        The command accomplishes the purpose given by the last instruction on
        the Test type. There will be one scenario for each command the AT
        supports, so navigating to an unchecked checkbox might have four
        scenarios for the keys "X", "F", "TAB" and "DOWN" which all accomplish
        that purpose.
        """
        command: Command!
    }

    """
    A key combination or another kind of AT input, which has a human-readable ID
    like "TAB" or "DOWN" and a textual representation like "Tab" or "Down
    Arrow".
    """
    type Command {
        """
        Human-readable ID which is similar to the text such as "CTRL_OPT_DOWN"
        """
        id: ID!
        """
        A human-readable version of the command, such as "Control+Alt+Down"
        """
        text: String!
    }

    """
    Minimal plain representation of a Command.
    """
    type CommandInput {
        """
        See Command type for more information.
        """
        id: ID!
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

    """
    For a given output, the assertion describes a check on that output which can
    pass or fail.
    """
    type Assertion {
        """
        A unique ID which encodes some information used by the LocationOfData
        system.
        """
        id: ID!
        """
        Whether this assertion contributes to the test failing or not.
        """
        priority: AssertionPriority!
        # TODO: consider adding a automatedAssertion field which uses regex or
        # similar to automatically determine pass or fail.
        """
        A human-readable version of the assertion.
        """
        text: String!
    }

    """
    TestResults include all the outputs and assertion results which were
    collected while executing the test, as well as metadata about the execution.
    """
    type TestResult {
        """
        A unique ID which encodes some information used by the LocationOfData
        system.
        """
        id: ID!
        """
        The original test to which the results correspond.
        """
        test: Test!
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
    Minimal plain representation of a TestResult.
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
    For a given scenario, the tester will complete the instructions and then
    record the output of the AT, which then will be the basis for evaluating
    whether the assertions passed or failed.
    """
    type ScenarioResult {
        """
        A unique ID which encodes some information used by the LocationOfData
        system.
        """
        id: ID!
        """
        The original Scenario to which the result corresponds.
        """
        scenario: Scenario!
        """
        After each scenario is executed, the tester will capture the output of
        the AT, and that output will be used as the basis for the assertions.
        """
        output: String!
        """
        The outcomes of the assertions based on the output field.
        """
        assertionResults(priority: AssertionPriority): [AssertionResult]!
        """
        Failure states like "AT became excessively sluggish" which would count
        as a failure for any scenario, even when the assertions otherwise pass.
        """
        unexpectedBehaviors: [UnexpectedBehavior]!
    }

    """
    Minimal plain representation of a ScenarioResult.
    """
    input ScenarioResultInput {
        """
        See ScenarioResult type for more information.
        """
        scenarioId: ID!
        """
        See ScenarioResult type for more information.
        """
        output: String!
        """
        See ScenarioResult type for more information.
        """
        assertionResults: [AssertionResultInput]!
        """
        See ScenarioResult type for more information.
        """
        unexpectedBehaviors: [UnexpectedBehaviorInput]!
    }

    # TODO: figure out if this type can be removed and NO_OUTPUT can become an
    # unexpected behavior instead
    enum AssertionFailedReason {
        INCORRECT_OUTPUT
        NO_OUTPUT
    }

    """
    Whether an assertion passed or failed.
    """
    type AssertionResult {
        """
        A unique ID which encodes some information used by the LocationOfData
        system.
        """
        id: ID!
        """
        The original Assertion to which the result corresponds.
        """
        assertion: Assertion!
        """
        Whether the assertion is considered passing or failing.
        """
        passed: Boolean!
        # TODO: propose removing this for the reason given above
        """
        When passed is false, a failedReason must be given.
        """
        failedReason: AssertionFailedReason
    }

    """
    Minimal plain representation of an AssertionResult.
    """
    input AssertionResultInput {
        """
        See Assertion for more information.
        """
        assertionId: ID!
        """
        See Assertion for more information.
        """
        passed: Boolean!
        """
        See Assertion for more information.
        """
        failedReason: AssertionFailedReason
    }

    """
    A failure state such as "AT became excessively sluggish" which, if it
    occurs, should count as a scenario failure.
    """
    type UnexpectedBehavior {
        """
        Human-readable ID, e.g. "excessively_sluggish" which is similar to the
        text.
        """
        id: ID!
        """
        Human-readable sentence describing the failure.
        """
        text: String!
        """
        One of the unexpected behaviors is "other", which means the user must
        provide text explaining what occurred. For all other unexpected
        behaviors this field can be ignored.
        """
        otherUnexpectedBehaviorText: String
    }

    """
    Minimal plain representation of an UnexpectedBehavior.
    """
    input UnexpectedBehaviorInput {
        """
        See UnexpectedBehavior for more information.
        """
        id: ID!
        """
        See UnexpectedBehavior for more information.
        """
        otherUnexpectedBehaviorText: String
    }

    """
    Records information about the execution of a TestPlan.
    """
    type TestPlanRun {
        """
        Postgres-provided numeric ID.
        """
        id: ID!
        # TODO: Add a note about this being null if the execution is automated,
        # once automation is introduced.
        """
        The person who executed the tests. Note this is not populated on the
        TestPlanReport's finalizedTestPlanRun field, because in that case the
        TestPlanRun may reflect the work of multiple testers.
        """
        tester: User
        """
        The users whose test executions are represented by these results. Note
        that this field is only populated on the TestPlanReport's
        finalizedTestPlanRun field and not the draftTestPlanRuns field.
        """
        testers: [User]
        """
        Array of results, each of which correspond to one Test which can be
        found on the TestPlanVersion type.
        """
        testResults: [TestResult]!
    }

    """
    The life-cycle of a TestPlanReport from the point it is created by an admin
    until it is saved an available to the public on the reports page.
    """
    enum TestPlanReportStatus {
        """
        Accepting new TestPlanRuns from testers.
        """
        DRAFT
        """
        No longer accepting testing, but not yet published.
        """
        IN_REVIEW
        """
        Hides the TestPlanReport.
        """
        REMOVED
        """
        Testing is complete and consistent, and ready to be displayed in the
        Reports section of the app.
        """
        FINALIZED
    }

    """
    Tests, as we envision them, should not leave any room for interpretation. If
    a conflict between results is found, the report cannot be published until
    the cause of the disparity is determined.
    """
    type TestPlanReportConflict {
        """
        The part of the test where the disagreement occurred. This does not
        include the actual results and merely points to the test, scenario or
        assertion.
        """
        source: PopulatedData!
        """
        The two-or-more sets of test results which do not match. If the conflict
        occurred in an assertion, for example, the populated data would include
        a testPlanRun, scenarioResult and assertionResult for each of the
        results which differed (as well as the other associated data
        PopulatedData will make available.)
        """
        conflictingResults: [PopulatedData]!
    }

    """
    A container for test results as captured by multiple testers. Different
    TestPlanReports can share a single TestPlanTarget, allowing them to be
    organized and displayed in tables. The tests to be run for a TestPlanReport
    originate in the TestPlanVersion.
    """
    type TestPlanReport {
        """
        Postgres-provided numeric ID.
        """
        id: ID!
        """
        See TestPlanReportStatus type for more information.
        """
        status: TestPlanReportStatus!
        """
        See TestPlanTarget type for more information.
        """
        testPlanTarget: TestPlanTarget!
        """
        The snapshot of a TestPlan to use.
        """
        testPlanVersion: TestPlanVersion!
        """
        A list of conflicts between runs, which may occur at the level of the
        Scenario if the output or unexpected behaviors do not match, or even at
        the level of an Assertion, if the result of an assertion does not match.

        These conflicts must be resolved before the status can change from
        DRAFT or IN_REVIEW to FINALIZED.
        """
        conflicts: [TestPlanReportConflict]!
        """
        Finalizing a test plan report requires resolving any conflicts between
        runs. At this stage a single set of results is able to represent all
        results, and is much more convenient to work with.
        """
        finalizedTestPlanRun: TestPlanRun
        """
        These are all the TestPlanRuns which were recorded during the
        TestPlanReport's DRAFT stage.
        """
        draftTestPlanRuns: [TestPlanRun]!
        """
        The point at which an admin created the TestPlanReport.
        """
        createdAt: Timestamp!
    }

    """
    Minimal plain representation of a TestPlanReport.
    """
    input TestPlanReportInput {
        testPlanVersionId: ID!
        testPlanTarget: TestPlanTargetInput!
    }

    """
    Allows you to provide an ID, any ID, and load all the data which
    can be found through relationships to that ID. For example, if you have a
    scenarioResultId, it is possible to find a ScenarioResult, Scenario,
    TestResult, Test, TestPlanVersion, TestPlanTarget, At, AtVersion, Browser,
    BrowserVersion, and TestPlan. This can save a lot of effort wrangling data!
    """
    input LocationOfDataInput {
        testPlanId: ID
        testPlanVersionId: ID
        testId: ID
        scenarioId: ID
        assertionId: ID
        testPlanReportId: ID
        testPlanTargetId: ID
        browserId: ID
        browserVersion: String
        atId: ID
        atVersion: String
        testPlanRunId: ID
        testResultId: ID
        scenarioResultId: ID
        assertionResultId: ID
    }
    """
    Contains the same fields as the LocationOfDataInput type. This is used to
    return a LocationOfData in queries in the same form you can provide it as an
    input type. It is a scalar because otherwise you would need to request every
    single field, which would be hugely inconvenient.
    """
    scalar LocationOfData

    """
    The fully-populated data which is associated with a given LocationOfData.
    For example, a LocationOfData which includes an ID for a TestPlanReport
    would allow you to populate the TestPlanTarget, TestPlanVersion and
    TestPlan, which are knowable through relationships to that TestPlanReport.
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
        assertion: Assertion
        testPlanReport: TestPlanReport
        testPlanRun: TestPlanRun
        testResult: TestResult
        scenarioResult: ScenarioResult
        assertionResult: AssertionResult
    }

    type Query {
        """
        Get the currently-logged-in user or null if you are not logged in.
        """
        me: User
        """
        Get all registered users. Must be logged in.
        """
        users: [User]!
        """
        Get all assistive technologies known to the app.
        """
        ats: [At]!
        """
        Get all browsers known to the app.
        """
        browsers: [Browser]!
        """
        Get all test plans.
        """
        testPlans: [TestPlan]!
        """
        Load a particular TestPlan by ID.
        """
        testPlan(id: ID!): TestPlan
        """
        Get a TestPlanReport by ID.
        """
        testPlanReport(id: ID): TestPlanReport
        """
        Load multiple TestPlanReports, with the optional ability to filter by
        status. See TestPlanReport type for more information.
        """
        testPlanReports(statuses: [TestPlanReportStatus]): [TestPlanReport]!
        # TODO: determine if needed
        # """
        # Get all TestPlanTargets.
        # """
        # testPlanTargets: [TestPlanTarget]!
        """
        Get a TestPlanRun by ID.
        """
        testPlanRun(id: ID): TestPlanRun
        """
        For a given ID, load all the associated data which can be inferred from
        that ID. For more information, take a look at the description of the
        LocationOfDatInput type.
        """
        populateData(locationOfData: LocationOfDataInput!): PopulatedData!
    }

    # Mutation-specific types below

    type TestPlanReportOperations {
        """
        Assigns a user to a TestPlanReport, creating an associated TestPlanRun
        with no results.
        """
        assignTester(userId: ID!): PopulatedData!
        """
        Removes the TestPlanRun from the TestPlanReport for the user.
        """
        deleteTestPlanRun(userId: ID!): PopulatedData!
        deleteTestPlanRunResults(userId: ID!): PopulatedData!
        updateStatus(status: TestPlanReportStatus!): PopulatedData!
    }

    type TestPlanRunOperations {
        createTestResult(input: TestResultInput): PopulatedData!
    }

    type TestResultOperations {
        update(input: TestResultInput!): PopulatedData!
        delete: PopulatedData!
    }

    """
    Generic response to findOrCreate mutations, which allow you to dictate an
    expectation of what you want to exist, and it will be made so. It allows you
    to check whether new database records were created.
    """
    type findOrCreateResult {
        """
        The data that was found or created, as well as any implicit
        associations. For example, if you find or create a TestPlanReport, this
        will include the TestPlanReport as well as the TestPlanVersion and
        TestPlan.
        """
        populatedData: PopulatedData!
        """
        There will be one array item per database record created.
        """
        created: [PopulatedData]!
    }

    type Mutation {
        """
        Adds a report with the given TestPlanVersion and TestPlanTarget and a
        state of "DRAFT", resulting in the report appearing in the Test Queue.
        In the case an identical report already exists, it will be returned
        without changes and without affecting existing results. In the case an
        identical report exists but with a status of "REMOVED" or "FINALIZED",
        it will be given a status of "DRAFT" and will therefore be pulled back
        into the queue.
        """
        findOrCreateTestPlanReport(
            """
            The TestPlanReport to find or create.
            """
            input: TestPlanReportInput!
        ): findOrCreateResult!
        """
        Get the available mutations for the given TestPlanReport.
        """
        testPlanReport(id: ID!): TestPlanReportOperations!
        """
        Get the available mutations for the given TestPlanRun.
        """
        testPlanRun(id: ID!): TestPlanRunOperations!
        """
        Get the available mutations for the given TestResult.
        """
        testResult(id: ID!): TestResultOperations!
        """
        Update the currently-logged-in User.
        """
        updateMe(input: UserInput): User!
    }
`;

module.exports = graphqlSchema;
