/**
 * This function consumes the publishedRunsById data
 * from the Redux store and maps it into a matrix
 * whereby the columns are AT names and the rows
 * are browser names.
 * 
 * At the intersection of a row and column is an object
 * that contains as the key, a test plan name, and the value
 * as an object containing the total number of tests 
 * that have results and the number of tests with results
 * that pass.
 * 
 * An input like this:
 * {
    1: {
        apg_example_name: "Editor Menubar Example",
        at_name: "JAWS",
        browser_name: "Firefox",
        tests: [
            {
                execution_order: 1,
                file: "tests/menubar-editor/test-01-navigate-to-menubar-reading.html",
                id: 57,
                name: "Navigate to menubar in reading mode",
                results: {
                    1: {
                        result: {
                            status: "PASS"
                        }
                    }
                }
            }
        ]
    },
    2: {
        apg_example_name: "Checkbox Example (Two State)",
        at_name: "NVDA",
        browser_name: "Firefox",
        tests: [
            {
                execution_order: 1,
                file: "tests/checkbox/test-01-navigate-to-unchecked-checkbox-reading.html",
                id: 1,
                name: "Navigate to an unchecked checkbox in reading mode",
                results: {
                    1: {
                        result: {
                            status: "PASS"
                        }
                    }
                }
            }
        ]
    }
}

Yields a matrix like this:
[
    [null, "JAWS", "NVDA"],
    ["Firefox", { "Editor Menubar Example" : { total: 1, pass: 1 } }, { "Checkbox Example (Two State)" : { total: 1, pass: 1 } }]
]

This matrix is useful for calculating column names like "JAWS with Firefox" and "NVDA with Firefox".
It is also useful for quickly calculating the percentages required for a given cell by keying on
AT, Browser, and APG Example name

 */
export function generateStateMatrix(publishedRunsById) {
    let techMatrix = [[null]];

    // Set the matrix rows and columns
    Object.values(publishedRunsById).forEach(({ at_name, browser_name }) => {
        // fill in the AT columns
        if (!techMatrix[0].includes(at_name)) {
            techMatrix[0].push(at_name);
        }

        // Set browser rows
        if (!techMatrix.flat().includes(browser_name)) {
            techMatrix.push([browser_name]);
        }
    });

    // Fill the browser rows with nulls.
    for (let [i, row] of techMatrix.entries()) {
        if (row[0] !== null) {
            techMatrix[i] = [
                row[0],
                ...Array(techMatrix[0].length - 1).fill(null)
            ];
        }
    }

    // Fill the intersections of AT and browser with
    // an object keyed by AT, browser, and APG Example name.
    // Any remaining null values in the matrix mean that
    // a given AT, browser, APG example does not have data
    Object.values(publishedRunsById).forEach(
        ({ at_name, browser_name, apg_example_name, tests }) => {
            const colIdx = techMatrix[0].findIndex(at => at === at_name);
            const rowIdx = techMatrix.findIndex(
                browserRow => browserRow[0] === browser_name
            );
            const testsWithResults = tests.filter(
                test => Object.keys(test.results).length > 0
            );
            const testsPassed = testsWithResults.filter(
                test => Object.values(test.results)[0].result.status === 'PASS'
            );
            if (techMatrix[rowIdx][colIdx] === null)
                techMatrix[rowIdx][colIdx] = {};

            techMatrix[rowIdx][colIdx][apg_example_name] = {
                total: testsWithResults.length,
                pass: testsPassed.length
            };
        }
    );

    return techMatrix;
}

/**
 *
 * This function assumes that the object is in the form
 *
 * {
 *  'APG Example Name 1': { total: #, pass: #},
 *  'APG Example Name 2': { total: #, pass: #}
 * }
 *
 * and it returns a percentage from: total of the # passed / total of the totals
 */
export function calculateTotalObjectPercentage(object) {
    const topLevelData = Object.values(object).reduce(
        (acc, { total, pass }) => {
            acc.total += total;
            acc.pass += pass;
            return acc;
        },
        { total: 0, pass: 0 }
    );

    return Math.trunc((topLevelData.pass / topLevelData.total) * 100);
}

export function findAndCalculatePercentage(
    techMatrix,
    runAtName,
    runBrowserName,
    apgExampleName
) {
    // Get the data at that browser
    const techMatrixCol = techMatrix[0].findIndex(
        at_name => at_name === runAtName
    );
    const techMatrixRow = techMatrix.findIndex(
        browserRow => browserRow[0] === runBrowserName
    );

    // The math for the rows works by taking all the passing tests
    // and dividing by total number of tests with results
    return Math.trunc(
        (techMatrix[techMatrixRow][techMatrixCol][apgExampleName].pass /
            techMatrix[techMatrixRow][techMatrixCol][apgExampleName].total) *
            100
    );
}
