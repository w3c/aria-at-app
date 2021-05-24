const testCountResolver = parent => {
    return parent.parsed.tests.length;
};

module.exports = testCountResolver;
