const { spawn } = require('child_process');

module.exports = async () => {
    return new Promise(resolve => {
        const serverProcess = spawn(
            'node',
            ['-r', 'dotenv/config', '../server/server.js'],
            {
                env: {
                    ...process.env,
                    DOTENV_CONFIG_PATH: '../config/test.env'
                }
            }
        );

        global.serverProcess = serverProcess;

        serverProcess.stdout.on('data', data => {
            if (data.toString().startsWith('Listening on')) {
                resolve();
                return;
            }
            console.info(data.toString()); // eslint-disable-line no-console
        });

        serverProcess.stderr.on('data', data => {
            console.error(data.toString());
        });
    });
};
