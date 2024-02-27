const { getAts } = require('../services/AtService');

let singletonInstance = null;

const AtLoader = () => {
    if (singletonInstance) {
        return singletonInstance;
    }

    let ats;
    let activePromise;

    singletonInstance = {
        getAll: async ({ transaction }) => {
            if (ats) {
                return ats;
            }

            if (activePromise) {
                return activePromise;
            }

            activePromise = getAts({ transaction }).then(ats => {
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
            });

            ats = await activePromise;

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
