const { Users, UserToRole, TesterToRun, UserToAt } = require('../models/usersModel');
const sequelize = global.sequelize;

module.exports = {
    async addUser(user) {
        try {
            const newUser = await Users.create(user);
            return newUser;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    },
    async addUserToRole(userToRole) {
        try {
            const newUserToRole = await UserToRole.create(userToRole);
            return newUserToRole;
        } catch (error) {
            console.error(`Error: ${error}`);
            throw error;
        }
    },
    /*
     * Expects:
     *   data = {
     *     run_id: run_id
     *     users: [id1, id2]
     *   }
     * Returns:
     *   A list of tester_to_run records (user_id, run_id) for the given run_id
     */
    static async assignUsersToRun(data) {
        try {
            for (let id of data.users) {
                const result = await TesterToRun.create({
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
    },
    /*
     * Expects:
     *   data = {
     *     run_id: run_id,
     *     users: [id1, id2]
     *   }
     * Returns:
     *   A list of tester_to_run records (user_id, run_id) for the given run_id
     */
    static async removeUsersFromRun(data) {
        try {

            console.log("data in usersServices:", data);
            for (let id of data.users) {
                const result = await TesterToRun.destroy({
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
    },
    /*
     * Returns:
     *   [
     *     {
     *       id: users.id,
     *       fullname: users.fullname,
     *       username: users.username,
     *       email: users.email
     *       configured_ats: [
     *         {
     *           at_name_id: at_name.id
     *           at_name: at_name.name
     *         },
     *         ...
     *       ]
     *     },
     *     ....
     *   ]
     */
    static async getAllTesters() {
        try {
            let currentUsers = (await Users.findAll()).map(userData => userData.dataValues);

            for (let user of currentUsers) {
                let results = (await sequelize.query(`
                     select
                       at_name_id,
                       name as at_name
                     from
                       user_to_at,
                       at_name
                     where
                       user_to_at.at_name_id = at_name.id
                       and user_id=${user.id}
                `))[0];

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
};
