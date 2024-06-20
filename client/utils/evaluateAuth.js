/**
 * Takes the GraphQL `me` object to form a simplified auth object
 * @param {object} data
 *        auth object returned from GraphQL for currently logged in user.
 * @param {number|string} data.id
 *        currently logged in user's identifier (ID in GraphQL can be number or
 *        string)
 * @param {string} data.username - currently logged in user's username
 * @param {string[]} data.roles - currently logged in user's assigned roles
 * @returns {Auth} - evaluated auth object
 */
export const evaluateAuth = user => {
    if (!user) user = {};

    let roles = user.roles ?? [];

    return {
        // calculated booleans
        isAdmin: roles.includes('ADMIN'),
        isTester: roles.includes('TESTER'),
        isVendor: roles.includes('VENDOR'),
        isSignedIn: !!user.username,

        // user object values
        id: user.id ?? null,
        username: user.username ?? null,
        roles
    };
};

/**
 * @typedef {object} Auth
 * @property {boolean} isAdmin - indicates if user is an admin
 * @property {boolean} isTester - indicates if user is a tester
 * @property {boolean} isSignedIn - indicates if user is signed in
 * @property {number|string} id - user's id
 * @property {string} username - user's username
 * @property {string[]} roles - user's list of roles
 */
