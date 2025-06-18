import React, { useState } from 'react';
import { runAdbCommand } from '../../../utils/adb';

const ADB = () => {
  const [result, setResult] = useState('');

  const handleClick = async () => {
    const output = await runAdbCommand('devices');
    setResult(output);
  };

  return (
    // Hidden by default; use Browser's Inspect to unhide when adb-proxy is running
    <div style={{ display: 'none' }}>
      <button onClick={handleClick}>List Devices</button>
      <pre>{result}</pre>
    </div>
  );
};

export default ADB;
