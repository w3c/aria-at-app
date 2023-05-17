const { getAts } = require('../services/AtService');

const AtLoader = () => {
    let ats;
    let activePromise;

    return {
        getAll: async () => {
            if (ats) {
                return ats;
            }

            if (activePromise) {
                return activePromise;
            }
            activePromise = getAts();

            ats = await activePromise;

            return ats;
        }
    };
};

module.exports = AtLoader;
