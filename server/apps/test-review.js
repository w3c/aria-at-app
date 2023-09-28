const express = require('express');
const fs = require('fs');
const fetch = require('node-fetch');
const { resolve } = require('path');
const moment = require('moment');
const { create } = require('express-handlebars');
const CommandsAPI = require('../handlebars/test-review/scripts/at-commands');
const {
    parseCommandCSVRow
} = require('../handlebars/test-review/scripts/parse-command-csv-row');
const {
    createCommandTuplesATModeTaskLookup
} = require('../handlebars/test-review/scripts/command-tuples-at-mode-task-lookup');

const app = express();

// handlebars setup
const handlebarsPath =
    process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'test'
        ? 'handlebars/test-review'
        : 'server/handlebars/test-review';

const hbs = create({
    layoutsDir: resolve(handlebarsPath, 'views/layouts'),
    extname: 'hbs',
    defaultLayout: 'index',
    helpers: require(resolve(handlebarsPath, 'helpers'))
});
app.engine('hbs', hbs.engine);
app.set('view engine', 'hbs');
app.set('views', resolve(handlebarsPath, 'views'));

// Prepare applicable format for ats.json
const atsJSONFilePath =
    process.env.ENVIRONMENT === 'dev' || process.env.ENVIRONMENT === 'test'
        ? 'resources/ats.json'
        : 'server/resources/ats.json';

const ats = JSON.parse(fs.readFileSync(atsJSONFilePath, 'utf-8'));
for (const at of ats) {
    if (at.name.includes('VoiceOver')) at.key = 'voiceover_macos';
    else at.key = at.name.toLowerCase();
}

const getCommitInfo = async commit => {
    const OWNER = 'w3c';
    const REPO = 'aria-at';

    let commitDate;
    let commitMessage;

    try {
        const response = await fetch(
            `https://api.github.com/repos/${OWNER}/${REPO}/commits/${commit}`
        );
        const data = await response.json();

        if (data.commit) {
            commitDate = data.commit.author.date;
            commitMessage = data.commit.message;
        }
    } catch (error) {
        console.error('Error:', error.message);
    }

    return { commitDate, commitMessage };
};

const csvToJSON = csvString => {
    const lines = csvString.trim().split('\n');
    const headers = lines.shift().split(',');
    const result = [];

    lines.forEach(line => {
        const values = line.split(',');
        const obj = {};
        let valueIndex = 0;

        headers.forEach(header => {
            let value = values[valueIndex].trim();

            if (value.startsWith('"') && !value.endsWith('"')) {
                // If the value starts with a double quote but does not end with it,
                // continue to concatenate values until the ending quote is found
                while (
                    valueIndex < values.length &&
                    !values[valueIndex].endsWith('"')
                ) {
                    valueIndex++;
                    value += `,${values[valueIndex].trim()}`;
                }
            }

            if (value.startsWith('"') && value.endsWith('"')) {
                // If the value is enclosed in double quotes, remove the quotes
                value = value.slice(1, -1);
            }

            obj[header] = value;
            valueIndex++;
        });

        result.push(obj);
    });

    return result;
};

const convertTextToHTML = text => {
    const blocks = text.split('\n\n');
    let html = '';

    for (let block of blocks) {
        const lines = block.split('\n');
        if (lines[0].startsWith('*')) {
            html += '<ul>';
            for (let i = 0; i < lines.length; i++) {
                const line = lines[i].trim();
                if (line.startsWith('*')) {
                    html += '<li>' + line.substring(1).trim() + '</li>';
                }
            }
            html += '</ul>';
        } else {
            html += '<p class="commit-message">' + lines.join('<br>') + '</p>';
        }
    }

    return html;
};

