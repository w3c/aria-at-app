const getGraphQLContext = ({ req }) => {
    const user = req.session && req.session.user ? req.session.user : null;

    const roles = [];

    if (user.roles.includes('admin')) {
        roles.push('ADMIN');
    }
    if (user.roles.includes('tester') || user.roles.includes('admin')) {
        roles.push('TESTER'); // Admins are always testers
    }

    return { user: { ...user, roles } };
};

module.exports = getGraphQLContext;
