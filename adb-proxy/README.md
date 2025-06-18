# adb-proxy

Lightweight local proxy to be packaged and used for working with adb commands.

## Prerequisites

1. [ADB Tools](https://developer.android.com/tools/releases/platform-tools) are locally available.
2. Ensure Android device has USB Debugging enabled.

## How to use

```sh
cd adb-proxy
yarn install
yarn start
```

Local proxy should now be running on http://localhost:3080.

To confirm it works:

First, connect your Android device to the computer (and allow any relevant permissions related to debugging)

1. Run the following to display the id(s) of the currently connected Android device(s):

```sh
curl -X POST http://localhost:3080/run-adb \
     -H "Content-Type: application/json" \
     -d '{ "command": "devices" }'
```

2. Observe that the connected device(s) is returned in the result.

OR

1. Navigate to the Test Queue, inspect the page and remove the `display: none` style from the last `<div>` in the `<main>`.
1. That should reveal a 'List Devices' button. Pressing that button displays the device id(s) of the Android device(s) currently connected to the computer.

TODO:

1. Whitelist the remaining adb commands currently used in the `aria-at-talkback-capture` scripts
1. Rework the current server's `api/scripts` endpoints and the capture utterances web socket implementation to be usable by this proxy
1. Package this proxy as a portable executable so testers won't have to install node (or adb) locally
1. If the above cannot be easily done for adb, provide an easy way to pull and add ADB to a tester's PATH depending on platform, and easily remove afterwards
1. Tests(?)
