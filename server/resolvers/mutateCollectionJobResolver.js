const mutateCollectionJobResolver = (_, { id }) => {
    return { parentContext: { id } };
};

module.exports = mutateCollectionJobResolver;
