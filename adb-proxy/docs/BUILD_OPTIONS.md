# ADB Proxy Build Options

## Build Scripts

The adb-proxy supports two build configurations:

### Standard Build (localtunnel only)

```bash
# Build for all platforms without ngrok
yarn build-all

# Or build for specific platforms
yarn build-windows
yarn build-linux
yarn build-macos
```

### Build with ngrok included

```bash
# Build for all platforms with ngrok
yarn build-all:ngrok

# Or build for specific platforms with ngrok
yarn build-windows:ngrok
yarn build-linux:ngrok
yarn build-macos:ngrok
```

## Environment Variables

### INCLUDE_NGROK

- **Default**: `false` (ngrok not included)
- **Set to**: `true` to include ngrok binaries in the build
- **Usage**: `INCLUDE_NGROK=true yarn build-all`

## ADB Startup Optimization

The adb-proxy now includes ADB server initialization to improve startup time, especially on Windows:

1. **Kills existing ADB server** - This helps resolve conflicts and stale connections
2. **Starts fresh ADB server** - Ensures clean state for new connections
3. **Runs automatically** - Happens when the proxy starts up

This addresses the common issue where ADB commands take a long time to respond on Windows due to server state issues.

## Tunnel Types

### localtunnel (Default)

- **Always included** in builds
- **No external dependencies** required
- **Automatic fallback** if ngrok is not available

### ngrok (Optional)

- **Only included** when `INCLUDE_NGROK=true`
- **Requires ngrok binary** to be bundled
- **Alternative tunnel service** with different features

## File Sizes

- **Standard build**: ~50-80MB (depending on platform)
- **With ngrok**: ~80-120MB (depending on platform)

The ngrok binary adds approximately 30-40MB to the build size.

## Usage Examples

```bash
# Build lightweight version (localtunnel only)
yarn build-all

# Build full version with ngrok support
yarn build-all:ngrok

# Build specific platform with ngrok
INCLUDE_NGROK=true yarn build-windows
```
