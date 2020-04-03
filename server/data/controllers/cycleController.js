const CycleService = require('../services/cycleService');

class CycleController {
    static async configureCycle(req, res) {
        const cycle = req.body;
        try {
            const savedCycle = await CycleService.configureCycle(cycle);
            res.status(201).json(savedCycle);
        } catch (error) {
            res.status(400);
            console.error(`Error in cycleController: ${error}`);
        }
    }
    static async getAllCycles(req, res) {
        try {
            const cycles = await CycleService.getAllCycles();
            res.status(201).json(cycles);
        } catch (error) {
            res.status(400);
            console.error(`Error in cycleController: ${error}`);
        }
    }
    static async deleteCycle(req, res) {
        try {
            const cycleId = req.body.id;
            await CycleService.deleteCycle(cycleId);
            res.status(201);
        } catch (error) {
            res.status(400);
            console.error(`Error in cycleController: ${error}`);
        }
    }
    static async getAllTestVersions(req, res) {
        try {
            const testVersions = await CycleService.getAllTestVersions();
            res.status(201).json(testVersions);
        } catch (error) {
            res.status(400);
            console.error(`Error in cycleController: ${error}`);
        }
    }
}

module.exports = CycleController;
