class AuthorizationError extends Error {
    constructor(params) {
        super(...params);
    }
}

class ForbiddenError extends Error {
    constructor(...params) {
        super(...params);
    }
}

module.exports = {
    AuthorizationError,
    ForbiddenError,
};
