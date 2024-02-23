const { getAts } = require('../services/AtService');

let singletonInstance = null;

const AtLoader = () => {
    if (singletonInstance) {
        return singletonInstance;
    }

    let ats;
    let activePromise;

    singletonInstance = {
        getAll: async ({ t }) => {
            if (ats) {
                return ats;
            }

            if (activePromise) {
                return activePromise;
            }

            activePromise = getAts({ t });
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
        },
        clearCache: () => {
            ats = null;
            activePromise = null;
        }
    };

    return singletonInstance;
};

module.exports = AtLoader;
