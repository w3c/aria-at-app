/**
 * formatConflictsAsText
 * @param  {Array} conflicts
 * @param  {Number | String} userId
 * @param  {Object} markdown
 */

export default function(conflicts, userId, markdown = null) {
    throw new Error('Handled by GraphQL');
    // eslint-disable-next-line no-unreachable
    let mdheader = markdown ? '##### ' : '';
    let mdlist = markdown ? '* ' : '';

    let conflictsText = '';

    for (let i = 0; i < conflicts.length; i++) {
        let conflict = conflicts[i];

        if (conflict.assertion) {
            let yourAnswer = conflict.answers.find(a => a.tester.id == userId);
            let otherAnswers = conflict.answers.filter(
                a => a.tester.id != userId
            );

            conflictsText += `
${mdheader}Difference ${i + 1} - Testing ${conflict.command} for ${
                conflict.assertion
            }
${mdlist}Your result: ${yourAnswer ? yourAnswer.answer : 'N/A'} (for output "${
                yourAnswer ? yourAnswer.output : 'N/A'
            }")`;

            for (let answer of otherAnswers) {
                conflictsText += `
${mdlist}Other result: ${answer.answer} (for output "${answer.output}")
`;
            }
        } else {
            let yourUnexpected = conflict.answers.find(
                a => a.tester.id == userId
            );
            let otherUnexpecteds = conflict.answers.filter(
                a => a.tester.id != userId
            );

            conflictsText += `
${mdheader}Difference ${i + 1} - Unexpected behavior when testing ${
                conflict.command
            }
${mdlist}Your unexpected behaviors: ${
                yourUnexpected ? yourUnexpected.answer : 'N/A'
            } (for output "${
                yourUnexpected ? yourUnexpected.output : 'N/A'
            }") `;

            for (let unexpected of otherUnexpecteds) {
                conflictsText += `
${mdlist}Other unexpected behaviors: ${unexpected.answer} (for output "${unexpected.output}")
`;
            }
        }
    }

    return conflictsText;
}
