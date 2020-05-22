/**
 * checkForConflicts         Checks for conflicts amount results objects
 * @param  {Object} results  Results object
 * @param  {Object} userId
 * @return {boolean}
 */

export default function(results, userId) {
    let baseResult = userId ? results[userId] : results[0];

    let baseUserId = baseResult.user_id;
    let otherResults = Object.values(results).filter(
        r => r.user_id !== baseUserId
    );

    // There are no conflicts trivially
    if (otherResults.length === 0) {
        return undefined;
    }

    // if (allResultsPass([baseResult, ...otherResults]) { return undefined; }

    let conflictList = [];
    for (let c = 0; c < baseResult.result.details.commands.length; c++) {
        let baseCommand = baseResult.result.details.commands[c];

        for (let a = 0; a < baseCommand.assertions.length; a++) {
            let baseAssertion = baseCommand.assertions[a];
            let baseAnswer = baseAssertion.fail
                ? `FAILED: ${baseAssertion.fail}`
                : `PASSED: ${baseAssertion.pass}`;

            let differentAnswers = [];

            for (let otherResult of otherResults) {
                let otherCommand = otherResult.result.details.commands[c];
                let otherAssertion = otherCommand.assertions[a];
                let otherAnswer = otherAssertion.fail
                    ? `FAILED: ${otherAssertion.fail}`
                    : `PASSED: ${otherAssertion.pass}`;

                if (baseAnswer !== otherAnswer) {
                    differentAnswers.push({
                        output: otherCommand.output,
                        answer: otherAnswer,
                        user: otherResult.user_id
                    });
                }
            }

            if (differentAnswers.length) {
                conflictList.push({
                    command: baseCommand.command,
                    assertion: baseAssertion.assertion,
                    answers: [
                        {
                            output: baseCommand.output,
                            answer: baseAnswer,
                            user: baseUserId
                        },
                        ...differentAnswers
                    ]
                });
            }
        }

        let differentAnswers = [];
        for (let otherResult of otherResults) {
            let otherCommand = otherResult.result.details.commands[c];

            // If the "unexpected_behaviors" list has different lengths, then
            // they are different.
            if (
                baseCommand.unexpected_behaviors.length !==
                otherCommand.unexpected_behaviors.length
            ) {
                differentAnswers.push({
                    output: otherCommand.output,
                    answer: otherCommand.unexpected_behaviors.length
                        ? otherCommand.unexpected_behaviors.join(' and ')
                        : 'No unexpected behaviors recorded',
                    user: otherResult.user_id
                });
            }
            // If they are the same length, confirm they are the same
            // unexpected behaviors
            else {
                for (let ub of baseCommand.unexpected_behaviors) {
                    if (!otherCommand.unexpected_behaviors.find(ub)) {
                        differentAnswers.push({
                            output: otherCommand.output,
                            answer: otherCommand.unexpected_behaviors.length
                                ? otherCommand.unexpected_behaviors.join(
                                      ' and '
                                  )
                                : 'No unexpected behaviors recorded',
                            user: otherResult.user_id
                        });
                        // If we find any conflicts in the unexpected list, then the lists conflict
                        break;
                    }
                }
            }

            if (differentAnswers.length) {
                conflictList.push({
                    command: baseCommand.command,
                    unexpected_behavior: true,
                    answers: [
                        {
                            output: baseCommand.output,
                            answer: baseCommand.unexpected_behaviors.length
                                ? baseCommand.unexpected_behaviors.join(' and ')
                                : 'No unexpected behaviors recorded',
                            user: baseUserId
                        },
                        ...differentAnswers
                    ]
                });
            }
        }
    }

    if (conflictList) {
        return conflictList;
    }
    return undefined;
}
