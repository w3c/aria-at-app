const {
    Users,
    UserToRole,
    Role,
    TesterToRun
} = require('../models/UsersModel');
const GithubService = require('./GithubService');
const sequelize = global.sequelize;

async function getUser({ fullname, username, email }) {
    try {
        const users = await Users.findAll({
            where: {
                fullname,
                username,
                email
            }
        });
        if (users.length === 1) {
            return users[0].dataValues;
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
                   name as at_name
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
                    at_name: result.at_name
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

module.exports = {
    getUser,
    addUser,
    addUserToRole,
    assignUsersToRun,
    removeUsersFromRun,
    getAllTesters,
    signupUser
};
