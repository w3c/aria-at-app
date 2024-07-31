const AtLoader = require('../models/loaders/AtLoader');
const { AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS } = require('./constants');

let atIdToNameCache = {};

const isSupportedByAutomation = async function (
  atId,
  versionName,
  { transaction }
) {
  if (Object.keys(atIdToNameCache).length === 0) {
    const ats = await AtLoader().getAll({ transaction });
    for (const at of ats) {
      atIdToNameCache[at.id] = at.name;
    }
  }
  const atName = atIdToNameCache[atId];
  if (!atName) {
    console.warn(
      `Attempt to check if ${versionName} is supported by automation for unknown AT ${atId}`
    );
    return false;
  }
  const supportedVersions =
    AT_VERSIONS_SUPPORTED_BY_COLLECTION_JOBS[atName] || [];
  const isSupported = supportedVersions.includes(versionName);
  return isSupported;
};

module.exports = { isSupportedByAutomation };
