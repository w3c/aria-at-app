const { getAts } = require('../services/AtService');

const AtLoader = () => {
    let ats;
    let activePromise;

    return {
        getAll: async ({ transaction } = {}) => {
            if (ats) {
                return ats;
            }

            if (activePromise) {
                return activePromise;
            }
            activePromise = getAts(
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                undefined,
                { transaction }
            );

            ats = await activePromise;

            // Sort date of atVersions subarray in desc order by releasedAt date
            ats.forEach(item =>
                item.atVersions.sort((a, b) => b.releasedAt - a.releasedAt)
            );

            ats = ats.map(at => ({
                ...at.dataValues,
                candidateBrowsers: at.browsers.filter(
                    browser => browser.AtBrowsers.isCandidate
                ),
                recommendedBrowsers: at.browsers.filter(
                    browser => browser.AtBrowsers.isRecommended
                )
            }));

            return ats;
        }
    };
};

module.exports = AtLoader;
