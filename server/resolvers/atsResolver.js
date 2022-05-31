const { getAts } = require('../models/services/AtService');

const atsResolver = async () => {
    const ats = await getAts(
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        {
            order: [['name', 'asc']]
        }
    );
    // Sort date of atVersions subarray in desc order by releasedAt date
    ats.forEach(item =>
        item.atVersions.sort((a, b) => b.releasedAt - a.releasedAt)
    );
    return ats;
};

module.exports = atsResolver;
