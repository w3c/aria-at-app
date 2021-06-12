const path = require('path');
const { spawn } = require('child_process');

const serverPath = path.join(__dirname, '../../server.js');

const setUpApiServer = async () => {
    const apiServer = spawn('node', [serverPath], {
        env: process.env,
        stdio: 'pipe'
    });

    let apiServerStarted;
    let apiServerFailedToStart;
    const apiServerPromise = new Promise((resolve, reject) => {
        apiServerStarted = resolve;
        apiServerFailedToStart = reject;
    });

    const determineIfServerStarted = firstOutput => {
        if (firstOutput && firstOutput.match(/Listening on \d+/)) {
            return apiServerStarted();
        }
        apiServerFailedToStart('API Server failed to start');
    };

    let isFirstOutput = true;

    apiServer.stdout.on('data', data => {
        const output = data.toString();
        console.log(output); // eslint-disable-line no-console

        if (isFirstOutput) {
            isFirstOutput = false;
            determineIfServerStarted(output);
        }
    });

    apiServer.stderr.on('data', data => {
        console.error(data.toString());
    });

    await apiServerPromise;

    const tearDown = () => {
        return new Promise(resolve => {
            apiServer.on('close', () => resolve());
            apiServer.kill();
        });
    };

    return {
        tearDown
    };
};

module.exports = setUpApiServer;
