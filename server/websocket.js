/* eslint-disable no-console */
const WebSocket = require('ws');
const http = require('http');
const https = require('https');
const { URL } = require('url');

const PROXY_URL = process.env.ADB_PROXY_URL || 'http://localhost:3080';

// Store active capture sessions
const captureSessions = new Map();

const setupWebSocketServer = server => {
  const wss = new WebSocket.Server({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    console.info(
      `New WebSocket connection attempt\nConnection URL: ${req.url}\nConnection headers: ${req.headers}`
    );

    const sessionId = req.url.split('?sessionId=')[1];
    if (!sessionId) {
      console.error('No session ID provided, closing connection');
      ws.close(1008, 'Missing sessionId');
      return;
    }

    console.info(`New WebSocket connection for session ${sessionId}`);

    ws.on('message', async message => {
      console.info(`Raw message: ${message}`);
      try {
        const data = JSON.parse(message);
        console.info('Parsed message data', data);

        if (data.type === 'startCapture') {
          console.info('Starting utterance capture for session', sessionId);

          // If there's already a session running, close it
          if (captureSessions.has(sessionId)) {
            console.warn('Found existing session, cleaning up...');
            const existingSession = captureSessions.get(sessionId);
            if (existingSession.abortController) {
              existingSession.abortController.abort();
            }
            captureSessions.delete(sessionId);
            await new Promise(resolve => setTimeout(resolve, 100));
          }

          // Use proxy URL from the message, fallback to default
          const effectiveProxyUrl = data.proxyUrl || PROXY_URL;
          console.info('Using proxy URL:', effectiveProxyUrl);

          try {
            console.info(
              `Connecting to proxy streaming endpoint at ${effectiveProxyUrl}`
            );

            // Create abort controller for this session
            const abortController = new AbortController();

            // Store the session
            captureSessions.set(sessionId, { abortController, ws });
            console.info('Session stored', Array.from(captureSessions.keys()));

            // Start streaming from proxy using native HTTP (axios closes SSE streams)
            const proxyUrl = new URL(
              `${effectiveProxyUrl}/stream-capture-utterances`
            );
            const postData = JSON.stringify({});

            const options = {
              hostname: proxyUrl.hostname,
              port:
                proxyUrl.port || (proxyUrl.protocol === 'https:' ? 443 : 80),
              path: proxyUrl.pathname,
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(postData),
                Accept: 'text/event-stream',
                'Cache-Control': 'no-cache'
              }
            };

            // Use https for ngrok or similar URLs, http for localhost
            const requestModule = proxyUrl.protocol === 'https:' ? https : http;

            const req = requestModule.request(options, response => {
              console.info(
                `Connected to proxy, status: ${response.statusCode}`
              );

              if (response.statusCode !== 200) {
                console.error(
                  `Proxy responded with status: ${response.statusCode}`
                );
                ws.send(
                  JSON.stringify({
                    type: 'error',
                    error: `Proxy error: ${response.statusCode}`
                  })
                );
                captureSessions.delete(sessionId);
                return;
              }

              console.info(`HTTP response headers:`, response.headers);
              console.info(`Starting to listen for SSE data...`);

              // Handle streaming data
              response.on('data', chunk => {
                const lines = chunk.toString().split('\n');

                for (const line of lines) {
                  if (line.startsWith('data: ') && line.trim().length > 6) {
                    try {
                      const jsonData = line.substring(6).trim();
                      if (jsonData) {
                        const eventData = JSON.parse(jsonData);
                        console.info('Received from proxy:', eventData);

                        // Forward to WebSocket client
                        if (captureSessions.has(sessionId)) {
                          ws.send(JSON.stringify(eventData));
                        }
                      }
                    } catch (error) {
                      console.error(
                        'Error parsing SSE data:',
                        error,
                        'Line:',
                        line
                      );
                    }
                  }
                }
              });

              response.on('end', () => {
                console.info('Proxy stream ended for session', sessionId);
                if (captureSessions.has(sessionId)) {
                  ws.send(
                    JSON.stringify({ type: 'exit', code: 'stream_ended' })
                  );
                  captureSessions.delete(sessionId);
                }
              });

              response.on('error', error => {
                console.error(
                  'Proxy stream error for session',
                  sessionId,
                  ':',
                  error
                );
                if (captureSessions.has(sessionId)) {
                  ws.send(
                    JSON.stringify({
                      type: 'error',
                      error: 'Proxy connection error: ' + error.message
                    })
                  );
                  captureSessions.delete(sessionId);
                }
              });
            });

            // Handle request errors
            req.on('error', error => {
              console.error('Request error for session', sessionId, ':', error);
              if (captureSessions.has(sessionId)) {
                ws.send(
                  JSON.stringify({
                    type: 'error',
                    error: 'Connection failed: ' + error.message
                  })
                );
                captureSessions.delete(sessionId);
              }
            });

            req.on('close', () => {
              console.info('HTTP request closed for session', sessionId);
            });

            req.on('finish', () => {
              console.info('HTTP request finished for session', sessionId);
            });

            // Handle abort signal
            abortController.signal.addEventListener('abort', () => {
              console.info('Aborting request for session', sessionId);
              req.destroy();
            });

            console.info('Sending HTTP request to proxy...');
            console.info('Request options:', {
              hostname: options.hostname,
              port: options.port,
              path: options.path,
              method: options.method,
              protocol: proxyUrl.protocol
            });
            // Send the request data and end to properly initiate the POST request
            req.write(postData);
            req.end();
            console.info('HTTP request sent and initiated for SSE streaming');
          } catch (error) {
            console.error('Error connecting to proxy:', error);
            ws.send(
              JSON.stringify({
                type: 'error',
                error: 'Failed to connect to ADB proxy: ' + error.message
              })
            );
            captureSessions.delete(sessionId);
          }
        } else if (data.type === 'stopCapture') {
          console.info('Stopping utterance capture for session', sessionId);
          const session = captureSessions.get(sessionId);
          if (session && session.abortController) {
            session.abortController.abort();
            captureSessions.delete(sessionId);
            ws.send(
              JSON.stringify({
                type: 'stopped',
                message: 'Stopped capturing utterances'
              })
            );
          }
        } else {
          console.warn('Unknown message type', data.type);
        }
      } catch (error) {
        console.error('WebSocket message error', error);
        ws.send(JSON.stringify({ type: 'error', error: error.message }));
      }
    });

    ws.on('close', () => {
      console.info(`WebSocket connection closed for session ${sessionId}`);

      // Clean up session if it exists
      const session = captureSessions.get(sessionId);
      if (session) {
        console.info('Cleaning up session on close');

        if (session.abortController) {
          session.abortController.abort();
        }
        captureSessions.delete(sessionId);
      }
    });

    ws.on('error', error => {
      console.error('WebSocket error:', error);
    });
  });

  return wss;
};

module.exports = { setupWebSocketServer };
