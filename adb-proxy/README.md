# ADB Proxy - Portable Executable

This ADB proxy creates portable executables that don't require Node.js or ADB to be installed locally.

## For End Users

### Quick Start

1. **Download** the appropriate build for your platform from releases
2. **Extract** the archive to any folder
3. **Connect** your Android device with USB debugging enabled
4. **Double-click** the startup script:
   - **Windows**: `start.bat`
   - **macOS**: `start.command`
   - **Linux**: `start.sh`

The proxy will start on `http://localhost:3080`

## For Developers

### Building Executables

```bash
# Install dependencies
yarn install

# Build for specific platforms
yarn build-windows   # Creates dist/windows/
yarn build-linux     # Creates dist/linux/
yarn build-macos     # Creates dist/macos/

# Build for all platforms
yarn build-all
```

### How It Works

The build process uses [@yao-pkg/pkg](https://github.com/yao-pkg/pkg) (maintained fork) to create standalone executables:

1. **pkg** bundles the Node.js application into a single executable
2. **build-platforms.js** downloads platform-specific ADB binaries
3. **Everything** is packaged together with startup scripts

### Distribution

Each platform build creates a `dist/{platform}/` directory with:

```
📁 dist/windows/          📁 dist/macos/            📁 dist/linux/
├── 🟢 start.bat          ├── 🟢 start.command      ├── 🟢 start.sh
├── 🔧 adb.exe            ├── 🔧 adb                ├── 🔧 adb
├── ⚙️ adb-proxy.exe      ├── ⚙️ adb-proxy          ├── ⚙️ adb-proxy
├── 📄 adbwinapi.dll      ├── 📄 README.txt         ├── 📄 README.txt
├── 📄 adbwinusbapi.dll   └── 📚 USER-GUIDE.md      └── 📚 USER-GUIDE.md
├── 📄 README.txt
└── 📚 USER-GUIDE.md
```

### File Sizes

- **Windows**: ~52MB
- **macOS**: ~75MB
- **Linux**: ~63MB

## Development

### Project Structure

```
adb-proxy/
├── adb-proxy.js           # Main server application
├── capture-utterances.js  # TalkBack capture logic
├── build-platforms.js     # Build system for all platforms
├── package.json           # Dependencies and build scripts
└── dist/                  # Built executables (generated)
    ├── windows/
    ├── linux/
    └── macos/
```
