# ADB Proxy Tunnel Configuration

The ADB Proxy now supports two tunnel types for public access:

## Tunnel Types

### 1. localtunnel (Default)

- **Service**: Uses the localtunnel service (loca.lt)
- **Dependencies**: Built-in npm package
- **Advantages**:
  - No external binary required
  - Automatic installation with npm install
  - Comprehensive logging
  - Random subdomain generation
- **Usage**: Default behavior, no configuration needed

### 2. ngrok (Optional)

- **Service**: Uses ngrok service
- **Dependencies**: Requires ngrok binary (downloaded during build)
- **Advantages**:
  - More stable connection
  - Custom subdomain support (with ngrok account)
- **Usage**: Set `TUNNEL_TYPE=ngrok` environment variable

## Configuration

### Environment Variables

- `TUNNEL_TYPE`: Set to `localtunnel` (default) or `ngrok`

### Usage Examples

```bash
# Use localtunnel (default)
npm start
./start.sh

# Use ngrok
TUNNEL_TYPE=ngrok npm start
./start-ngrok.sh
```

## Logging

### localtunnel Logging

The localtunnel implementation includes comprehensive logging:

- **URL Assignment**: When the tunnel URL is assigned
- **Request Logging**: All incoming requests with method, path, headers, and timestamp
- **Error Logging**: Any tunnel errors
- **Connection Events**: Close and reconnect events

### ngrok Logging

The ngrok implementation logs:

- **Binary Location**: Where ngrok binary is found
- **Process Output**: All stdout and stderr from ngrok process
- **URL Detection**: When the public URL is detected

## Testing

Test localtunnel functionality:

```bash
npm run test:localtunnel
```

This will create a test tunnel and log all events for 5 seconds.

## Build Process

The build process now:

1. **Downloads ngrok optionally**: If ngrok download fails, the build continues with localtunnel only
2. **Creates multiple startup scripts**:
   - `start.sh` (or `.bat`/`.command`): Uses localtunnel by default
   - `start-ngrok.sh` (or `.bat`/`.command`): Uses ngrok tunnel
3. **Includes both tunnel types**: The built package supports both tunnel types

## API Endpoints

The `/tunnel-url` endpoint now returns:

```json
{
  "url": "https://your-tunnel-url.loca.lt",
  "type": "localtunnel"
}
```

Or for ngrok:

```json
{
  "url": "https://your-tunnel-url.ngrok-free.app",
  "type": "ngrok"
}
```

## Troubleshooting

### localtunnel Issues

- **Connection fails**: Check internet connectivity
- **URL not assigned**: Wait a few seconds, localtunnel may take time to assign URL
- **Service unavailable**: localtunnel service may be temporarily down

### ngrok Issues

- **Binary not found**: ngrok binary wasn't downloaded during build
- **Authentication required**: ngrok may require authentication for custom subdomains
- **Rate limiting**: ngrok has rate limits on free accounts

### General Issues

- **No tunnel established**: Check if the tunnel service is accessible
- **Port conflicts**: Ensure port 3080 is available
- **Firewall issues**: Check if your firewall blocks the tunnel connections
