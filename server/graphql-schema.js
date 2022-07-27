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
        """
        Whether the user can perform vendor actions, such as reviewing
        candidate test plans. Vendors are specified in vendors.txt.
        """
        VENDOR
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
        # TODO: Either use the recorded data somewhere or eliminate the field.
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
        """
        A fully-qualified version like "99.0.4844.84"
        """
        browserVersions: [BrowserVersion]!
    }

    """
    A version which has been used to collect test results.
    """
    type BrowserVersion {
        """
        Postgres-provided numeric ID
        """
        id: ID!
        """
        Version string
        """
        name: String!
    }

    """
    The fields on the BrowserVersion type which must be provided to create new
    BrowserVersions.
    """
    input BrowserVersionInput {
        """
        See BrowserVersion type for more information.
        """
        name: String!
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
        atVersions: [AtVersion]!
    }

    """
    The version for a given assistive technology.
    """
    type AtVersion {
        """
        Postgres-provided numeric ID.
        """
        id: ID!
        """
        Human-readable name for the version, such as "2020.1".
        """
        name: String!
        """
        Date for approximate availability of the version.
        """
        releasedAt: Timestamp!
    }

    """
    The fields on the AtVersion type which can be used to create or update the
    AtVersion.
    """
    input AtVersionInput {
        """
        See AtVersion type for more information.
        """
        name: String!
        """
        See AtVersion type for more information.
        """
        releasedAt: Timestamp
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
        The TestPlan this TestPlanVersion is a snapshot of.
        """
        testPlan: TestPlan!
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
        # test pages for one TestPlanVersion (i.e. testing that
        # <input type="button"> and <button> have equivalent behavior).
        """
        Link to the HTML page which will be tested.
        """
        testPageUrl: String!
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
        Since each TestPlan originates from a CSV, this number corresponds to
        the row within the CSV where this test originated.
        """
        rowNumber: Int!
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
        """
        Raw execution-specific data for the Test Renderer such as inputs needed
        to generate the manual test instructions or links to the setup scripts
        which must be executed on the testPage. This data is unchanged from its
        original form found in the ARIA-AT repo's ".collected.json" files. The
        atId is optional in cases where it can be inferred from context (i.e.
        the test is a child of a TestPlanReport with a known AT).
        """
        renderableContent(atId: ID): Any
        """
        The URL to a HTML page which loads the Test Renderer and displays
        the Test. The atId is optional in cases where it can be inferred from
        context (i.e. the test is a child of a TestPlanReport with a known AT).
        """
        renderedUrl(atId: ID): String
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
        """
        The commands accomplish the task described in the Test title.
        Generally there will be a single command, such as "X" or "F", but there
        can also be a sequence of commands, such as "DOWN", "DOWN", "DOWN".
        There will be one scenario for each command the AT supports, so
        navigating to an unchecked checkbox might have four scenarios for the
        keys "X", "F", "TAB" and "DOWN" which all accomplish that purpose.
        """
        commands: [Command]!
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
    input CommandInput {
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
        The AtVersion used during this testing session.
        """
        atVersion: AtVersion!
        """
        The BrowserVersion used during this testing session.
        """
        browserVersion: BrowserVersion!
        """
        Automatically set by the server when a new test result is created.
        """
        startedAt: Timestamp!
        # TODO: update explanation once automation is introduced
        """
        Automatically set by the server when the test results have been
        successfully submitted. This means all the scenarios and assertions have
        been filled in and the user has clicked Submit Results in the UI.
        """
        completedAt: Timestamp
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
        id: ID!
        """
        See TestResult type for more information.
        """
        atVersionId: ID!
        """
        See TestResult type for more information.
        """
        browserVersionId: ID!
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
        Submitted test results require this field to be filled in.
        """
        output: String
        """
        The outcomes of the assertions based on the output field.
        """
        assertionResults(priority: AssertionPriority): [AssertionResult]!
        """
        Failure states like "AT became excessively sluggish" which would count
        as a failure for any scenario, even when the assertions otherwise pass.
        Submitted test results require this field to be filled in.
        """
        unexpectedBehaviors: [UnexpectedBehavior]
    }

    """
    Minimal plain representation of a ScenarioResult.
    """
    input ScenarioResultInput {
        """
        See ScenarioResult type for more information.
        """
        id: ID!
        """
        See ScenarioResult type for more information.
        """
        output: String
        """
        See ScenarioResult type for more information.
        """
        assertionResults: [AssertionResultInput]!
        """
        See ScenarioResult type for more information.
        """
        unexpectedBehaviors: [UnexpectedBehaviorInput]
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
        Whether the assertion is considered passing or failing. Submitted test
        results require this field to be filled in.
        """
        passed: Boolean
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
        id: ID!
        """
        See Assertion for more information.
        """
        passed: Boolean
        """
        See Assertion for more information.
        """
        failedReason: AssertionFailedReason
    }

    enum UnexpectedBehaviorId {
        EXCESSIVELY_VERBOSE
        UNEXPECTED_CURSOR_POSITION
        SLUGGISH
        AT_CRASHED
        BROWSER_CRASHED
        OTHER
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
        id: UnexpectedBehaviorId!
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
        id: UnexpectedBehaviorId!
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
        # TODO: make optional once automation is introduced.
        """
        The person who executed the tests.
        """
        tester: User!
        """
        The TestPlanReport this TestPlanRun is a part of.
        """
        testPlanReport: TestPlanReport!
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
        include the actual results and merely points to the differing scenario
        or assertion.
        """
        source: PopulatedData!
        """
        The two-or-more sets of test results which do not match. If the conflict
        occurred in an assertion, for example, the populated data would include
        a testPlanRun, scenarioResult and assertionResult for each of the
        results which differed (as well as the other associated data
        PopulatedData will make available).
        """
        conflictingResults: [PopulatedData]!
    }

    """
    A container for test results as captured by multiple testers. The tests to
    be run for a TestPlanReport originate in the TestPlanVersion.
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
        The snapshot of a TestPlan to use.
        """
        testPlanVersion: TestPlanVersion!
        """
        The AT used when collecting results.
        """
        at: At!
        """
        The browser used when collecting results.
        """
        browser: Browser!
        """
        The subset of tests which are relevant to this report, i.e. the tests
        where the AT matches the report's AT.
        """
        runnableTests: [Test]!
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
        finalizedTestResults: [TestResult]
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
        atId: ID!
        browserId: ID!
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
        browserId: ID
        browserVersionId: ID
        atId: ID
        atVersionId: ID
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
    would allow you to populate the TestPlanVersion, AT, Browser and TestPlan,
    which are knowable through relationships to that TestPlanReport.
    """
    type PopulatedData {
        locationOfData: LocationOfData!
        testPlan: TestPlan
        testPlanVersion: TestPlanVersion
        at: At
        atVersion: AtVersion
        browser: Browser
        browserVersion: BrowserVersion
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
        Get all TestPlans.
        """
        testPlans: [TestPlan]!
        """
        Load a particular TestPlan by ID.
        """
        testPlan(id: ID!): TestPlan
        """
        Get all TestPlanVersions.
        """
        testPlanVersions: [TestPlanVersion]!
        """
        Get a particular TestPlanVersion by ID.
        """
        testPlanVersion(id: ID!): TestPlanVersion
        """
        Load multiple TestPlanReports, with the optional ability to filter by
        status. See TestPlanReport type for more information.
        """
        testPlanReports(statuses: [TestPlanReportStatus]): [TestPlanReport]!
        """
        Get a TestPlanReport by ID.
        """
        testPlanReport(id: ID!): TestPlanReport
        """
        Get a TestPlanRun by ID.
        """
        testPlanRun(id: ID!): TestPlanRun
        """
        For a given ID, load all the associated data which can be inferred from
        that ID. For more information, take a look at the description of the
        LocationOfDatInput type.
        """
        populateData(locationOfData: LocationOfDataInput!): PopulatedData!
    }

    # Mutation-specific types below

    """
    Mutations scoped to an Assistive Technology.
    """
    type AtOperations {
        """
        Get an AtVersion or create it if it does not exist. In the case the
        AtVersion already exists, the releasedAt field will be ignored.
        """
        findOrCreateAtVersion(input: AtVersionInput!): AtVersion!
    }

    """
    Mutations scoped to an existing AtVersion.
    """
    type AtVersionOperations {
        """
        Edit the version.
        """
        updateAtVersion(input: AtVersionInput!): AtVersion!
        """
        Delete an unused AtVersion. If it is in use by any TestResults, the
        AtVersion will not be deleted and the array of offending TestResults
        will be returned in the response.
        """
        deleteAtVersion: DeleteAtVersionResult!
    }

    type DeleteAtVersionResult {
        """
        A boolean which will be true if the AtVersion was deleted.
        """
        isDeleted: Boolean!
        """
        An array of TestResults which are using the AtVersion and have therefore
        prevented its deletion. There is a check in place to limit the number of
        queries this endpoint will make, so in an extreme case the list may not
        be exhaustive.
        """
        failedDueToTestResults: [PopulatedData]
    }

    """
    Mutations scoped to a browser.
    """
    type BrowserOperations {
        """
        Get a BrowserVersion or create it if it does not exist.
        """
        findOrCreateBrowserVersion(input: BrowserVersionInput!): BrowserVersion!
    }

    """
    Mutations scoped to a previously-created TestPlanReport.
    """
    type TestPlanReportOperations {
        """
        Assigns a user to a TestPlanReport, creating an associated TestPlanRun
        with no results.
        """
        assignTester(userId: ID!): PopulatedData!
        """
        Permanently deletes the TestPlanRun from the TestPlanReport for the
        user.
        """
        deleteTestPlanRun(userId: ID!): PopulatedData!
        """
        Update the report status. Remember that all conflicts must be resolved
        when setting the status to FINALIZED. Only available to admins.
        """
        updateStatus(status: TestPlanReportStatus!): PopulatedData!
        """
        Permanently deletes the TestPlanReport and all associated TestPlanRuns.
        Only available to admins.
        """
        deleteTestPlanReport: NoResponse
    }

    """
    Mutations scoped to a previously-created TestPlanRun.
    """
    type TestPlanRunOperations {
        """
        Creates a TestResult which is populated with all the ScenarioResults
        and AssertionResults to be filled out for the AT associated with the
        TestPlanRun, or returns the already existing TestResult. In the case
        that the TestResult already exists, the atVersionId and browserVersionId
        will be ignored.
        """
        findOrCreateTestResult(
            testId: ID!
            atVersionId: ID!
            browserVersionId: ID!
        ): PopulatedData!
        """
        Permanently deletes all test results without removing the TestPlanRun.
        """
        deleteTestResults: PopulatedData!
    }

    """
    Mutations scoped to a previously-created TestResult.
    """
    type TestResultOperations {
        """
        Saves any changes to the TestResult. Minimal validation is performed
        since this mutation is meant to be called repeatedly as the user
        completes the forms.
        """
        saveTestResult(input: TestResultInput!): PopulatedData!
        """
        Should only be called when the TestResult is complete, with all
        ScenarioResults and AssertionResults filled in, or else this
        mutation will throw an error. This endpoint will set the completedAt
        field, indicating the test has been successfully submitted and accepted.
        """
        submitTestResult(input: TestResultInput!): PopulatedData!
        """
        Permanently deletes the TestResult.
        """
        deleteTestResult: PopulatedData!
    }

    """
    Generic response to findOrCreate mutations, which allow you to dictate an
    expectation of what you want to exist, and it will be made so. It allows you
    to check whether new database records were created.
    """
    type FindOrCreateResult {
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
        Get the available mutations for the given AT.
        """
        at(id: ID!): AtOperations!
        """
        Get the available mutations for the given AT version.
        """
        atVersion(id: ID!): AtVersionOperations!
        """
        Get the available mutations for the given browser.
        """
        browser(id: ID!): BrowserOperations!
        """
        Adds a report with the given TestPlanVersion, AT and Browser, and a
        state of "DRAFT", resulting in the report appearing in the Test Queue.
        In the case an identical report already exists, it will be returned
        without changes and without affecting existing results. In the case an
        identical report exists but with a status of "FINALIZED",
        it will be given a status of "DRAFT" and will therefore be pulled back
        into the queue with its results unaffected.
        """
        findOrCreateTestPlanReport(
            """
            The TestPlanReport to find or create.
            """
            input: TestPlanReportInput!
        ): FindOrCreateResult!
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
