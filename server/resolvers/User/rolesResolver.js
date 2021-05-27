const rolesResolver = user => {
    const roles = [];

    if (user.roles.includes('admin')) {
        roles.push('ADMIN');
    }
    if (user.roles.includes('tester') || user.roles.includes('admin')) {
        roles.push('TESTER'); // Admins are always testers
    }

    return roles;
};

module.exports = rolesResolver;
