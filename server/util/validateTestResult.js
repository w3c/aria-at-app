const validateTestResult = (input = {}) => {
    return new Promise((resolve, reject) => {
        let testResult = { ...input };

        const hasTestObject = testResult.test;
        const hasResultObject = testResult.result;

        if (hasTestObject) {
            const { test } = testResult;
            const hasHtmlFile = 'htmlFile' in test;
            const hasTestFullName = 'testFullName' in test;
            const hasExecutionOrder = 'executionOrder' in test;

            if (!hasHtmlFile) return reject(new Error('test.htmlFile.missing'));
            if (!hasTestFullName)
                return reject(new Error('test.testFullName.missing'));
            if (!hasExecutionOrder)
                return reject(new Error('test.executionOrder.missing'));
        }

        if (hasResultObject) {
            const { result } = testResult;

            const hasDetails = 'details' in result;
            const hasSummary = 'summary' in result.details;
            const hasCommands = 'commands' in result.details;

            if (!hasDetails) return reject(new Error('result.details.missing'));
            if (!hasSummary)
                return reject(new Error('result.details.summary.missing'));
            if (!hasCommands)
                return reject(new Error('result.details.commands.missing'));

            if (hasSummary) {
                // must have either of the patterns to mark priority
                const hasRequiredNumber = '1' in result.details.summary;
                const hasOptionalNumber = '2' in result.details.summary;
                const hasRequiredString = 'required' in result.details.summary;
                const hasOptionalString = 'optional' in result.details.summary;
                const hasUnexpectedCount =
                    'unexpectedCount' in result.details.summary;

                if (!hasRequiredNumber && !hasRequiredString)
                    return reject(
                        new Error('result.details.summary.required.missing')
                    );
                if (!hasOptionalNumber && !hasOptionalString)
                    return reject(
                        new Error('result.details.summary.optional.missing')
                    );
                if (!hasUnexpectedCount)
                    return reject(
                        new Error(
                            'result.details.summary.unexpectedCount.missing'
                        )
                    );

                // transforming summary object
                if (testResult.result.details.summary['1'])
                    testResult.result.details.summary.required = {
                        ...testResult.result.details.summary['1']
                    };

                if (testResult.result.details.summary['1'])
                    testResult.result.details.summary.optional = {
                        ...testResult.result.details.summary['2']
                    };

                delete testResult.result.details.summary['1'];
                delete testResult.result.details.summary['2'];
            }
        }

        resolve(testResult);
    });
};

module.exports = validateTestResult;
