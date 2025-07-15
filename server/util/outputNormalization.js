const { NO_OUTPUT_STRING } = require('./constants');

const NORMALIZE_PUNCTUATION_CAPITALIZATION = true;
const REMOVE_JAWS_SEPARATOR_TOKENS = true;

const normalizeScreenreaderOutput = output => {
  if (!output || output === NO_OUTPUT_STRING) return output;

  let normalized = output.replace(/\s+/g, ' ').trim();

  if (NORMALIZE_PUNCTUATION_CAPITALIZATION) {
    normalized = normalized
      .replace(/\s*-\s*/g, '-')
      .replace(/[^\w\s-]/g, '')
      .replace(/\b[A-Z](?=[a-z])/g, match => match.toLowerCase())
      .replace(/\s+/g, ' ')
      .trim();
  }

  if (REMOVE_JAWS_SEPARATOR_TOKENS) {
    normalized = normalized.replace(/[\u001d\u001e]/g, '');
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
