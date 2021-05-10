const assertModelNames = (db, names) => {
    names.forEach(name => {
        if (!db[name]) {
            throw new Error(
                `Could not find expected model with name "${name}".`
            );
        }
    });

    Object.keys(db.sequelize.models).forEach(modelName => {
        if (!names.includes(modelName)) {
            throw new Error(
                `Found unexpected model with name "${name}", please add ` +
                    `tests for this model.`
            );
        }
    });
};

const checkForRelationship = (model, referenceName) => {
    let foundReference = false;
    Object.entries(model.rawAttributes).find(attribute => {
        if (
            attribute.references &&
            attribute.references.model === referenceName
        ) {
            foundReference = attribute.references;
        }
    });
    return foundReference;
};

const assertModelRelationships = (db, modelRelationships) => {
    Object.entries(modelRelationships).forEach(([modelName, relationships]) => {
        const model = db[modelName];

        relationships.forEach(relationship => {
            const { belongsTo, hasOne, hasMany, as, through } = relationship;

            if (belongsTo) {
                const relation = checkForRelationship(model, belongsTo);
                if (!relation) {
                    throw new Error(
                        `Model ${modelName} missing belongsTo relationship ` +
                            `with model ${belongsTo}.`
                    );
                }
            } else if (hasOne) {
                const ownerModel = db[hasOne];
                const relation = checkForRelationship(ownerModel, modelName);
                if (!relation) {
                    throw new Error(
                        `Model ${modelName} missing hasOne relationship ` +
                            `with model ${hasOne}.`
                    );
                }
            }
        });
    });

    throw new Error('not implemented');
};
const assertModelProperties = () => {};

module.exports = {
    assertModelNames,
    assertModelRelationships,
    assertModelProperties
};
