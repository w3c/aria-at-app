const { sequelize } = require('../../../models');
const CollectionJobService = require('../../../models/services/CollectionJobService');
const {
    COLLECTION_JOB_ATTRIBUTES
} = require('../../../models/services/helpers');
const dbCleaner = require('../../util/db-cleaner');

describe('CollectionJob Service Tests', () => {
    afterAll(async () => {
        await sequelize.close();
    });

    const randomIdGenerator = () => Math.random().toString(36).substring(7);

    it('should create a new CollectionJob with default status', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            const collectionJob =
                await CollectionJobService.createCollectionJob(
                    { id, testPlanReportId: 2 },
                    COLLECTION_JOB_ATTRIBUTES
                );

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual('QUEUED');
        });
    });

    it('should create a new CollectionJob with provided status', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const collectionJob =
                await CollectionJobService.createCollectionJob(
                    { id, status, testPlanReportId: 2 },
                    COLLECTION_JOB_ATTRIBUTES
                );

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should throw an error when creating a CollectionJob with existing id', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            await CollectionJobService.createCollectionJob(
                { id, testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );

            await expect(
                CollectionJobService.createCollectionJob(
                    { id },
                    COLLECTION_JOB_ATTRIBUTES
                )
            ).rejects.toThrow(Error);
        });
    });

    it('should get a CollectionJob by id', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            await CollectionJobService.createCollectionJob(
                { id, testPlanReportId: 5 },
                COLLECTION_JOB_ATTRIBUTES
            );

            const collectionJob =
                await CollectionJobService.getCollectionJobById(id);
            expect(collectionJob.id).toEqual(id);
            expect(collectionJob).toHaveProperty('status');
            expect(collectionJob).toHaveProperty('testPlanRun');
        });
    });

    it('should return null when getting a CollectionJob by unknown id', async () => {
        const id = randomIdGenerator();
        const collectionJob = await CollectionJobService.getCollectionJobById(
            id
        );

        expect(collectionJob).toBeNull();
    });

    it('should be able to get all CollectionJobs and filter by status', async () => {
        await dbCleaner(async () => {
            const id1 = randomIdGenerator();
            const id2 = randomIdGenerator();
            const status1 = 'QUEUED';
            const status2 = 'IN_PROGRESS';
            await CollectionJobService.createCollectionJob(
                { id: id1, status: status1, testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );
            await CollectionJobService.createCollectionJob(
                { id: id2, status: status2, testPlanReportId: 3 },
                COLLECTION_JOB_ATTRIBUTES
            );

            const collectionJobs =
                await CollectionJobService.getCollectionJobs();

            expect(collectionJobs).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: id1 }),
                    expect.objectContaining({ id: id2 })
                ])
            );

            const queuedJobs = await CollectionJobService.getCollectionJobs(
                null,
                { status: status1 }
            );

            expect(queuedJobs).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: id1, status: status1 })
                ])
            );
        });
    });

    it('should be able to update the status of a CollectionJob', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const initialJob = await CollectionJobService.createCollectionJob(
                { id, testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );
            expect(initialJob.id).toEqual(id);
            expect(initialJob.status).toEqual('QUEUED');

            const collectionJob =
                await CollectionJobService.updateCollectionJob(
                    id,
                    { status },
                    COLLECTION_JOB_ATTRIBUTES
                );

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should create a new CollectionJob if one with that id does not exist with getOrCreate', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const initialJob = await CollectionJobService.getCollectionJobById(
                id
            );
            expect(initialJob).toBeNull();
            const collectionJob =
                await CollectionJobService.getOrCreateCollectionJob({
                    id,
                    status,
                    testPlanReportId: 2
                });

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should find an existing CollectionJob if one with that id exists with getOrCreate', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            const status = 'IN_PROGRESS';
            const initialJob = await CollectionJobService.createCollectionJob(
                { id, status, testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );
            expect(initialJob.id).toEqual(id);
            expect(initialJob.status).toEqual(status);
            const collectionJob =
                await CollectionJobService.getOrCreateCollectionJob({
                    id
                });

            expect(collectionJob.id).toEqual(id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should be able to delete a CollectionJob', async () => {
        await dbCleaner(async () => {
            const id = randomIdGenerator();
            const initialJob = await CollectionJobService.createCollectionJob(
                { id, testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );
            expect(initialJob.id).toEqual(id);

            await CollectionJobService.deleteCollectionJob(id);

            const collectionJob =
                await CollectionJobService.getCollectionJobById(id);
            expect(collectionJob).toBeNull();
        });
    });
});
