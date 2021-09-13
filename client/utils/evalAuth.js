export const evalAuth = (data = {}) => {
    const roles = data.roles || [];

    return {
        // calculated booleans
        isAdmin: roles.includes('ADMIN') || false,
        isTester: roles.includes('TESTER') || false,
        isSignedIn: !!data.username,

        // user object values
        id: data.id || null,
        username: data.username || null,
        roles
    };
};
