import React from 'react';
import checkForConflict from '../../utils/checkForConflict';

function generateTestsWithMetaData(runs, techPairs) {
    return techPairs.map(({ browser, at }) => {
        const runForTechPair = runs.find(({ browser_name, at_name }) => {
            return browser_name === browser && at_name === at;
        });
        let testsWithMetaData = {
            requiredAssertions: 0,
            passingRequiredAssertions: 0,
            optionalAssertions: 0,
            passingOptionalAssertions: 0,
            unexpectedBehaviors: 0,
            testsWithResults: []
        };

        if (runForTechPair) {
            runForTechPair.tests.forEach(test => {
                const results = Object.values(test.results || {});
                const result = results.find(r => r.status === 'complete');
                const noConflicts = checkForConflict(results).length === 0;

                if (result && noConflicts) {
                    const details = result.result.details;
                    const requiredAssertionSummary = details.summary[1];
                    const requiredAssertions =
                        requiredAssertionSummary.pass +
                        requiredAssertionSummary.fail;
                    const optionalAssertionsSummary = details.summary[2];
                    const optionalAssertions =
                        optionalAssertionsSummary.pass +
                        optionalAssertionsSummary.fail;
                    const unexpectedBehaviors = details.summary.unexpectedCount;

                    testsWithMetaData.requiredAssertions += requiredAssertions;
                    testsWithMetaData.passingRequiredAssertions +=
                        requiredAssertionSummary.pass;
                    testsWithMetaData.optionalAssertions += optionalAssertions;
                    testsWithMetaData.passingOptionalAssertions +=
                        optionalAssertionsSummary.pass;
                    testsWithMetaData.unexpectedBehaviors += unexpectedBehaviors;

                    testsWithMetaData.testsWithResults.push({
                        testName: test.name,
                        requiredAssertions,
                        passingRequiredAssertions:
                            requiredAssertionSummary.pass,
                        optionalAssertions,
                        passingOptionalAssertions:
                            optionalAssertionsSummary.pass,
                        unexpectedBehaviors,
                        executionOrder: test.execution_order,
                        runId: runForTechPair.id
                    });
                }
            });
        }
        return testsWithMetaData;
    });
}

/**
 * @param {Object.<number, Run>} publishedRunsById
 * @param {TechPair}
 *
 * @return {Array.<Example>}
 *
 * @typedef Example
 * @type {object}
 * @property {string} exampleName
 * @property {number} id
 * @property {Array.<string>} testNames - Name of every test for an example
 * @property {Array.<TestWithMetaData>} testsWithMetaDataIndexedByTechPair
 *
 * @typedef TestsWithMetaData
 * @type {object}
 * @type {number} requiredAssertions
 * @type {number} passingRequiredAssertions
 * @type {number} optionalAssertions
 * @type {number} passingOptionalAssertions
 * @type {number} unexpectedBehaviors
 * @types {Array.<TestWithResults>} testsWithResults
 *
 * @typedef TestWithResults
 * @type {object}
 * @type {string} testName
 * @type {number} requiredAssertions
 * @type {number} passingRequiredAssertions
 * @type {number} optionalAssertions
 * @type {number} passingOptionalAssertions
 * @type {number} unexpectedBehaviors
 * @type {number} executionOrder
 * @type {number} runId
 */
export function generateApgExamples(publishedRunsById, techPairs) {
    const runs = Object.values(publishedRunsById);
    const apgExamples = [...new Set(runs.map(r => r.apg_example_name))];
    return apgExamples.map(example => {
        const exampleRuns = runs.filter(r => r.apg_example_name === example);
        return {
            exampleName: example,
            id: exampleRuns[0].apg_example_id,
            testNames: exampleRuns[0].tests.map(({ name }) => name),
            testsWithMetaDataIndexedByTechPair: generateTestsWithMetaData(
                exampleRuns,
                techPairs
            )
        };
    });
}

/**
 * @param {Object.<number, Run>} publishedRunsById
 * @param {TechPair}
 * @param {number} apgExampleId
 *
 * @return {Example}
 */
export function generateApgExample(publishedRunsById, techPairs, apgExampleId) {
    const apgExamples = generateApgExamples(publishedRunsById, techPairs);
    return apgExamples.find(({ id }) => id === apgExampleId);
}

/**
 * @param {Object.<number, Run>} publishedRunsById - See RunService
 *
 * @return {Array.<TechPair>}
 *
 * @typedef TechPair
 * @type {object}
 * @property {string} browser
 * @property {string} browserVersion
 * @property {string} at
 * @property {string} atVersion
 */
export function generateTechPairs(publishedRunsById) {
    let techPairs = [];
    const runs = Object.values(publishedRunsById);
    runs.forEach(run => {
        const match = techPairs.find(
            pair => pair.browser === run.browser_name && pair.at === run.at_name && pair.browserVersion === run.browser_version && pair.atVersion === run.at_version
        );
        if (!match) {
            techPairs.push({
                browser: run.browser_name,
                browserVersion: run.browser_version,
                at: run.at_name,
                atVersion: run.at_version
            });
        }
    });
    return techPairs;
}

export function calculatePercentage(numerator, demoninator) {
    if (demoninator > 0) {
        return Math.trunc((numerator / demoninator) * 100);
    } else {
        return 0;
    }
}

export function formatNoResults() {
    return (
        <>
            <span className="sr-only">No results</span>
            <span aria-hidden="true">{'-'}</span>
        </>
    );
}

export function formatFraction(numerator, demoninator) {
    if (demoninator > 0) {
        return (
            <>
                <span className="sr-only">{`${numerator} of ${demoninator}`}</span>
                <span aria-hidden="true">{`${numerator} / ${demoninator}`}</span>
            </>
        );
    } else {
        return formatNoResults();
    }
}

export function formatInteger(number) {
    if (number === 0) {
        return 'none';
    } else {
        return number;
    }
}

/**
 * @param {Array.<Example>} apgExamples
 * @param {number} techPairIndex
 *
 * @return {number} percentage
 */
export function calculateTotalPercentageForTechPair(
    apgExamples,
    techPairIndex
) {
    const topLevelData = apgExamples
        .map(
            ({ testsWithMetaDataIndexedByTechPair }) =>
                testsWithMetaDataIndexedByTechPair[techPairIndex]
        )
        .reduce(
            (acc, { requiredAssertions, passingRequiredAssertions }) => {
                acc.total += requiredAssertions;
                acc.pass += passingRequiredAssertions;
                return acc;
            },
            { total: 0, pass: 0 }
        );
    return calculatePercentage(topLevelData.pass, topLevelData.total);
}
