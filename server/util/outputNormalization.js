const { NO_OUTPUT_STRING } = require('./constants');

const NORMALIZE_PUNCTUATION = true;
const NORMALIZE_CAPITALIZATION = true;
const REMOVE_JAWS_SEPARATOR_TOKENS = true;

const normalizeScreenreaderOutput = output => {
  if (!output || output === NO_OUTPUT_STRING) return output;

  let normalized = output.replace(/\s+/g, ' ').trim();

  if (REMOVE_JAWS_SEPARATOR_TOKENS) {
    // eslint-disable-next-line no-control-regex
    normalized = normalized.replace(/[\u001d\u001e]/g, ' ');
  }

  if (NORMALIZE_CAPITALIZATION) {
    normalized = normalized.toLowerCase();
  }

  if (NORMALIZE_PUNCTUATION) {
    normalized = normalized.replace(/\s*-\s*/g, '-').trim();
  }

  return normalized;
};

const outputsMatch = (output1, output2) => {
  return (
    normalizeScreenreaderOutput(output1) ===
    normalizeScreenreaderOutput(output2)
  );
};

module.exports = {
  normalizeScreenreaderOutput,
  outputsMatch
};
