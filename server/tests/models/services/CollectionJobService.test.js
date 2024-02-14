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

    it('should create a new CollectionJob with default status', async () => {
        await dbCleaner(async () => {
            const collectionJob =
                await CollectionJobService.createCollectionJob(
                    { testPlanReportId: 2 },
                    COLLECTION_JOB_ATTRIBUTES
                );
            expect(collectionJob.status).toEqual('QUEUED');
        });
    });

    it('should create a new CollectionJob with provided status', async () => {
        await dbCleaner(async () => {
            const status = 'CANCELLED';
            const collectionJob =
                await CollectionJobService.createCollectionJob(
                    { status, testPlanReportId: 2 },
                    COLLECTION_JOB_ATTRIBUTES
                );

            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should get a CollectionJob by id', async () => {
        await dbCleaner(async () => {
            const job = await CollectionJobService.createCollectionJob(
                { testPlanReportId: 5 },
                COLLECTION_JOB_ATTRIBUTES
            );

            const collectionJob =
                await CollectionJobService.getCollectionJobById(job.id);
            expect(collectionJob.id).toEqual(job.id);
            expect(collectionJob).toHaveProperty('status');
            expect(collectionJob).toHaveProperty('testPlanRun');
        });
    });

    it('should return null when getting a CollectionJob by unknown id', async () => {
        const collectionJob = await CollectionJobService.getCollectionJobById(
            999999
        );

        expect(collectionJob).toBeNull();
    });

    it('should be able to get all CollectionJobs and filter by status', async () => {
        await dbCleaner(async () => {
            const status1 = 'QUEUED';
            const status2 = 'IN_PROGRESS';
            const job1 = await CollectionJobService.createCollectionJob(
                { status: status1, testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );
            const job2 = await CollectionJobService.createCollectionJob(
                { status: status2, testPlanReportId: 4 },
                COLLECTION_JOB_ATTRIBUTES
            );

            const collectionJobs =
                await CollectionJobService.getCollectionJobs();

            expect(collectionJobs).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: job1.id }),
                    expect.objectContaining({ id: job2.id })
                ])
            );

            const queuedJobs = await CollectionJobService.getCollectionJobs(
                null,
                { status: status1 }
            );

            expect(queuedJobs).toEqual(
                expect.arrayContaining([
                    expect.objectContaining({ id: job1.id, status: status1 })
                ])
            );
        });
    });

    it('should be able to update the status of a CollectionJob', async () => {
        await dbCleaner(async () => {
            const status = 'CANCELLED';
            const initialJob = await CollectionJobService.createCollectionJob(
                { testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );
            expect(initialJob.status).toEqual('QUEUED');

            const collectionJob =
                await CollectionJobService.updateCollectionJob(
                    initialJob.id,
                    { status },
                    COLLECTION_JOB_ATTRIBUTES
                );

            expect(collectionJob.id).toEqual(initialJob.id);
            expect(collectionJob.status).toEqual(status);
        });
    });

    it('should be able to delete a CollectionJob', async () => {
        await dbCleaner(async () => {
            const initialJob = await CollectionJobService.createCollectionJob(
                { testPlanReportId: 2 },
                COLLECTION_JOB_ATTRIBUTES
            );

            await CollectionJobService.deleteCollectionJob(initialJob.id);

            const collectionJob =
                await CollectionJobService.getCollectionJobById(initialJob.id);
            expect(collectionJob).toBeNull();
        });
    });
});
