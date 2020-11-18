const db = require('../models/index');
const GithubService = require('./GithubService');

async function getUser(user) {
    const { fullname, username, email } = user;
    try {
        const users = await db.Users.findAll({
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
        const newUser = await db.Users.create(user);
        return newUser;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function addUserToRole(userToRole) {
    try {
        const newUserToRole = await db.UserToRole.create(userToRole);
        return newUserToRole;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function deleteUserFromRole(userToRole) {
    try {
        await db.UserToRole.destroy({
            where: userToRole
        });
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Saves new entries to the tester_to_run table.
 *
 * @param {array} users - a list of users
 * @param {array} runs - a list of runs
 * @return {object} - lists of all users for a run (not just the newly saved users) keyed by run.
 *
 * @example
 *
 *     assignUsersToRuns(
 *       [run_id1, run_id2]
 *       [id1, id2]
 *     );
 */
async function assignUsersToRuns(users, runs) {
    try {
        let entries = [];
        for (let id of users) {
            for (let run of runs) {
                entries.push({
                    user_id: id,
                    run_id: run
                });
            }
        }

        await db.TesterToRun.bulkCreate(entries);

        let currentUsersToRuns = await db.TesterToRun.findAll({
            where: {
                run_id: {
                    [db.Sequelize.Op.in]: runs
                }
            }
        });

        let usersByRun = {};
        for (let r of currentUsersToRuns) {
            let { run_id, user_id } = r.dataValues;
            if (run_id in usersByRun) {
                usersByRun[run_id].push(user_id);
            } else {
                usersByRun[run_id] = [user_id];
            }
        }

        return usersByRun;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

/**
 * Deletes entries in the tester_to_run table.
 *
 * @param {array} users - list of user ids
 * @param {int} runId - run id
 * @return {object} - a list of users still assigned to the run
 *
 * @example
 *
 *     removeUsersFromRun(
 *       [id1, id2]
 *       runId
 *     );
 */
async function removeUsersFromRun(users, runId) {
    try {
        for (let id of users) {
            await db.TesterToRun.destroy({
                where: {
                    user_id: id,
                    run_id: runId
                }
            });
        }

        let currentUsersToRun = db.TesterToRun.findAll({
            attributes: ['user_id'],
            where: {
                run_id: runId
            }
        });

        return currentUsersToRun.map(r => r.user_id);
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
 *           },
 *           ...
 *         ]
 *       },
 *       ....
 *     ]
 */
async function getAllTesters() {
    try {
        let currentUsers = (await db.Users.findAll()).map(
            userData => userData.dataValues
        );

        for (let user of currentUsers) {
            let ats = await db.UserToAt.findAll({
                where: { user_id: user.id, active: true },
                include: db.AtName
            });

            user.configured_ats = ats.map(r => ({
                at_name_id: r.dataValues.at_name_id
            }));
        }

        return currentUsers;
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }
}

async function saveUserAndRoles(options) {
    let saved = false,
        newUser;
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
            newUser = await addUser({
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
            roleRows = await db.Role.findAll();
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
    } else {
        throw Error(`User ${username} does not belong to any teams.`);
    }

    return newUser.dataValues;
}

async function getUserAndUpdateRoles(options) {
    const { user, accessToken } = options;

    let dbUser = await getUser(user);
    const teams = await GithubService.getUserTeams({
        accessToken,
        userLogin: user.username
    });
    const githubUserRoles = teams.map(t => GithubService.teamToRole[t]);

    const roleRows = await db.Role.findAll();
    const rolesMap = {};
    roleRows.map(r => (rolesMap[r.dataValues.name] = { ...r.dataValues }));

    let newRoleList = [];
    for (let role in rolesMap) {
        let userHasRole = dbUser.roles.includes(role);
        let userInTeam = githubUserRoles.includes(role);

        // User has role and is in the correct team
        if (userHasRole && userInTeam) {
            newRoleList.push(role);
            continue;
        }

        // User has the role but is not in the correct team
        if (userHasRole && !userInTeam) {
            await deleteUserFromRole({
                user_id: dbUser.id,
                role_id: rolesMap[role].id
            });
        }

        // User does not have the role but is in the correct team
        if (!userHasRole && userInTeam) {
            await addUserToRole({
                user_id: dbUser.id,
                role_id: rolesMap[role].id
            });
            newRoleList.push(role);
        }
    }

    dbUser.roles = newRoleList;
    return dbUser;
}

async function signupUser(options) {
    const { name: fullname, username, email } = options.user;
    const user = await getUser({
        fullname,
        username,
        email
    });
    if (user) {
        return user;
    }
    return saveUserAndRoles(options);
}

async function saveUserAts(options) {
    const { userId, ats } = options;

    const existingUserAtsIds = (
        await db.UserToAt.findAll({ where: { user_id: userId } })
    ).map(userAt => userAt.dataValues.at_name_id);
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
            await db.UserToAt.update(
                { active: false },
                { where: { at_name_id, user_id: userId } }
            );
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    }

    // create these rows in the database
    try {
        let createdUserAt = await db.UserToAt.bulkCreate(
            userAtsActiveCreate.map(({ id: at_name_id }) => ({
                user_id: userId,
                at_name_id,
                active: true
            }))
        );
        savedUserAts.push(
            ...createdUserAt.map(userToAt => ({
                at_name_id: userToAt.dataValues.at_name_id
            }))
        );
    } catch (error) {
        console.error(`Error: ${error}`);
        throw error;
    }

    // these rows also exist in the database
    for (let at of userAtsActiveUpdate) {
        try {
            await db.UserToAt.update(
                { active: true },
                { where: { at_name_id: at.id, user_id: userId } }
            );
            savedUserAts.push({
                at_name_id: at.id
            });
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
    assignUsersToRuns,
    removeUsersFromRun,
    getAllTesters,
    signupUser,
    saveUserAts,
    getUserAndUpdateRoles
};
