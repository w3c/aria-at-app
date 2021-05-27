const conflictsResolver = require('./conflictsResolver');

const conflictCountResolver = (...resolverArgs) => {
    const conflicts = conflictsResolver(...resolverArgs);
    return conflicts.length;
};

module.exports = conflictCountResolver;
