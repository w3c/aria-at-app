/**
 * Takes the GraphQL `me` object to form a simplified auth object
 * @param {object} user
 *        auth object returned from GraphQL for currently logged in user.
 * @param {number|string} user.id
 *        currently logged in user's identifier (ID in GraphQL can be number or
 *        string)
 * @param {string} user.username - currently logged in user's username
 * @param {string[]} user.roles - currently logged in user's assigned roles
 * @param {object | null} user.company - currently logged in user's assigned company if any
 * @returns {Auth} - evaluated auth object
 */
export const evaluateAuth = user => {
  if (!user) user = {};

  let roles = user.roles ?? [];
  let company = user?.company ?? null;

  return {
    // calculated booleans
    isAdmin: roles.includes('ADMIN'),
    isTester: roles.includes('TESTER'),
    isVendor: roles.includes('VENDOR'),
    isSignedIn: !!user.username,

    // user object values
    id: user.id ?? null,
    username: user.username ?? null,
    roles,
    company
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
