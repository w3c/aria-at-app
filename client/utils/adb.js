const LOCAL_PROXY_PORT = 3080;

export async function runAdbCommand(command) {
  try {
    const res = await fetch(`http://localhost:${LOCAL_PROXY_PORT}/run-adb`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ command })
    });

    const data = await res.json();
    return data.output || data.error;
  } catch (err) {
    return 'Could not connect to local ADB proxy. Is it running?';
  }
}
