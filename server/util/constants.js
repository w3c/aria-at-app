// Mirror of constant in /client/components/TestRenderer/OutputTextArea/constants.js
const NO_OUTPUT_STRING = 'No output was detected.';

const AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS = {
  // These should be tracked with the available version in the github workflow
  // TODO: Add link once feature branch for these changes is merged in aria-at-gh-actions-helper
  'VoiceOver for macOS': ['13.0', '14.0'],
  // These are tracked with the https://github.com/bocoup/aria-at-automation-nvda-builds/releases
  NVDA: ['2024.1', '2023.3.3', '2023.3']
};

module.exports = {
  NO_OUTPUT_STRING,
  AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS
};
