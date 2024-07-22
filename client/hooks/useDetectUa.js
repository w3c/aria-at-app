import { useState, useEffect } from 'react';
import uaParser from 'ua-parser-js';

export function useDetectUa() {
  const [uaBrowser, setUaBrowser] = useState();
  const [uaMajor, setUaMajor] = useState();
  const [uaMinor, setUaMinor] = useState();
  const [uaPatch, setUaPatch] = useState();

  useEffect(() => {
    // Detect UA information
    const ua = uaParser();
    const uaBrowser = ua?.browser?.name || 'Unknown';
    const uaMajor = ua?.browser?.major || '0';
    const uaMinor = ua?.browser?.version?.split('.')?.[1] || '0';
    const uaPatch = ua?.browser?.version?.split('.')?.[2] || '0';

    setUaBrowser(uaBrowser);
    setUaMajor(uaMajor);
    setUaMinor(uaMinor);
    setUaPatch(uaPatch);
  });

  return { uaBrowser, uaMajor, uaMinor, uaPatch };
}
