const ats = require('../../resources/ats.json');
const commands = require('../../resources/commands.json');
const commandsV2 = require('../../resources/commandsV2.json');

function findValueByKey(keyMappings, keyToFindText) {
    const keyToFind = keyToFindText.replace(/\s+/g, ' ').trim();
    const keyMap = Object.keys(keyMappings);

    // Need to specially handle VO modifier key combination
    if (keyToFind === 'vo')
        return findValuesByKeys(keyMappings, [
            keyMappings['modifierAliases.vo']
        ])[0];

    if (keyToFind.includes('modifiers.') || keyToFind.includes('keys.')) {
        const parts = keyToFind.split('.');
        const keyToCheck = parts[parts.length - 1]; // value after the '.'

        if (keyMappings[keyToFind])
            return {
                value: keyMappings[keyToFind],
                key: keyToCheck
            };

        return null;
    }

    for (const key of keyMap) {
        const parts = key.split('.');
        const parentKey = parts[0];
        const keyToCheck = parts[parts.length - 1]; // value after the '.'

        if (keyToCheck === keyToFind) {
            if (parentKey === 'modifierAliases') {
                return findValueByKey(
                    keyMappings,
                    `modifiers.${keyMappings[key]}`
                );
            } else if (parentKey === 'keyAliases') {
                return findValueByKey(keyMappings, `keys.${keyMappings[key]}`);
            }

            return {
                value: keyMappings[key],
                key: keyToCheck
            };
        }
    }

    // Return null if the key is not found
    return null;
}

function findValuesByKeys(commandsMapping, keysToFind = []) {
    const result = [];

    const patternSepWithReplacement = (keyToFind, pattern, replacement) => {
        if (keyToFind.includes(pattern)) {
            let value = '';
            let validKeys = true;
            const keys = keyToFind.split(pattern);

            for (const key of keys) {
                const keyResult = findValueByKey(commandsMapping, key);
                if (keyResult)
                    value = value
                        ? `${value}${replacement}${keyResult.value}`
                        : keyResult.value;
                else validKeys = false;
            }
            if (validKeys) return { value, key: keyToFind };
        }

        return null;
    };

    const patternSepHandler = keyToFind => {
        let value = '';

        if (keyToFind.includes(' ') && keyToFind.includes('+')) {
            const keys = keyToFind.split(' ');
            for (let [index, key] of keys.entries()) {
                const keyToFindResult = findValueByKey(commandsMapping, key);
                if (keyToFindResult) keys[index] = keyToFindResult.value;
                if (key.includes('+'))
                    keys[index] = patternSepWithReplacement(
                        key,
                        '+',
                        '+'
                    ).value;
            }
            value = keys.join(' then ');

            return { value, key: keyToFind };
        } else if (keyToFind.includes(' '))
            return patternSepWithReplacement(keyToFind, ' ', ' then ');
        else if (keyToFind.includes('+'))
            return patternSepWithReplacement(keyToFind, '+', '+');
    };

    for (const keyToFind of keysToFind) {
        if (keyToFind.includes(' ') || keyToFind.includes('+')) {
            result.push(patternSepHandler(keyToFind));
        } else {
            const keyToFindResult = findValueByKey(commandsMapping, keyToFind);
            if (keyToFindResult) result.push(keyToFindResult);
        }
    }

    return result;
}

/**
 * Resolves the Tests from their reduced form in the database to a fully-
 * populated form. Must be called before returning any test in GraphQL.
 * @param {*} parentRecord - Can be a TestPlanVersion or a TestPlanReport. Using
 * a TestPlanReport is preferable because it allows the resolver to infer a
 * default atId for child fields as in the `renderableContent(atId: ID)` field.
 * @returns {array[*]} - An array of resolved tests.
 */
const testsResolver = parentRecord => {
    const isTestPlanVersion = !!parentRecord.tests;
    const testPlanReport = isTestPlanVersion ? null : parentRecord;
    const testPlanVersion = isTestPlanVersion
        ? parentRecord
        : testPlanReport.testPlanVersion;
    const inferredAtId = testPlanReport?.atId;
    const isV2 = testPlanVersion.metadata.testFormatVersion;

    // Populate nested At and Command fields
    return testPlanVersion.tests.map(test => ({
        ...test,
        inferredAtId, // Not available in GraphQL, but used by child resolvers
        ats: test.atIds.map(atId => ats.find(at => at.id === atId)),
        scenarios: test.scenarios.map(scenario => ({
            ...scenario,
            at: ats.find(at => at.id === scenario.atId),
            commands: scenario.commandIds.map(commandId => {
                if (isV2) {
                    const commandIdentifier = findValuesByKeys(commandsV2, [
                        commandId
                    ]);

                    if (commandIdentifier.length) {
                        // TODO: Scenario contains identifier to the settings being displayed.
                        //  May be best to display the settings text instead, ie.
                        //  'PC cursor active' instead of having the client evaluate 'pcCursor'
                        return {
                            id: commandIdentifier[0].key,
                            text: commandIdentifier[0].value
                            // TODO settingsText: atMode[atId][scenario.settings].screenText
                        };
                    }
                    return {
                        id: '',
                        text: ''
                        // TODO settingsText: ''
                    };
                }
                return commands.find(command => command.id === commandId);
            })
        })),
        assertions: test.assertions.map(assertion => ({
            ...assertion,
            text: isV2 ? assertion.assertionStatement : assertion.text
        }))
    }));
};

module.exports = testsResolver;
