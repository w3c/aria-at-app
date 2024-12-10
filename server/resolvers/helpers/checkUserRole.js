const ROLES = {
  TESTER: 'TESTER',
  ADMIN: 'ADMIN',
  VENDOR: 'VENDOR'
};

const isTester = (roles = []) => roles.find(role => role.name === ROLES.TESTER);
const isVendor = (roles = []) => roles.find(role => role.name === ROLES.VENDOR);
const isAdmin = (roles = []) => roles.find(role => role.name === ROLES.ADMIN);

module.exports = {
  isTester,
  isVendor,
  isAdmin
};
