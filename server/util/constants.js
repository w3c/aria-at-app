// Mirror of constant in /client/components/TestRenderer/OutputTextArea/constants.js
const NO_OUTPUT_STRING = 'No output was detected.';

const VENDOR_NAME_TO_AT_MAPPING = {
  vispero: {
    id: 1,
    ats: ['JAWS']
  },
  apple: {
    id: 4,
    ats: ['VoiceOver for macOS']
  },
  nvAccess: {
    id: 6,
    ats: ['NVDA']
  }
};

module.exports = {
  NO_OUTPUT_STRING,
  VENDOR_NAME_TO_AT_MAPPING
};
