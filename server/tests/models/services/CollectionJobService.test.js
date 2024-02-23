const { sequelize } = require('../../../models');
const CollectionJobService = require('../../../models/services/CollectionJobService');
const dbCleaner = require('../../util/db-cleaner');

describe('CollectionJob Service Tests', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    const randomIdGenerator = () => Math.random().toString(36).substring(7);

    it('should return valid CollectionJob for id query with all associations', async () => {
        // A1
        const _id = '1';

        // A2
        const collectionJob = await CollectionJobService.getCollectionJobById({
            id: _id,
            transaction: false
        });
        const { id, status } = collectionJob;

        // A3
        expect(id).toEqual(_id);
        expect(status).toBeTruthy();
        expect(collectionJob).toHaveProperty('externalLogsUrl');
        expect(collectionJob).toHaveProperty('testPlanRun');
        expect(collectionJob.testPlanRun).toHaveProperty('tester');
        expect(collectionJob.testPlanRun).toHaveProperty('testPlanReport');
        expect(collectionJob.testPlanRun.testPlanReport).toHaveProperty(
            'testPlanVersion'
        );
        expect(collectionJob.testPlanRun.testPlanReport).toHaveProperty('at');
        expect(collectionJob.testPlanRun.testPlanReport).toHaveProperty(
            'browser'
        );
    });

    it('should return valid CollectionJob for id query with no associations', async () => {
        // A1
        const _id = '1';

        // A2
        const collectionJob = await CollectionJobService.getCollectionJobById({
            id: _id,
            transaction: false,
            testPlanRunAttributes: []
        });
        const { id, status } = collectionJob;

        // A3
        expect(id).toEqual(_id);
        expect(status).toBeTruthy();
        expect(collectionJob).toHaveProperty('externalLogsUrl');
        expect(collectionJob).not.toHaveProperty('testPlanRun');
    });

    it('should not be valid CollectionJob query', async () => {
        // A1
        const _id = '53935';

        // A2
        const collectionJob = await CollectionJobService.getCollectionJobById({
            id: _id,
            transaction: false
        });

        // A3
        expect(collectionJob).toBeNull();
    });

    it('should create and remove a new collectionJob', async () => {
        await dbCleaner(async transaction => {
            // A1
            const _status = 'QUEUED';

            // A2
            const collectionJob =
                await CollectionJobService.createCollectionJob({
                    values: { id: randomIdGenerator(), status: _status },
                    transaction
                });
            const { id, status } = collectionJob;

            // A2
            await CollectionJobService.removeCollectionJobById({
                id,
                transaction
            });
            const deletedCollectionJob =
                await CollectionJobService.getCollectionJobById({
                    id,
                    transaction
                });

            // after CollectionJob created
            expect(id).toBeTruthy();
            expect(status).toEqual(_status);

            // after browser removed
            expect(deletedCollectionJob).toBeNull();
        });
    });

    it('should create a new CollectionJob with default status', async () => {
        await dbCleaner(async transaction => {
            const id = randomIdGenerator();
            const collectionJob =
                await CollectionJobService.createCollectionJob({
                    values: { id, testPlanReportId: 2 },
                    transaction
                });

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual('QUEUED');
        });
    });

    it('should create a new CollectionJob with provided status', async () => {
        await dbCleaner(async transaction => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const collectionJob =
                await CollectionJobService.createCollectionJob({
                    values: { id, status, testPlanReportId: 2 },
                    transaction
                });

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should throw an error when creating a CollectionJob with existing id', async () => {
        await dbCleaner(async transaction => {
            const id = randomIdGenerator();
            await CollectionJobService.createCollectionJob({
                values: { id, testPlanReportId: 2 },
                transaction
            });

            await expect(
                CollectionJobService.createCollectionJob({
                    values: { id },
                    transaction
                })
            ).rejects.toThrow(Error);
        });
    });

    it('should return null when getting a CollectionJob by unknown id', async () => {
        const id = randomIdGenerator();
        const collectionJob = await CollectionJobService.getCollectionJobById({
            id,
            transaction: false
        });

        expect(collectionJob).toBeNull();
    });

    it('should be able to get all CollectionJobs and filter by status', async () => {
        await dbCleaner(async transaction => {
            const id1 = randomIdGenerator();
            const id2 = randomIdGenerator();
            const status1 = 'QUEUED';
            const status2 = 'IN_PROGRESS';
            await CollectionJobService.createCollectionJob({
                values: { id: id1, status: status1, testPlanReportId: 2 },
                transaction
            });
            await CollectionJobService.createCollectionJob({
                values: { id: id2, status: status2, testPlanReportId: 4 },
                transaction
            });

            const collectionJobs = await CollectionJobService.getCollectionJobs(
                { transaction }
            );

            expect(collectionJobs).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: id1 }),
                    expect.objectContaining({ id: id2 })
                ])
            );

            const queuedJobs = await CollectionJobService.getCollectionJobs({
                where: { status: status1 },
                transaction
            });

            expect(queuedJobs).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: id1, status: status1 })
                ])
            );
        });
    });

    it('should be able to update the status of a CollectionJob', async () => {
        await dbCleaner(async transaction => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const initialJob = await CollectionJobService.createCollectionJob({
                values: { id, testPlanReportId: 2 },
                transaction
            });
            expect(initialJob.id).toEqual(id);
            expect(initialJob.status).toEqual('QUEUED');

            const collectionJob =
                await CollectionJobService.updateCollectionJobById({
                    id,
                    values: { status },
                    transaction
                });

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should create a new CollectionJob if one with that id does not exist with getOrCreate', async () => {
        await dbCleaner(async transaction => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const initialJob = await CollectionJobService.getCollectionJobById({
                id,
                transaction
            });
            expect(initialJob).toBeNull();
            const collectionJob =
                await CollectionJobService.getOrCreateCollectionJob({
                    where: { id },
                    values: { status, testPlanReportId: 2 },
                    transaction
                });

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should find an existing CollectionJob if one with that id exists with getOrCreate', async () => {
        await dbCleaner(async transaction => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const initialJob = await CollectionJobService.createCollectionJob({
                values: { id, status, testPlanReportId: 2 },
                transaction
            });
            expect(initialJob.id).toEqual(id);
            expect(initialJob.status).toEqual(status);
            const collectionJob =
                await CollectionJobService.getOrCreateCollectionJob({
                    where: { id },
                    transaction
                });

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should be able to remove a CollectionJob', async () => {
        await dbCleaner(async transaction => {
            const id = randomIdGenerator();
            const initialJob = await CollectionJobService.createCollectionJob({
                values: { id, testPlanReportId: 2 },
                transaction
            });
            expect(initialJob.id).toEqual(id);

            await CollectionJobService.removeCollectionJobById({
                id,
                transaction
            });

            const collectionJob =
                await CollectionJobService.getCollectionJobById({
                    id,
                    transaction
                });
            expect(collectionJob).toBeNull();
        });
    });
});
