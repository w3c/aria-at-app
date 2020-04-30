const UsersService = require('../services/UsersService');

async function addUser(req, res) {
    const user = req.body;
    try {
        const createdUser = await UsersService.addUser(user);
        res.status(201).json(createdUser);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

async function addUserToRole(req, res) {
    const userToRole = req.body;
    try {
        const createdUser = await UsersService.addUserToRole(userToRole);
        res.status(201).json(createdUser);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

async function assignUsersToRuns(req, res) {
    const { users, runs } = req.body;
    try {
        const savedRuns = await UsersService.assignUsersToRuns(users, runs);
        res.status(201).json({ savedRuns });
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

async function removeUsersFromRun(req, res) {
    const { users, runId } = req.body;
    try {
        const usersForRun = await UsersService.removeUsersFromRun(users, runId);
        res.status(201).json({ runId, usersForRun });
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

async function getAllTesters(req, res) {
    try {
        const testers = await UsersService.getAllTesters();
        res.status(201).json(testers);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

async function setUserAts(req, res) {
    const { ats, userId } = req.body;
    console.log('REQ.BODY IN CONTROLLER', req.body);
    try {
        const response = await UsersService.saveUserAts({ userId, ats });
        res.status(200).json(response);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

module.exports = {
    addUser,
    addUserToRole,
    assignUsersToRuns,
    removeUsersFromRun,
    getAllTesters,
    setUserAts
};
