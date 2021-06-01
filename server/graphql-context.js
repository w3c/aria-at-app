const User = require('./models/User');

const getGraphQLContext = ({ req }) => {
    const user = req.session && req.session.user ? req.session.user : null;

    if (
        user &&
        user.roles.includes(User.ADMIN) &&
        !user.roles.includes(User.TESTER)
    ) {
        user.roles.push(User.TESTER); // Admins are always testers
    }

    return { user };
};

module.exports = getGraphQLContext;
