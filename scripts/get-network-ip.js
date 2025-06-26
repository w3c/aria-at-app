#!/usr/bin/env node

const os = require('os');

function getNetworkIPs() {
  const interfaces = os.networkInterfaces();
  const ips = [];

  for (const name in interfaces) {
    const networkInterface = interfaces[name];

    for (const net of networkInterface) {
      // Skip internal (localhost) and non-IPv4 addresses
      if (net.family === 'IPv4' && !net.internal) {
        ips.push({
          interface: name,
          ip: net.address,
          suggested: `REACT_APP_EXTERNAL_HOST=${net.address}:3000`
        });
      }
    }
  }

  return ips;
}

console.log('🔍 Network IP addresses found:');
console.log('');

const ips = getNetworkIPs();

if (ips.length === 0) {
  console.log(
    "❌ No network interfaces found. Make sure you're connected to WiFi or Ethernet."
  );
} else {
  ips.forEach((ip, index) => {
    console.log(`${index + 1}. Interface: ${ip.interface}`);
    console.log(`   IP: ${ip.ip}`);
    console.log(`   Config: ${ip.suggested}`);
    console.log('');
  });

  console.log('📝 To use one of these IPs:');
  console.log('1. Copy one of the "Config" lines above');
  console.log('2. Add it to config/dev.env (uncomment the line)');
  console.log('3. Restart the client dev server');
  console.log('');
  console.log('🔗 Your Android device will then access:');
  if (ips.length > 0) {
    console.log(`   http://${ips[0].ip}:3000/your-test-page`);
  }
}
