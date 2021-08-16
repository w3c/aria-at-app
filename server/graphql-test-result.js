const a = gql`
    # Raw structure of TestPlanRun.testPlanResults[] object.
    # This structure is subject to change
    # {
    #   test: { ... }, // derived from TestPlanVersion.tests
    #   result: { ... }, // returned from iframe submit result
    #   serializedForm: [ ... ], // persisted form info once values are recorded for test in Test Navigator
    #   issues: [ ] // recorded GitHub issue numbers for any issue created
    # }
    type TestResult implements BaseTest {
        title: String!
        index: Int!
        testRendererUrl: String!
        instructions: [Instruction]!
        assertions(priority: AssertionPriority): [Assertion]!
        assertionsPassed(priority: AssertionPriority): Int!

        passThroughs: [PassThrough]!
        passThroughResults: [PassThroughResult]!

        isComplete: Boolean!
        isSkipped: Boolean!

        unexpectedBehaviorCount: Int!

        result: TestResultData
        serializedForm: [TestResultSerializedForm]
        issues: [Int]
    }

    # TestResultData and all other linked types are returned from the iframe
    # submit result.
    # This should be temporary while the logic of how the resolvers will work
    # with that data is discussed.
    type TestResultData {
        test: String!
        status: String!
        details: TestResultDataDetails!
    }

    type TestResultDataDetails {
        name: String!
        task: String!
        summary: TestResultDataDetailsSummary!
        commands: [TestResultDataDetailsCommands]!
        specific_user_instruction: String!
    }

    type TestResultDataDetailsSummary {
        # required/optional transformed from '1'/'2'
        required: TestResultDataDetailsSummaryPriority!
        optional: TestResultDataDetailsSummaryPriority!
        unexpectedCount: Int!
    }

    type TestResultDataDetailsSummaryPriority {
        pass: Int!
        fail: Int!
    }

    type TestResultDataDetailsCommands {
        output: String!
        command: String!
        support: String!
        assertions: [TestResultDataDetailsCommandsAssertion]!
        unexpected_behaviors: [String]!
    }

    type TestResultDataDetailsCommandsAssertion {
        pass: String
        fail: String
        priority: String!
        assertion: String!
    }

    type TestResultSerializedForm {
        name: String!
        value: String!
        checked: Boolean
        disabled: Boolean
        indeterminate: Boolean
    }

    input TestResultTestInput {
        htmlFile: String!
        testFullName: String!
        executionOrder: Int!
    }

    input TestResultDataInput {
        test: String!
        status: String!
        details: TestResultDataDetailsInput!
    }

    input TestResultDataDetailsInput {
        name: String!
        task: String!
        summary: TestResultDataDetailsSummaryInput!
        commands: [TestResultDataDetailsCommandsInput]!
        specific_user_instruction: String!
    }

    input TestResultDataDetailsSummaryInput {
        # required/optional needs to be transformed from '1'/'2'
        required: TestResultDataDetailsSummaryPriorityInput!
        optional: TestResultDataDetailsSummaryPriorityInput!
        unexpectedCount: Int!
    }

    input TestResultDataDetailsSummaryPriorityInput {
        pass: Int!
        fail: Int!
    }

    input TestResultDataDetailsCommandsInput {
        output: String!
        command: String!
        support: String!
        assertions: [TestResultDataDetailsCommandsAssertionInput]!
        unexpected_behaviors: [String]!
    }

    input TestResultDataDetailsCommandsAssertionInput {
        pass: String
        fail: String
        priority: String!
        assertion: String!
    }

    input TestResultSerializedFormInput {
        name: String!
        value: String!
        checked: Boolean
        disabled: Boolean
        indeterminate: Boolean
    }
`;
