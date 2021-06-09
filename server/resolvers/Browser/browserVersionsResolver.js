const browserVersionsResolver = parent => {
    return parent.browserVersions.map(each => each.browserVersion);
};

module.exports = browserVersionsResolver;
