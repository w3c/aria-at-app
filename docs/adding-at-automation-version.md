# Adding AT Automation Versions

This document describes the process for adding a new version of an AT to the ARIA-AT App. These instructions will be used for both NVDA and VoiceOver.

![Flowchart depicting the process outlined below](./assets/adding-at-version-to-automation-flowchart.png)

## NVDA

### Prerequisites

- Local system must be running Windows
- Install NVDA on your local system
- Download the NVDA AT Automation plugin from [Prime-Access-Consulting/nvda-at-automation](https://github.com/Prime-Access-Consulting/nvda-at-automation)

### Prepare the AT Automation Plugin

1. Navigate to the "NVDAPlugin" directory in the PAC nvda-at-automation repository
2. Create a ZIP archive containing all of the files inside the NVDAPlugin directory including:
   - globalPlugins directory
   - synthDrivers directory
   - manifest.ini file

> **Note:** Do not include the "NVDAPlugin" directory itself in the ZIP

3. Rename the ZIP file extension from .zip to .nvda-addon

### Install and Configure NVDA

1. Install the AT Automation plugin:
   - Open NVDA menu (NVDA+N or via System Tray)
   - Navigate to "Tools" -> "Add-on store..."
   - Click "Install from external source"
   - Select your .nvda-addon file
2. Configure NVDA Settings (NVDA+N -> Preferences -> Settings):
   - General: Disable "Automatically check for updates"
   - General: Disable "Notify for pending update on startup"
   - Speech: Set "Capture Speech" as the active synthesizer
   - Verify the AT Automation plugin is loaded and enabled

### Create Portable Copy

1. Open NVDA menu (NVDA+N or via System Tray)
2. Navigate to Tools -> Create portable copy
3. For the folder name, use the version number from NVDA's about screen (e.g., "2024.4.1")
4. Enable the "Copy current user configuration" checkbox
5. Create the portable copy

### Package for Distribution

1. Locate the portable NVDA folder you just created
2. Right-click the folder and use "Compress to ZIP file" option
3. Create a new release for [aria-at-automation-nvda-builds](https://github.com/bocoup/aria-at-automation-nvda-builds):
   1. Click "Create new release"
   2. For the tag and release title, use the NVDA version number
   3. Upload the ZIP file to the release

## VoiceOver

1. Add the newly available version to the `options` for `macos_version` in [aria-at-gh-actions-helper/.github/workflows/voiceover-test.yml](https://github.com/bocoup/aria-at-gh-actions-helper/blob/main/.github/workflows/voiceover-test.yml)
   1. Note that a separate workflow exists to support `macos_version=15` in [aria-at-gh-actions-helper/.github/workflows/self-hosted-macos-15.yml](https://github.com/bocoup/aria-at-gh-actions-helper/blob/main/.github/workflows/self-hosted-macos-15.yml)

## Update Aria-AT App

There are two ways to add a new automation-supported AT version to the ARIA-AT App.

Note that these steps are required for NVDA and JAWS. VoiceOver will automatically be marked as latest and automation-supported when the first bot run completes with the new version.

### Option A: Add a seeder\*\*

- Create a new seeder file in `server/seeders/` to mark the version as supported
- Go through the process of deploying the changes to the ARIA-AT App

### Option B: Use GraphQL Playground\*\*

1. Navigate to the GraphQL playground in your deployed environment
2. Use the `createAtVersion` mutation to add the new version
3. Use the `promoteAutomationSupportedVersion` mutation to mark the version as latest automation-supported

The new AT version is now fully configured and ready for use in ARIA-AT App.
