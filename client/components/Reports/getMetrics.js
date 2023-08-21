import React from 'react';
import styled from '@emotion/styled';

const StyledNone = styled.span`
    font-style: italic;
    color: #727272;
`;

const none = <StyledNone>None</StyledNone>;

const sum = arr => arr?.reduce((total, item) => total + item, 0) || 0;

const countTests = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        return (
            scenarioResult?.assertionResults?.every(
                assertionResult => assertionResult.passed
            ) || 0
        );
    };

    const countTestResult = testResult => {
        if (passedOnly)
            return testResult?.scenarioResults?.every(countScenarioResult)
                ? 1
                : 0;
        return testResult ? 1 : 0;
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countAssertions = ({
    testPlanReport, // Choose one to provide
    testResult, // Choose one to provide
    scenarioResult, // Choose one to provide
    priority,
    passedOnly
}) => {
    const countScenarioResult = scenarioResult => {
        const all =
            scenarioResult?.[`${priority.toLowerCase()}AssertionResults`] || [];
        if (passedOnly) return all.filter(each => each.passed).length;
        return all.length;
    };
    const countTestResult = testResult => {
        return sum(testResult?.scenarioResults?.map(countScenarioResult) || []);
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const countUnexpectedBehaviors = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const countScenarioResult = scenarioResult => {
        return scenarioResult?.unexpectedBehaviors?.length || 0;
    };
    const countTestResult = testResult => {
        return sum(testResult?.scenarioResults?.map(countScenarioResult) || []);
    };
    const countTestPlanReport = testPlanReport => {
        return sum(
            testPlanReport?.finalizedTestResults?.map(countTestResult) || []
        );
    };

    if (testPlanReport) return countTestPlanReport(testPlanReport);
    if (testResult) return countTestResult(testResult);
    return countScenarioResult(scenarioResult);
};

const getMetrics = ({
    scenarioResult, // Choose one to provide
    testResult, // Choose one to provide
    testPlanReport // Choose one to provide
}) => {
    const result = { scenarioResult, testResult, testPlanReport };
    const requiredAssertionsPassedCount = countAssertions({
        ...result,
        priority: 'REQUIRED',
        passedOnly: true
    });
    const requiredAssertionsCount = countAssertions({
        ...result,
        priority: 'REQUIRED'
    });
    const requiredAssertionsFailedCount =
        requiredAssertionsCount - requiredAssertionsPassedCount;

    const optionalAssertionsPassedCount = countAssertions({
        ...result,
        priority: 'OPTIONAL',
        passedOnly: true
    });
    const optionalAssertionsCount = countAssertions({
        ...result,
        priority: 'OPTIONAL'
    });
    const optionalAssertionsFailedCount =
        optionalAssertionsCount - optionalAssertionsPassedCount;

    const testsPassedCount = countTests({
        ...result,
        passedOnly: true
    });
    const testsCount =
        testPlanReport?.runnableTests?.length || countTests({ ...result });
    const testsFailedCount = testsCount - testsPassedCount;

    const requiredFormatted = `${requiredAssertionsPassedCount} of ${requiredAssertionsCount} passed`;
    const optionalFormatted =
        optionalAssertionsCount === 0
            ? none
            : `${optionalAssertionsPassedCount} of ${optionalAssertionsCount} passed`;

    const unexpectedBehaviorCount = countUnexpectedBehaviors({ ...result });
    const unexpectedBehaviorsFormatted =
        unexpectedBehaviorCount === 0
            ? none
            : `${unexpectedBehaviorCount} found`;

    let supportLevel;
    if (unexpectedBehaviorCount > 0 || requiredAssertionsFailedCount > 0) {
        supportLevel = 'FAILING';
    } else if (optionalAssertionsFailedCount > 0) {
        supportLevel = 'ALL_REQUIRED';
    } else {
        supportLevel = 'FULL';
    }

    const supportPercent = Math.round(
        (requiredAssertionsPassedCount / requiredAssertionsCount) * 100
    );

    return {
        requiredAssertionsPassedCount,
        requiredAssertionsCount,
        requiredAssertionsFailedCount,
        optionalAssertionsPassedCount,
        optionalAssertionsCount,
        optionalAssertionsFailedCount,
        testsPassedCount,
        testsCount,
        testsFailedCount,
        unexpectedBehaviorCount,
        requiredFormatted,
        optionalFormatted,
        unexpectedBehaviorsFormatted,
        supportLevel,
        supportPercent
    };
};

export { none };
export default getMetrics;
