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

    """
    The possible statuses for a CollectionJob.
    """
    enum CollectionJobStatus {
        QUEUED
        RUNNING
        COMPLETED
        ERROR
        CANCELLED
    }
    """
    A job which was scheduled to collect automated test results using the Response Collection System.
    """
    type CollectionJob {
        """
        Job Scheduler server-provided ID.
        """
        id: ID!
        """
        The status of the job, which can be "QUEUED", "RUNNING", "COMPLETED",
        "ERROR", or "CANCELLED".
        """
        status: CollectionJobStatus!
        """
        An ID for the Test Plan Run which was created as a result of the Collection Job.
        This will store the test results.
        """
        testPlanRun: TestPlanRun
        """
        The URL where the logs for the job can be found.
        """
        externalLogsUrl: String
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
        """
        The Ats which can be run with the specific browser, for example, Jaws can be run with Chrome but not Safari, and Safari works with VoiceOver only.
        """
        ats: [At]!
        """
        The Ats which are required to move a TestPlanVersion to CANDIDATE phase.
        """
        candidateAts: [At]!
        """
        The Ats which are required to move a TestPlanVersion to RECOMMENDED phase.
        """
        recommendedAts: [At]!
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
        atVersions: [AtVersion]!
        """
        The browsers which can run the At, for example, Safari can run VoiceOver but not Jaws because Jaws is Windows only.
        """
        browsers: [Browser]!
        """
        The browsers which are required to move a TestPlanVersion to CANDIDATE phase.
        """
        candidateBrowsers: [Browser]!
        """
        The browsers which are required to move a TestPlanVersion to RECOMMENDED phase.
        """
        recommendedBrowsers: [Browser]!
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
        The formal name of the test plan
        """
        title: String!
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
        latestTestPlanVersion: TestPlanVersion
        """
        Gets all historic versions of the test plan.
        """
        testPlanVersions: [TestPlanVersion]!
        """
        A list of all issues which have filed through "Raise an Issue" buttons
        in the app. Note that results will be cached for at least ten seconds.
        """
        issues: [Issue]!
    }

    """
    The life-cycle of a TestPlanVersion from the point it is imported automatically
    or by an admin until it is saved an available to the public on the reports page.
    """
    enum TestPlanVersionPhase {
        """
        Accepting new TestPlanRuns from testers.
        """
        RD
        """
        Accepting new TestPlanRuns from testers.
        """
        DRAFT
        """
        Testing is complete and consistent, and ready to be displayed in the
        Candidate Tests and Reports section of the app.
        """
        CANDIDATE
        """
        Testing is complete and consistent, and ready to be displayed in the
        Reports section of the app as being recommended.
        """
        RECOMMENDED
        """
        The TestPlanVersion is now outdated and replaced by another version.
        """
        DEPRECATED
    }

#    type TrendReport {
#        supportPercent
#    }

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
        """
        See TestPlanVersionPhase type for more information.
        """
        phase: TestPlanVersionPhase!
        """
        Date of when the TestPlanVersion last updated to the 'Draft'
        phase.
        """
        draftPhaseReachedAt: Timestamp
        """
        Date of when the TestPlanVersion was last updated to the 'Candidate'
        phase.
        """
        candidatePhaseReachedAt: Timestamp
        """
        Date of when the TestPlanVersion was last updated to the 'Recommended'
        phase.
        """
        recommendedPhaseReachedAt: Timestamp
        """
        The intended target date for the final TestPlanVersion phase promotion.
        Based on the ARIA-AT Working Mode.
        https://github.com/w3c/aria-at/wiki/Working-Mode
        """
        recommendedPhaseTargetDate: Timestamp
        """
        The date when the TestPlanVersion was deprecated.
        """
        deprecatedAt: Timestamp
        """
        The TestPlan this TestPlanVersion is a snapshot of.
        """
        testPlan: TestPlan!
        """
        A git sha corresponding to the current git commit at the time the
        version was imported from the ARIA-AT repo. Used to version the test
        plan over time.
        """
        gitSha: String!
        """
        Git commit message corresponding to the git sha's commit.
        """
        gitMessage: String!
        """
        The date (originating in Git) corresponding to the Git sha's commit.
        This can also be considered as the time for when R & D was complete
        """
        updatedAt: Timestamp!
        """
        An easily readable representation of the date associated with the
        version, formatted like V23.09.28 (or V23.09.28-1 in the case that
        there are multiple versions on the same day).
        """
        versionString: String!
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
        """
        The TestPlanReports attached to the TestPlanVersion.

        isFinal is used to check if a TestPlanReport has been "Marked as Final",
        indicated by TestPlanReport.markedFinalAt existence.
        None value indicates to return all.
        True value indicates to return the reports which only have an markedFinalAt date.
        False value indicates to return the reports which have no markedFinalAt date.
        """
        testPlanReports(isFinal: Boolean): [TestPlanReport]!
        """
        A list of existing or missing TestPlanReports that may be collected.
        """
        testPlanReportStatuses: [TestPlanReportStatus]!
        """
        For each report under this TestPlanVersion, if the report's combination
        is indicated as required and the report is marked as final at the time
        the TestPlanVersion is updated to RECOMMENDED then by checking the
        testers' runs which have been marked as primary, the earliest found AT
        version for the respective ATs should be considered as the
        first required AT version or "earliestAtVersion".

        The "earliest" is determined by comparing the recorded AtVersions'
        releasedAt value.

        Required Reports definition and combinations are defined at
        https://github.com/w3c/aria-at-app/wiki/Business-Logic-and-Processes#required-reports.

        Primary Test Plan Run is defined at
        https://github.com/w3c/aria-at-app/wiki/Business-Logic-and-Processes#primary-test-plan-run.

        After this TestPlanVersion is updated to RECOMMENDED, this should be
        used to ensure subsequent reports created under the TestPlanVersion
        should only being capturing results for AT Versions which are the same
        as or were released after the "earliestAtVersion".
        """
        earliestAtVersion(atId: ID!): AtVersion
        trendReports(atId: ID!, browserId: ID!): [TestPlanReport]
    }

    """
    An existing or missing TestPlanReport that can be collected for a given
    TestPlanVersion.
    """
    type TestPlanReportStatus {
        """
        Whether the TestPlanReport is actually required during the given
        TestPlanVersion phase.
        """
        isRequired: Boolean!
        """
        The report's AT, which will be populated even if the TestPlanReport is
        missing.
        """
        at: At!
        """
        The version of the AT that should be used for the report will be
        specified either as an exactAtVersion or minimumAtVersion and will be
        populated even if the TestPlanReport is missing.

        During the TestPlanVersion's draft and candidate phases, the looser
        requirement of minimumAtVersion will be used to reduce the amount of
        data collected before consensus is achieved.

        During the recommended phase all reports will be associated with an
        exactAtVersion, enabling large-scale data collection for all versions
        of the AT as they are released.
        """
        exactAtVersion: AtVersion
        """
        See exactAtVersion for more information.
        """
        minimumAtVersion: AtVersion
        """
        The report's browser, which will be populated even if the
        TestPlanReport is missing.
        """
        browser: Browser!
        """
        The TestPlanReport, which may not currently exist.
        """
        testPlanReport: TestPlanReport
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
        For more information, see the renderableContent field. Returns an array
        containing all renderableContent objects along with the associated AT.
        """
        renderableContents: [RenderableContentByAt]!
        """
        The URL to a HTML page which loads the Test Renderer and displays
        the Test. The atId is optional in cases where it can be inferred from
        context (i.e. the test is a child of a TestPlanReport with a known AT).
        """
        renderedUrl(atId: ID): String
        """
        For more information, see the renderedUrl field. Returns an array
        containing all renderedUrls along with the associated AT.
        """
        renderedUrls: [RenderedUrlByAt]!
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
        """
        Vendors who viewed the tests
        """
        viewers: [User]
        """
        Version number to indicate which of the following test writing specs this test is based on:
        1: https://github.com/w3c/aria-at/wiki/Test-Format-V1-Definition
        2: https://github.com/w3c/aria-at/wiki/Test-Format-Definition-V2
        """
        testFormatVersion: Int!
    }

    type RenderableContentByAt {
        at: At!
        renderableContent: Any!
    }

    type RenderedUrlByAt {
        at: At!
        renderedUrl: String!
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
        """
        The AT mode this command may be getting ran in, such as quickNavOn,
        browseMode, etc.
        The same command can be ran during the same test, but in a different
        mode.
        """
        # TODO: Add link to list of known AT modes
        atOperatingMode: String
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
        All required assertions must pass for the test to pass. This should be
        considered as 'MUST Behaviors'.
        """
        MUST
        """
        This assertion is not considered when deciding if a test is passing.
        This should be considered as 'SHOULD Behaviors'.
        """
        SHOULD
        # TODO Define MAY
        MAY
        """
        This assertion should not be included in the test and should not be
        used to determine if the test should pass or fail.
        This exclusion may be overwritten with an assertion exception.
        """
        EXCLUDE
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
        """
        A human-readable version of the assertion, like "Role 'radio button' is
        conveyed".
        """
        text: String!
        """
        For TestPlanVersions that use the V2 test format, this field contains
        text like "convey role 'radio button'".

        See the link for more information:
        https://github.com/w3c/aria-at/wiki/Test-Format-Definition-V2#assertionphrase
        """
        phrase: String
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
        atVersion: AtVersion
        """
        The BrowserVersion used during this testing session.
        """
        browserVersion: BrowserVersion
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
        atVersionId: ID
        """
        See TestResult type for more information.
        """
        browserVersionId: ID
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

    # NOTE: This has been deprecated
    enum AssertionFailedReason {
        INCORRECT_OUTPUT
        NO_OUTPUT
        AUTOMATED_OUTPUT
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
        NOTE: This has been deprecated, legacy use = when passed is false, a failedReason must be given.
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

    enum UnexpectedBehaviorImpact {
        MODERATE
        SEVERE
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
        The user must provide text explaining what occurred.
        """
        details: String!
        """
        The user must indicate the severity of the behavior.
        """
        impact: UnexpectedBehaviorImpact!
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
        details: String!
        """
        See UnexpectedBehavior for more information.
        """
        impact: UnexpectedBehaviorImpact!
    }

    """
    Records information about the execution of a TestPlan.
    """
    type TestPlanRun {
        """
        Postgres-provided numeric ID.
        """
        id: ID!
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
        """
        The number of completed tests for this TestPlanRun. Foregoes the need of
        getting the length from testResults which would require running
        expensive time-consuming operations to calculate.
        """
        testResultsLength: Int!
        """
        Whether the TestPlanRun was initiated by the Response Collection System
        """
        initiatedByAutomation: Boolean!
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
    Indicates the type of issue. 'CHANGES_REQUESTED' or 'FEEDBACK'.
    'FEEDBACK' is the default type.
    """
    enum IssueFeedbackType {
        FEEDBACK
        CHANGES_REQUESTED
    }

    type Issue {
        """
        GitHub username of the issue creator.
        """
        author: String!
        """
        The issue title in GitHub.
        """
        title: String!
        """
        Link to the GitHub issue's first comment.
        """
        link: String!
        """
        Will be true if the issue was raised on the Candidate Review page
        of the app (as opposed to other places with "raise an issue" buttons like
        the test queue or the reports page.)
        """
        isCandidateReview: Boolean!
        """
        Indicates the type of issue. 'CHANGES_REQUESTED' or 'FEEDBACK'.
        'FEEDBACK' is the default type.
        """
        feedbackType: IssueFeedbackType!
        """
        Indicates if the issue is currently open on GitHub.
        """
        isOpen: Boolean!
        """
        Test Number the issue was raised for.
        """
        testNumberFilteredByAt: Int
        """
        The time the issue was created, according to GitHub.
        """
        createdAt: Timestamp!
        """
        The time the issue was closed, if it was closed.
        """
        closedAt: Timestamp
        """
        The AT associated with the issue. Although there are not currently any
        cases where we generate GitHub issues without an associated AT, that
        may not remain true forever and we do support this field being
        undefined.
        """
        at: At
        """
        The browser associated with the issue, which may not be present.
        """
        browser: Browser
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
        The snapshot of a TestPlan to use.
        """
        testPlanVersion: TestPlanVersion!
        """
        The AT used when collecting results.
        """
        at: At!
        """
        Either a minimumAtVersion or exactAtVersion will be available. The
        minimumAtVersion, when defined, is the oldest version of the AT that
        testers are allowed to use when collecting results.
        """
        minimumAtVersion: AtVersion
        """
        Either a minimumAtVersion or exactAtVersion will be available. The
        exactAtVersion, when defined, is the only version of the AT that
        testers are allowed to use when collecting results. Note that when a
        TestPlanVersion reaches the recommended stage, all its reports will
        automatically switch from having a minimumAtVersion to an
        exactAtVersion. See the earliestAtVersion field of TestPlanVersion for
        more information.
        """
        exactAtVersion: AtVersion
        """
        The unique AT Versions used when collecting results for this report.
        """
        atVersions: [AtVersion]!
        """
        The latest AT Version used collecting results for this report.
        """
        latestAtVersionReleasedAt: AtVersion
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
        The number of tests available for this TestPlanReport's AT. Foregoes the
        need of getting the length from runnableTests which would require
        running expensive time-consuming operations to calculate.
        """
        runnableTestsLength: Int!
        """
        A list of conflicts between runs, which may occur at the level of the
        Scenario if the output or unexpected behaviors do not match, or even at
        the level of an Assertion, if the result of an assertion does not match.

        These conflicts must be resolved before the TestPlanVersion phase can change from
        DRAFT to CANDIDATE.
        """
        conflicts: [TestPlanReportConflict]!
        """
        The number of conflicts for this TestPlanReport. Foregoes the need for
        getting the length from conflicts which would require running expensive
        time-consuming operations to calculate.
        """
        conflictsLength: Int!
        """
        Finalizing a test plan report requires resolving any conflicts between
        runs. At this stage a single set of results is able to represent all
        results, and is much more convenient to work with.
        """
        finalizedTestResults: [TestResult]
        """
        A list of all issues which have filed through "Raise an Issue" buttons
        in the app. Note that results will be cached for at least ten seconds.
        """
        issues: [Issue]!
        """
        These are all the TestPlanRuns which were recorded during the
        TestPlanReport's DRAFT stage.
        """
        draftTestPlanRuns: [TestPlanRun]!
        """
        The state of the vendor review, which can be "READY", "IN_PROGRESS", and "APPROVED"
        """
        vendorReviewStatus: String
        """
        Various metrics and calculations related to the TestPlanReport which
        may be used for reporting purposes.
        """
        metrics: Any!
        """
        The point at which an admin created the TestPlanReport.
        """
        createdAt: Timestamp!
        """
        This is marked with the date when an admin has determined that all conflicts on the
        TestPlanReport have been resolved and indicates that the TestPlanReport is ready
        to be included when the entire TestPlanVersion is advanced to the "CANDIDATE" phase.
        """
        markedFinalAt: Timestamp
        """
        Indicated by TestPlanReport.markedFinalAt existence, after a report has been "marked as final".
        """
        isFinal: Boolean!
        """
        The AtVersion to display for a TestPlanReport only when the
        TestPlanVersion is RECOMMENDED.

        If this TestPlanReport was created with an "exactAtVersionId" being set,
        it will use the matching AtVersion, otherwise it will use the
        TestPlanVersion.earliestAtVersion as a default.
        """
        recommendedAtVersion: AtVersion
    }

    """
    Minimal plain representation of a TestPlanReport.
    """
    input TestPlanReportInput {
        testPlanVersionId: ID!
        atId: ID!
        exactAtVersionId: ID
        minimumAtVersionId: ID
        browserId: ID!
        copyResultsFromTestPlanVersionId: ID
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
        testPlanVersions(
            phases: [TestPlanVersionPhase]
            directory: String
        ): [TestPlanVersion]!
        """
        Get a particular TestPlanVersion by ID.
        """
        testPlanVersion(id: ID): TestPlanVersion
        """
        Load multiple TestPlanReports, with the optional ability to filter by
        TestPlanVersionPhase, atId, testPlanVersionId and if the report is marked as final.
        See TestPlanReport type for more information.
        """
        testPlanReports(
            testPlanVersionPhases: [TestPlanVersionPhase]
            testPlanVersionId: ID
            testPlanVersionIds: [ID]
            atId: ID
            isFinal: Boolean
        ): [TestPlanReport]!
        """
        Get a TestPlanReport by ID.
        """
        testPlanReport(id: ID!): TestPlanReport
        """
        Get a TestPlanRun by ID.
        """
        testPlanRun(id: ID!): TestPlanRun
        """
        Get all TestPlanRuns.
        """
        testPlanRuns(testPlanReportId: ID): [TestPlanRun]!
        """
        For a given ID, load all the associated data which can be inferred from
        that ID. For more information, take a look at the description of the
        LocationOfDatInput type.
        """
        populateData(locationOfData: LocationOfDataInput!): PopulatedData!
        """
        Get a CollectionJob by ID.
        """
        collectionJob(id: ID!): CollectionJob
        """
        Get a CollectionJob by TestPlanRun ID.
        """
        collectionJobByTestPlanRunId(testPlanRunId: ID!): CollectionJob
        """
        Get all CollectionJobs.
        """
        collectionJobs: [CollectionJob]!
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
        Assigns a user to a TestPlanReport, if a testPlanRunID is supplied the
        the TestPlanRun will be reassigned, otherwise an associated TestPlanRun
        with no results is created.
        """
        assignTester(userId: ID!, testPlanRunId: ID): PopulatedData!
        """
        Permanently deletes the TestPlanRun from the TestPlanReport for the
        user.
        """
        deleteTestPlanRun(userId: ID!): PopulatedData!
        """
        Updates the markedFinalAt date. This must be set before a TestPlanReport can
        be advanced to CANDIDATE. All conflicts must also be resolved.
        Only available to admins.

        Also optionally set a "primary test plan run" so a specific tester's output
        will be shown for on the report pages over another.
        """
        markAsFinal(primaryTestPlanRunId: ID): PopulatedData!
        """
        Remove the TestPlanReport's markedFinalAt date. This allows the TestPlanReport
        to be worked on in the Test Queue page again if was previously marked as final.
        """
        unmarkAsFinal: PopulatedData!
        """
        Move the vendor review status from READY to IN PROGRESS
        or IN PROGRESS to APPROVED
        """
        promoteVendorReviewStatus(vendorReviewStatus: String!): PopulatedData
        """
        Permanently deletes the TestPlanReport and all associated TestPlanRuns.
        Only available to admins.
        """
        deleteTestPlanReport: NoResponse
    }

    """
    Mutations scoped to a previously-created TestPlanVersion.
    """
    type TestPlanVersionOperations {
        """
        Update the test plan version phase. Remember that all conflicts must be resolved
        when setting the phase to CANDIDATE. Only available to admins.
        """
        updatePhase(
            phase: TestPlanVersionPhase!
            candidatePhaseReachedAt: Timestamp
            recommendedPhaseTargetDate: Timestamp
            testPlanVersionDataToIncludeId: ID
        ): PopulatedData!
        """
        Update the test plan version recommended phase target date.
        Only available to admins.
        """
        updateRecommendedPhaseTargetDate(
            recommendedPhaseTargetDate: Timestamp!
        ): PopulatedData!
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
    Mutations scoped to a CollectionJob.
    """
    type CollectionJobOperations {
        """
        Mark a CollectionJob as finished.
        """
        cancelCollectionJob: CollectionJob!
        """
        Retry the 'cancelled' tests of a CollectionJob.
        """
        retryCanceledCollections: CollectionJob!
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
        Adds an empty report to the test queue, a container for related test
        results. Each report must be scoped to a specific TestPlanVersion, AT
        and Browser. Optionally, either a minimum or exact AT version
        requirement can be included to constrain the versions testers are
        allowed to use to run the tests.
        """
        createTestPlanReport(
            """
            The TestPlanReport to create.
            """
            input: TestPlanReportInput!
        ): PopulatedData!
        """
        Get the available mutations for the given TestPlanReport.
        """
        testPlanReport(id: ID, ids: [ID]): TestPlanReportOperations!
        """
        Get the available mutations for the given TestPlanRun.
        """
        testPlanRun(id: ID!): TestPlanRunOperations!
        """
        Get the available mutations for the given TestResult.
        """
        testResult(id: ID!): TestResultOperations!
        """
        Get the available mutations for the given TestPlanVersion.
        """
        testPlanVersion(id: ID!): TestPlanVersionOperations!
        """
        Get the available mutations for the given CollectionJob.
        """
        collectionJob(id: ID!): CollectionJobOperations
        """
        Update the currently-logged-in User.
        """
        updateMe(input: UserInput): User!
        """
        Add a viewer to a test
        """
        addViewer(testPlanVersionId: ID!, testId: ID!): User!
        """
        Schedule a new CollectionJob through the Response Scheduler
        """
        scheduleCollectionJob(
            """
            The CollectionJob to schedule.
            """
            testPlanReportId: ID!
        ): CollectionJob!
        """
        Update a CollectionJob
        """
        updateCollectionJob(
            """
            The CollectionJob to update.
            """
            id: ID!
            """
            The status of the CollectionJob.
            """
            status: CollectionJobStatus
            """
            The external logs url of the CollectionJob.
            """
            externalLogsUrl: String
        ): CollectionJob
        """
        Restart a CollectionJob by way of the Response Scheduler
        """
        restartCollectionJob(
            """
            The CollectionJob to restart.
            """
            id: ID!
        ): CollectionJob
        """
        Delete a CollectionJob
        """
        deleteCollectionJob(id: ID!): NoResponse!
    }
`;

module.exports = graphqlSchema;
