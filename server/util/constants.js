// Mirror of constant in /client/components/TestRenderer/OutputTextArea/constants.js
const NO_OUTPUT_STRING = 'No output was detected.';

// Deprecated: AT versions supported by jobs now stored in DB on AtVersion
const AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS = {};

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