const generateTests = async (pattern, commit, commitDate) => {
    const commandsCSVData = await fetch(
        `https://raw.githubusercontent.com/w3c/aria-at/${commit}/tests/${pattern}/data/commands.csv`
    );
    const commandsCSVText = await commandsCSVData.text();
    const commandsJSON = csvToJSON(commandsCSVText);

    const testsCSVData = await fetch(
        `https://raw.githubusercontent.com/w3c/aria-at/${commit}/tests/${pattern}/data/tests.csv`
    );
    const testsCSVText = await testsCSVData.text();
    const testsJSON = csvToJSON(testsCSVText);

    const referencesCSVData = await fetch(
        `https://raw.githubusercontent.com/w3c/aria-at/${commit}/tests/${pattern}/data/references.csv`
    );
    const referencesCSVText = await referencesCSVData.text();
    const referencesJSON = csvToJSON(referencesCSVText);

    const commandsParsed = commandsJSON.map(parseCommandCSVRow);
    const commands = createCommandTuplesATModeTaskLookup(commandsParsed);
    const commandsAPI = new CommandsAPI(commands, ats);

    const tests = [];
    const scripts = [];

    let scriptNames = [];
    testsJSON.forEach(testJSON => scriptNames.push(testJSON.setupScript));

    scriptNames = scriptNames.filter(
        (item, index) => scriptNames.indexOf(item) === index
    );

    for (const scriptName of scriptNames) {
        let script = '';
        try {
            const scriptData = await fetch(
                `https://raw.githubusercontent.com/w3c/aria-at/${commit}/tests/${pattern}/data/js/${scriptName}.js`
            );
            const scriptText = await scriptData.text();

            const lines = scriptText.split(/\r?\n/);
            lines.forEach(line => {
                if (line.trim().length) script += '\t' + line.trim() + '\n';
            });
        } catch (err) {
            console.error(err);
        }
        scripts.push(
            `\t${scriptName}: function(testPageDocument){\n${script}}`
        );
    }

    const allATKeys = ats.map(({ key }) => key);
    const validAppliesTo = ['Screen Readers', 'Desktop Screen Readers'].concat(
        allATKeys
    );

    const getAppliesToValues = values => {
        const checkValue = value => {
            let v1 = value.trim().toLowerCase();
            for (let i = 0; i < validAppliesTo.length; i++) {
                let v2 = validAppliesTo[i];
                if (v1 === v2.toLowerCase()) {
                    return v2;
                }
            }
            return false;
        };

        // check for individual assistive technologies
        const items = values.split(',');
        const newValues = [];
        items.filter(item => {
            const value = checkValue(item);
            if (value) newValues.push(value);
        });

        return newValues;
    };

    const getFormattedAssertion = assertion => {
        let level = '1';
        let str = assertion;
        assertion = assertion.trim();

        // matches a 'colon' when preceded by either of the digits 1 OR 2 (SINGLE CHARACTER), at the start of the string
        let parts = assertion.split(/(?<=^[1-2]):/g);

        if (parts.length === 2) {
            level = parts[0];
            str = parts[1].substring(0);
            if (level !== '1' && level !== '2') level = '2';
        }

        if (assertion.length) return [level, str];
    };

    const getPriorityString = function (priority) {
        priority = parseInt(priority);
        if (priority === 1) return 'required';
        else if (priority === 2) return 'optional';
        return '';
    };

    // https://github.com/w3c/aria-at/commit/9d73d6bb274b3fe75b9a8825e020c0546a33a162
    // This is the date of the last commit before the build folder removal.
    // Meant to support backward compatability until the existing tests can
    // be updated to the current structure
    const buildRemovalDate = new Date('2022-03-10 18:08:36.000000 +00:00');
    const useBuildInReferencePath =
        new Date(commitDate).getTime() <= buildRemovalDate.getTime();

    for (const testJSON of testsJSON) {
        const {
            task,
            mode,
            instructions,
            setupScript,
            setupScriptDescription
        } = testJSON;

        const atTests = [];

        const appliesTo = getAppliesToValues(testJSON.appliesTo);
        const allRelevantAts =
            appliesTo[0].toLowerCase() === 'desktop screen readers' ||
            appliesTo[0].toLowerCase() === 'screen readers'
                ? allATKeys
                : appliesTo;

        const assertions = [];

        for (const key of Object.keys(testJSON)) {
            if (key.includes('assertion')) {
                if (testJSON[key])
                    assertions.push(getFormattedAssertion(testJSON[key]));
            }
        }

        for (const atKey of allRelevantAts.map(a => a.toLowerCase())) {
            let commands;
            let at = commandsAPI.isKnownAT(atKey);

            try {
                commands = commandsAPI.getATCommands(mode, task, at);
            } catch (error) {
                // An error will occur if there is no data for a screen reader, ignore it
                // console.error('commandsAPI.getATCommands.error', error);
            }

            atTests.push({
                atName: at.name,
                atKey: at.key,
                commands: commands && commands.length ? commands : undefined,
                assertions:
                    assertions && assertions.length
                        ? assertions.map(a => ({
                              priority: getPriorityString(a[0]),
                              description: a[1]
                          }))
                        : undefined,
                userInstruction: instructions,
                modeInstruction: commandsAPI.getModeInstructions(mode, at),
                setupScriptDescription: setupScriptDescription
            });
        }

        let helpLinks = [];
        const getRef = refId => referencesJSON.find(ref => ref.refId === refId);

        helpLinks.push({
            link: getRef('example').value,
            text: `APG example: ${pattern}.html`
        });

        for (const ref of testJSON.refs.split(' ')) {
            if (ref)
                helpLinks.push({
                    link: getRef(ref).value,
                    text: `ARIA specification: ${ref}`
                });
        }

        const referenceValue = getRef('reference').value;

        const reference = `/aria-at/${commit}/${
            useBuildInReferencePath ? 'build/tests/' : 'tests/'
        }${pattern}/${
            setupScript
                ? referenceValue.replace(/\.html$/, `.${setupScript}.html`)
                : referenceValue
        }`;

        tests.push({
            testNumber: tests.length + 1,
            name: testJSON.title,
            setupScriptName: setupScript,
            allRelevantAts,
            reference,
            task,
            mode,
            atTests,
            helpLinks
        });
    }

    return { tests, scripts };
};

app.get('/:commit/:pattern', async (req, res) => {
    const commit = req.params.commit;
    const pattern = req.params.pattern;

    const { commitDate, commitMessage } = await getCommitInfo(commit);
    const { tests, scripts: setupScripts } = await generateTests(
        pattern,
        commit,
        commitDate
    );

    const rendered = await hbs.renderView(
        resolve(handlebarsPath, 'views/main.hbs'),
        {
            ats,
            tests,
            pattern,
            setupScripts,
            commitMessage: convertTextToHTML(commitMessage),
            commitDate: moment(commitDate).format('YYYY.MM.DD')
        }
    );

    // Disable browser-based caching which could potentially make the embed
    // contents appear stale even after being refreshed
    res.set('cache-control', 'must-revalidate').send(rendered);
});

app.use(express.static(resolve(`${handlebarsPath}/public`)));

module.exports = app;
