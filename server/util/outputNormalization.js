const { NO_OUTPUT_STRING } = require('./constants');

const normalizeScreenreaderOutput = output => {
  if (!output || output === NO_OUTPUT_STRING) return output;

  return output.replace(/\s+/g, ' ').trim();
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
