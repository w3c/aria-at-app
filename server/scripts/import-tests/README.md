# ARIA-AT Import Scripts Documentation

This directory contains scripts that handle the import of test plans and test data from the [W3C ARIA-AT repository](https://github.com/w3c/aria-at) into this application's database.

## Overview

The import process synchronizes test data from the external `w3c/aria-at` repository with the local database, creating `TestPlan` records, `TestPlanVersion` records, `Test` records, `Assertion` records and updating `At` records. The system supports both V1 and V2 test formats from the ARIA-AT repository.

## Architecture

### Main Entry Point

**`index.js`** - The primary entry point for the import script. It:

- Parses command-line arguments to db-import-tests (`-c` for specifying a commit). Usage can be viewed at [docs/database.md](../../../docs/database.md)
- Orchestrates the cloning and import process
- Handles cleanup of temporary files

### Core Components

#### 1. Git Operations (`gitOperations.js`)

Handles all interactions with the `w3c/aria-at` Git repository:

- **`cloneRepo(gitCloneDirectory)`** - Clones the ARIA-AT repository to a temporary directory
- **`readCommit(directoryPath, commit)`** - Checks out a specific commit and retrieves git metadata (SHA, message, commit date)
- **`readDirectoryGitInfo(directoryPath)`** - Reads git information for a specific directory to determine when test patterns were last modified

**Repository Details:**

- Repository URL: `https://github.com/w3c/aria-at.git`
- Default branch: `master`

#### 2. Test Plan Version Operations (`testPlanVersionOperations.js`)

The core logic for processing and importing test data:

**Main Functions:**

- **`buildTestsAndCreateTestPlanVersions(commit, options)`** - Main orchestration function that:

  - Checks out the specified commit (or default branch)
  - Runs `npm install` and `npm run build` in the cloned `w3c/aria-at` repository
  - Imports harness files and updates JSON resources
  - Recursively processes test directories
  - Creates test plan versions in the database
  - Handles cleanup operations

- **`processTestPlanVersion(options)`** - Processes a single test directory:

  - Reads CSV metadata (`references.csv`, `assertions.csv`)
  - Parses test files from the built directory
  - Creates or updates `TestPlan` records
  - Creates `TestPlanVersion` records with associated tests
  - Deprecates older test plan versions
  - Creates assertion records

- **`importHarness()`** - Copies harness files from the ARIA-AT repository to the client and server resources directories

- **`updateJsons()`** - Processes and updates command and support JSON files:

  - Extracts commands from `keys.mjs` ([V1 Test Format](https://github.com/w3c/aria-at/wiki/Test-Format-V1-Definition)) → `commandsV1.json`
  - Extracts commands from `commands.json` ([V2 Test Format](https://github.com/w3c/aria-at/wiki/Test-Format-Definition-V2)) → `commandsV2.json`
  - Extracts support data from [`aria-at/tests/support.json`](https://github.com/w3c/aria-at/blob/master/tests/support.json)

- **`updateAtsJson({ ats, supportAts })`** - Merges database AT records with support.json data and writes to `ats.json`

**Key Features:**

- **Pre-built Zip Support**: Some commits are stored as pre-built zip files in `./zips/` to avoid rebuilding. These are extracted to temporary directories during import. The process for creating those zips is described in [docs/local-development](../../../docs/local-development.md#adding-new-test-data-from-aria-at-repository)
- **Recursive Directory Processing**: Automatically discovers test directories by looking for `references.csv` files
- **Version String Generation**: Creates version strings in format `VYY.MM.DD` or `VYY.MM.DD-N` for duplicates
- **Deprecation Logic**: Automatically deprecates older test plan versions when new ones are imported
- **Hash-based Deduplication**: Uses test content hashing to avoid importing duplicate test plan versions

#### 3. Test Parser (`testParser.js`)

Parses test data from built `.collected.json` files and creates test objects:

**Format Support:**

- **[V1 Test Format](https://github.com/w3c/aria-at/wiki/Test-Format-V1-Definition)**: Legacy format where tests are grouped by test ID across all ATs
- **[V2 Test Format](https://github.com/w3c/aria-at/wiki/Test-Format-Definition-V2)**: Current format where each AT has its own test instance

**Key Functions:**

- **`parseTests(options)`** - Main parsing function that:
  - Collects all `.collected.json` files from the built directory
  - Validates data consistency across collected files
  - Creates test objects using format-specific strategies
  - Generates test IDs, scenario IDs, and assertion IDs

**Test Object Structure:**

- Test ID (generated from test plan version ID and raw test ID)
- Title and metadata
- AT associations
- Renderable content (test instructions, commands, assertions)
- Rendered URLs (for test execution)
- Scenarios (command sequences)
- Assertions (with priorities, statements, phrases, exceptions)

#### 4. Settings (`settings.js`)

Configuration constants:

- `gitCloneDirectory` - Temporary directory for cloning the repository
- `builtTestsDirectory` - Path to built tests in the cloned repo
- `testsDirectory` - Path to source tests in the cloned repo
- `PRE_BUILT_ZIP_COMMITS` - List of commits available as pre-built zips

#### 5. Types (`types.js`)

JSDoc definitions for:

- References
- AT Settings
- Assertions
- Commands
- Renderable Content
- And other data structures used throughout the import process

#### 6. Utils (`utils.js`)

Utility functions:

- **`getAppUrl(directoryRelativePath, { gitSha, directoryPath })`** - Generates application URLs for test pages that proxy to the ARIA-AT repository

## Import Process Flow

1. **Initialization**

   - Parse command-line arguments
   - Start database transaction to ensure atomicity

2. **Repository Setup**

   - Clone `w3c/aria-at` repository to temporary directory
   - Check out specified commit (or default branch)
   - Retrieve git metadata (SHA, message, date)

3. **Build Process** (unless using pre-built zip)

   - Run `npm install` in cloned repository
   - Run `npm run build` to generate test files
   - Import harness files to client/server resources
   - Update JSON files (commands, support, ATs)

4. **Test Discovery**

   - Recursively scan test directories
   - Identify test directories by presence of `references.csv`
   - Determine test format version (V1 or V2) by checking for `assertions.csv`

5. **Test Processing** (for each test directory)

   - Read metadata from CSV files
   - Parse `.collected.json` files from built directory
   - Generate test objects with proper IDs
   - Check for duplicate test plan versions (via hash)
   - Create or update `TestPlan` record
   - Deprecate older test plan versions
   - Create `TestPlanVersion` record
   - Create `Test` records (embedded in TestPlanVersion)
   - Create `Assertion` records

6. **Cleanup**
   - Run `npm run cleanup` in repository (if needed)
   - Remove temporary directories
   - Commit database transaction

## Usage

### Basic Usage

Import tests from the latest commit on the default branch:

```bash
yarn db-import-tests:dev
```

### Import Specific Commit

Import tests from a specific git commit:

```bash
yarn db-import-tests:dev -c <commit-sha>
```

### Import Multiple Commits

Import tests from multiple commits in sequence:

```bash
yarn db-import-tests:dev -c "commit1 commit2 commit3"
```

## Test Format Versions

### [V1 Test Format](https://github.com/w3c/aria-at/wiki/Test-Format-V1-Definition) (Legacy)

- Tests are grouped by test ID across all assistive technologies
- Uses `keys.mjs` for command definitions
- Single test object contains all AT variations

### [V2 Test Format](https://github.com/w3c/aria-at/wiki/Test-Format-Definition-V2) (Current)

- Each assistive technology has its own test instance
- Uses `commands.json` for command definitions
- Assertions include structured data:
  - `assertionStatement` - Full assertion text
  - `assertionPhrase` - Tokenized phrase per AT
  - `assertionExceptions` - Command-specific exceptions
- Supports tokenized assertions per AT
- Supports command-specific settings

## Database Schema Integration

The import process creates/updates the following database entities:

- **`TestPlan`** - Represents a test pattern (e.g., "alert", "button")
- **`TestPlanVersion`** - A version of a test plan at a specific commit
- **`Test`** - Individual test cases (embedded in TestPlanVersion JSON)
- **`Assertion`** - Assertion records linked to tests
- **`At`** - Assistive technology records (read from database, merged with support.json)

## Resource Synchronization

The import process synchronizes the following resources:

- **Harness files** - Copied from `resources/` to `client/resources/`
- **Commands** - Extracted and written to `server/resources/commandsV1.json` and `server/resources/commandsV2.json`
- **Support data** - Written to `server/resources/support.json` and `server/resources/ats.json`
