const { getTestPlanById } = require('../models/services/TestPlanService');

/**
 * Peeks at the requested TestPlan fields to determine which version type has
 * been requested, allowing for this resolver to request all the data needed.
 * @param {GraphQLResolverInfo} info
 * @returns {object}
 * @example { versionType: "queueRelevantVersions" }
 * @example { versionType: "gitSha", gitSha: "ea123" }
 */
// const getVersionType = info => {
//     const versionType = info.fieldNodes[0].selectionSet.selections.find(
//         each => each.name.value !== 'id'
//     ).name.value;
//     const response = { versionType };
//     // TODO: Support the Git SHA as well
//     // if (versionType === 'atGitSha') response.gitSha = x
//     return response;
// };

// const getLatestVersion = async () => {
//     const latest = await TestPlanVersion.get({ sort: 'createdAt', limit: 1 })
//     return latest[0].createdAt
// };

// const testPlans = async (_, __, ___, info) => {
//     const versionType = getVersionType(info);
//     if (versionType !== 'latestVersion') throw new Error('Not implemented');

//     const latestCreatedAt = await getLatestVersion();

//     const versions = getTestPlanVersions({
//         where: { createdAt: latestCreatedAt }
//     });

//     return versions.map(version => {
//         return {
//             id: version.directoryName,
//             latestVersion: version
//         };
//     });
// };

const testPlans = async () => {
    const testPlan = await getTestPlanById(1);
    return [{ latestVersion: testPlan }];
};

module.exports = testPlans;
