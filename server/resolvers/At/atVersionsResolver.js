const atVersionsResolver = parent => {
    return parent.atVersions.map(each => each.atVersion);
};

module.exports = atVersionsResolver;
