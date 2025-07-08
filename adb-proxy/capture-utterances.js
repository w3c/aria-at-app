const { spawn } = require('child_process');
const { EventEmitter } = require('events');

class UtteranceCapture extends EventEmitter {
  constructor() {
    super();
    this.logcatProcess = null;
    this.isCapturing = false;
    this.utterances = [];
    this.exampleStarted = false;
  }

  async start() {
    if (this.isCapturing) {
      throw new Error('Capture already in progress');
    }

    try {
      // Check if device is connected
      const devices = await this.runAdbCommand(['devices']);
      if (!devices.includes('\tdevice')) {
        throw new Error('No Android device connected');
      }

      // Get TalkBack PID
      const pidOutput = await this.runAdbCommand([
        'shell',
        'pidof',
        '-s',
        'com.google.android.marvin.talkback'
      ]);
      const talkbackPid = pidOutput.trim();

      if (!talkbackPid) {
        throw new Error('TalkBack not running on device');
      }

      // Clear logcat buffer
      await this.runAdbCommand(['logcat', '-c']);

      this.emit('status', 'TalkBack found, starting capture...');
      this.emit('status', 'Please press the "Run Test Setup" button now...');

      // Start logcat for TalkBack
      this.logcatProcess = spawn(
        'adb',
        ['logcat', `--pid=${talkbackPid}`, '-v', 'threadtime'],
        {
          stdio: ['ignore', 'pipe', 'pipe']
        }
      );

      this.isCapturing = true;

      this.logcatProcess.stdout.on('data', data => {
        this.processLogOutput(data.toString());
      });

      this.logcatProcess.stderr.on('data', data => {
        this.emit('error', `Logcat error: ${data.toString()}`);
      });

      this.logcatProcess.on('exit', code => {
        this.isCapturing = false;
        this.emit('exit', code);
      });

      this.logcatProcess.on('error', error => {
        this.isCapturing = false;
        this.emit('error', `Process error: ${error.message}`);
      });
    } catch (error) {
      this.emit('error', error.message);
      throw error;
    }
  }

  processLogOutput(output) {
    const lines = output.split('\n');

    for (const line of lines) {
      if (!line.trim()) continue;

      if (!/talkback|utterance/i.test(line)) continue;

      // Look for "text.*Run Test Setup" to start capturing (only once)
      // Note: this will need to work with interaction, not just read in future
      // TODO: Combine with Howard's work
      if (
        !this.exampleStarted &&
        line.includes('text=') &&
        line.includes('Run Test Setup')
      ) {
        this.exampleStarted = true;
        this.emit('status', '--- Start of Example ---');
        continue;
      }

      if (this.exampleStarted) {
        if (line.includes('End of Example')) {
          this.emit('status', '--- End of Example ---');
          this.stop();
          this.emit('utterances_collected', this.utterances.join('  '));
          return;
        }

        if (line.includes('text=') && /utterance/i.test(line)) {
          const utteranceMatch = line.match(/text="([^"]*)"/);

          if (utteranceMatch && utteranceMatch[1] && utteranceMatch[1].trim()) {
            const utterance = utteranceMatch[1].trim();

            // Skip empty utterances and system messages
            if (
              utterance &&
              !utterance.includes('TalkBack') &&
              utterance !== 'null'
            ) {
              this.utterances.push(utterance);
              this.emit('utterance', { text: utterance, id: null });
            }
          }
        }
      }
    }
  }

  stop() {
    if (this.logcatProcess && this.isCapturing) {
      this.logcatProcess.kill('SIGINT');
      this.isCapturing = false;
    }
    if (this.captureTimeout) {
      clearTimeout(this.captureTimeout);
      this.captureTimeout = null;
    }
  }

  getCollectedUtterances() {
    return this.utterances.join('  ');
  }

  runAdbCommand(args) {
    return new Promise((resolve, reject) => {
      const process = spawn('adb', args, { stdio: ['ignore', 'pipe', 'pipe'] });
      let stdout = '';
      let stderr = '';

      process.stdout.on('data', data => {
        stdout += data.toString();
      });

      process.stderr.on('data', data => {
        stderr += data.toString();
      });

      process.on('exit', code => {
        if (code === 0) {
          resolve(stdout);
        } else {
          reject(new Error(`ADB command failed: ${stderr || stdout}`));
        }
      });

      process.on('error', error => {
        reject(error);
      });
    });
  }
}

module.exports = UtteranceCapture;
