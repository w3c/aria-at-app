// Mirror of constant in /client/components/TestRenderer/OutputTextArea/constants.js
const NO_OUTPUT_STRING = 'No output was detected.';

const AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS = {
  // These are tracked with the available versions in the github workflow file
  // https://github.com/bocoup/aria-at-gh-actions-helper/blob/main/.github/workflows/voiceover-test.yml#L39
  // Separate workflow exists for supporting macOS 15 on self-hosted runner
  // https://github.com/bocoup/aria-at-gh-actions-helper/blob/main/.github/workflows/self-hosted-macos-15.yml
  'VoiceOver for macOS': ['13.0', '14.0', '15.0'],
  // These are tracked with the https://github.com/bocoup/aria-at-automation-nvda-builds/releases
  NVDA: ['2024.4.1', '2024.1', '2023.3.3', '2023.3'],
  JAWS: ['2025.2506.168.400']
};

const VENDOR_NAME_TO_AT_MAPPING = {
  vispero: ['JAWS'],
  nvAccess: ['NVDA'],
  apple: ['VoiceOver for macOS']
};

module.exports = {
  NO_OUTPUT_STRING,
  AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS,
  VENDOR_NAME_TO_AT_MAPPING
};
