const atsResolver = require('./atsResolver');
const rolesResolver = require('./rolesResolver');

const User = {
    ats: atsResolver,
    roles: rolesResolver
};

module.exports = User;
