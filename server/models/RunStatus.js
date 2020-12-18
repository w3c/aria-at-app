const RunStatus = function(sequelize, DataTypes) {
    const model = sequelize.define(
        'RunStatus',
        {
            id: {
                type: DataTypes.INTEGER,
                allowNull: false,
                primaryKey: true,
                autoIncrement: true
            },
            name: {
                type: DataTypes.TEXT,
                allowNull: false
            }
        },
        {
            timestamps: false,
            tableName: 'run_status'
        }
    );

    // NB: The names in the db don't reflect the names we currently surface on
    // the FE. The names of the variables have been changed untill we get a
    // chance to make the correct refactoring.
    model.DRAFT = 'raw';
    model.IN_REVIEW = 'draft';
    model.FINAL = 'final';

    return model;
};

module.exports = RunStatus;
