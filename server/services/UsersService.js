const {
    Users,
    UserToRole,
    Role,
    TesterToRun,
    UserToAt
} = require('../models/UsersModel');
const GithubService = require('./GithubService');
const sequelize = global.sequelize;

async function getUser(user) {
    const { fullname, username, email } = user;
    try {
        const users = await Users.findAll({
            attributes: ['id', 'fullname', 'username', 'email'],
            where: {
                fullname,
                username,
                email
            }
        });
        if (users.length === 1) {
            const rolesForUser = await users[0].getRoles();
            const roles = rolesForUser.map(r => r.dataValues.name);
            return {
                ...users[0].dataValues,
                roles
            };
        }
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
    return false;
}

async function addUser(user) {
    try {
        const newUser = await Users.create(user);
        return newUser;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function addUserToRole(userToRole) {
    try {
        const newUserToRole = await UserToRole.create(userToRole);
        return newUserToRole;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Saves new entries to the tester_to_run table.
 *
 * @param {object} data - data to save
 * @return {object} - a list of all tester_to_run records (user_id, run_id) for the provide run_id
 *
 * @example
 *
 *     assignUsersToRun({
 *       run_id: run_id
 *       users: [id1, id2]
 *     });
 */
async function assignUsersToRun(data) {
    try {
        for (let id of data.users) {
            await TesterToRun.create({
                user_id: id,
                run_id: data.run_id
            });
        }

        let currentUsersToRun = TesterToRun.findAll({
            where: {
                run_id: data.run_id
            }
        });

        return currentUsersToRun;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Deletes entries in the tester_to_run table.
 *
 * @param {object} data - data to save
 * @return {object} - a list of all tester_to_run records (user_id, run_id) for the provide run_id
 *
 * @example
 *
 *     removeUsersFromRun({
 *       run_id: run_id
 *       users: [id1, id2]
 *     });
 */
async function removeUsersFromRun(data) {
    try {
        for (let id of data.users) {
            await TesterToRun.destroy({
                where: {
                    user_id: id,
                    run_id: data.run_id
                }
            });
        }

        let currentUsersToRun = TesterToRun.findAll({
            where: {
                run_id: data.run_id
            }
        });

        return currentUsersToRun;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Gets all testers and their configured assistive technologies
 *
 * @param {object} data - data to save
 * @return {object} - a list of all tester_to_run records (user_id, run_id) for the provide run_id
 *
 * @example
 *
 *   Returns:
 *     [
 *       {
 *         id: users.id,
 *         fullname: users.fullname,
 *         username: users.username,
 *         email: users.email
 *         configured_ats: [
 *           {
 *             at_name_id: at_name.id
 *             at_name: at_name.name
 *           },
 *           ...
 *         ]
 *       },
 *       ....
 *     ]
 */
async function getAllTesters() {
    try {
        let currentUsers = (await Users.findAll()).map(
            userData => userData.dataValues
        );

        for (let user of currentUsers) {
            let results = (
                await sequelize.query(`
                 select
                   at_name_id,
                   name as at_name,
                   active
                 from
                   user_to_at,
                   at_name
                 where
                   user_to_at.at_name_id = at_name.id
                   and user_id=${user.id}
            `)
            )[0];

            user.configured_ats = [];
            for (let result of results) {
                user.configured_ats.push({
                    at_name_id: result.at_name_id,
                    at_name: result.at_name,
                    active: result.active
                });
            }
        }

        return currentUsers;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function saveUserAndRoles(options) {
    let saved = false;
    if (Object.keys(options).length === 0) return saved;
    const {
        user: { username, name, email },
        accessToken
    } = options;
    const teams = await GithubService.getUserTeams({
        accessToken,
        userLogin: username
    });

    if (teams.length > 0) {
        let userId;
        try {
            const newUser = await addUser({
                fullname: name,
                username,
                email
            });
            userId = newUser.id;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }

        let roleRows,
            rolesMap = {};
        try {
            roleRows = await Role.findAll();
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }

        roleRows.map(r => (rolesMap[r.dataValues.name] = { ...r.dataValues }));
        for (let team of teams) {
            try {
                const newUserToRole = await addUserToRole({
                    user_id: userId,
                    role_id: rolesMap[GithubService.teamToRole[team]].id
                });
                if (newUserToRole) saved = true;
            } catch (error) {
                console.error(`Error: ${error}`);
                throw error;
            }
        }
    }

    return saved;
}

async function signupUser(options) {
    const { name: fullname, username, email } = options.user;
    const user = await getUser({
        fullname,
        username,
        email
    });
    if (user) {
        return true;
    }
    return saveUserAndRoles(options);
}

async function getUserAts(options) {
    let user_id = options;
    if (typeof options !== 'number') {
        let user = await getUser(options);
        user_id = user.id;
    }
    try {
        let userAts = await UserToAt.findAll({ where: { user_id } });
        return userAts;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function saveUserAts(options) {
    const { user, ats } = options;
    let { id: user_id } = await getUser(user);
    const existingUserAtsIds = (await getUserAts(user_id)).map(
        userAt => userAt.dataValues.at_name_id
    );
    const userAtsInactive = existingUserAtsIds.filter(
        existingUserAtsId => !ats.find(at => at.id === existingUserAtsId)
    );
    const userAtsActiveCreate = ats.filter(
        at => existingUserAtsIds.indexOf(at.id) === -1
    );
    const userAtsActiveUpdate = ats.filter(at =>
        existingUserAtsIds.find(id => id === at.id)
    );
    let savedUserAts = [];

    // these rows already exist in the database
    for (let at_name_id of userAtsInactive) {
        try {
            let inactiveUserAt = await UserToAt.update(
                { active: false },
                { where: { at_name_id } }
            );
            if (inactiveUserAt.find(inactiveUserAt => inactiveUserAt === 1)) {
                savedUserAts.push({ at_name_id, user_id, active: false });
            }
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }

    // create these rows in the database
    try {
        let createdUserAt = await UserToAt.bulkCreate(
            userAtsActiveCreate.map(at_name_id => ({
                user_id,
                at_name_id,
                active: true
            }))
        );
        savedUserAts.push(
            ...createdUserAt.map(userToAt => userToAt.dataValues)
        );
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }

    // these rows also exist in the database
    for (let at of userAtsActiveUpdate) {
        try {
            let activeUserAt = await UserToAt.update(
                { active: true },
                { where: { at_name_id: at.id } }
            );
            if (activeUserAt.find(activeUserAt => activeUserAt === 1)) {
                savedUserAts.push({ at_name_id: at.id, user_id, active: true });
            }
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }
    return savedUserAts;
}

module.exports = {
    getUser,
    addUser,
    addUserToRole,
    assignUsersToRun,
    removeUsersFromRun,
    getAllTesters,
    signupUser,
    saveUserAts
};
