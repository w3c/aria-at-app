const userRoles = parent => {
    const roles = [];

    if (parent.roles.includes('admin')) {
        roles.push('ADMIN');
    }
    if (parent.roles.includes('tester') || parent.roles.includes('admin')) {
        roles.push('TESTER'); // Admins are always testers
    }

    return roles;
};

module.exports = userRoles;
