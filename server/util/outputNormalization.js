const { NO_OUTPUT_STRING } = require('./constants');

const NORMALIZE_PUNCTUATION = true;
const NORMALIZE_CAPITALIZATION = true;
const REMOVE_JAWS_SEPARATOR_TOKENS = true;

/**
 * Normalizes screen reader output by removing JAWS separator tokens, converting
 * to lowercase, normalizing whitespace, and standardizing hyphen spacing.
 * Returns the original value unchanged if it is null, undefined, or equals
 * NO_OUTPUT_STRING.
 *
 * @param {string|null|undefined} output - The screen reader output to normalize
 * @returns {string|null|undefined} The normalized output string, or the original
 *   value if it was null, undefined, or NO_OUTPUT_STRING
 */
const normalizeScreenreaderOutput = output => {
  if (!output || output === NO_OUTPUT_STRING) return output;

  let normalized = output;

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

  normalized = normalized.replace(/\s+/g, ' ').trim();

  return normalized;
};

/**
 * Compares two screen reader outputs for equality after normalization.
 * Both outputs are normalized using normalizeScreenreaderOutput before comparison.
 *
 * @param {string|null|undefined} output1 - First screen reader output to compare
 * @param {string|null|undefined} output2 - Second screen reader output to compare
 * @returns {boolean} True if both outputs normalize to the same value, false otherwise
 */
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
