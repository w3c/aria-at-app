const { getAts } = require('../services/AtService');

const AtLoader = () => {
    let ats;
    let activePromise;

    return {
        getAll: async ({ transaction }) => {
            if (ats) {
                return ats;
            }

            if (activePromise) {
                return activePromise;
            }

            activePromise = getAts({ transaction }).then(ats => {
                // Sort date of atVersions subarray in desc order by releasedAt date
                ats.sort((a, b) => a.name.localeCompare(b.name)).forEach(item =>
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
        }
    };
};

module.exports = AtLoader;
