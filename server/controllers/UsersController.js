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

async function assignUsersToRun(req, res) {
    const data = req.body;
    try {
        const usersForRun = await UsersService.assignUsersToRun(data);
        res.status(201).json(usersForRun);
    } catch (error) {
        res.status(400);
        res.end();
        console.error(`Error caught in UsersController: ${error}`);
    }
}

async function removeUsersFromRun(req, res) {
    const user = req.body;
    try {
        const usersForRun = await UsersService.removeUsersFromRun(user);
        res.status(201).json(usersForRun);
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

module.exports = {
    addUser,
    addUserToRole,
    assignUsersToRun,
    removeUsersFromRun,
    getAllTesters
};
