const startSupertestServer = require('../util/api-server');
const automationRoutes = require('../../routes/automation');
const setupMockAutomationSchedulerServer = require('../util/mock-automation-scheduler-server');
const db = require('../../models/index');
const { query } = require('../util/graphql-test-utilities');
const findOrCreateCollectionJobResolver = require('../../resolvers/findOrCreateCollectionJobResolver');

let mockAutomationSchedulerServer;
let apiServer;
let sessionAgent;
let transaction;

beforeAll(async () => {
    transaction = await db.sequelize.transaction();
    apiServer = await startSupertestServer({
        pathToRoutes: [['/api/jobs', automationRoutes]]
    });
    sessionAgent = apiServer.sessionAgent;
    mockAutomationSchedulerServer = await setupMockAutomationSchedulerServer();
});

afterAll(async () => {
    await transaction.rollback();
    await mockAutomationSchedulerServer.tearDown();
    await apiServer.tearDown();
    await db.sequelize.close();
});

describe('Schedule jobs with automation controller', () => {
    it('should schedule a new job', async () => {
        const response = await sessionAgent.post('/api/jobs/new').send({
            test: 'test'
        });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: '999',
            status: 'QUEUED'
        });
        const graphqlRes = await query(`
            query {
                collectionJob(id: "999") {
                    id
                    status
                }
            }
        `);
        expect(graphqlRes).toEqual({
            collectionJob: {
                id: '999',
                status: 'QUEUED'
            }
        });
    });

    it('should cancel a job', async () => {
        const response = await sessionAgent.post('/api/jobs/999/cancel');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: '999',
            status: 'CANCELED'
        });
        const graphqlRes = await query(`
            query {
                collectionJob(id: "999") {
                    id
                    status
                }
            }
        `);
        expect(graphqlRes).toEqual({
            collectionJob: {
                id: '999',
                status: 'CANCELED'
            }
        });
    });

    it('should restart a job', async () => {
        const response = await sessionAgent.post('/api/jobs/999/restart');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: '999',
            status: 'QUEUED'
        });
        const graphqlRes = await query(`
            query {
                collectionJob(id: "999") {
                    id
                    status
                }
            }
        `);
        expect(graphqlRes).toEqual({
            collectionJob: {
                id: '999',
                status: 'QUEUED'
            }
        });
    });

    it('should get a job log', async () => {
        const response = await sessionAgent.get('/api/jobs/999/log');
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: '999',
            log: 'TEST LOG'
        });
    });

    it('should not update a job status without verification', async () => {
        const response = await sessionAgent.post('/api/jobs/999/update');
        expect(response.statusCode).toBe(403);
        expect(response.body).toEqual({
            error: 'Unauthorized'
        });
    });

    it('should update a job status with verification', async () => {
        const response = await sessionAgent
            .post('/api/jobs/999/update')
            .send({ status: 'RUNNING' })
            .set(
                'x-automation-secret',
                process.env.AUTOMATION_SCHEDULER_SECRET
            );
        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({
            id: '999',
            status: 'RUNNING',
            testPlanRunId: null
        });
        const graphqlRes = await query(`
            query {
                collectionJob(id: "999") {
                    id
                    status
                }
            }
        `);
        expect(graphqlRes).toEqual({
            collectionJob: {
                id: '999',
                status: 'RUNNING'
            }
        });
    });

    it('should delete a job', async () => {
        const response = await sessionAgent.post('/api/jobs/999/delete');
        expect(response.statusCode).toBe(200);
        const graphqlRes = await query(`
            query {
                collectionJob(id: "999") {
                    id
                    status
                }
            }
        `);
        expect(graphqlRes).toEqual({
            collectionJob: null
        });
    });
});
