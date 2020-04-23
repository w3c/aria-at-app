module.exports = {
    globals: {
        sequelize: {
            define: obj => obj,
            query: () => [[{ at_name_id: 1, at_name: 'Foo', active: true }]]
        }
    }
};
