const { uniq: unique } = require('lodash');
const getGraphQLContext = require('../../graphql-context');
const testPlanReportStatusesResolver = require('./testPlanReportStatusesResolver');
const db = require('../../models');
const dbCleaner = require('../../tests/util/db-cleaner');
const { createAtVersion } = require('../../models/services/AtService');

describe('testPlanReportStatusesResolver', () => {
    const getFakeTestPlanReport = values => {
        const fake = { ...values };
        fake.dataValues = values;
        return values;
    };

    let context;

    beforeEach(() => {
        context = getGraphQLContext({ req: { transaction: false } });
    });

    afterAll(async () => {
        // Closing the DB connection allows Jest to exit successfully.
        await db.sequelize.close();
    });

    it('uses minimumAtVersions when no testPlanReports exist', async () => {
        const testPlanVersionWithoutReports = {
            phase: 'DRAFT',
            testPlanReports: []
        };

        const statuses = await testPlanReportStatusesResolver(
            testPlanVersionWithoutReports,
            null,
            context
        );

        const atsInOrder = unique(statuses.map(status => status.at.name));
        const jawsBrowsersInOrder = unique(
            statuses
                .filter(status => status.at.id === 1)
                .map(status => status.browser.name)
        );
        const voiceoverBrowsersInOrder = unique(
            statuses
                .filter(status => status.at.id === 3)
                .map(status => status.browser.name)
        );
        const exactAtVersions = statuses.filter(
            status => status.exactAtVersion
        );
        const requiredStatuses = statuses.filter(status => status.isRequired);

        expect(statuses.length).toBe(7);
        expect(atsInOrder).toEqual(['JAWS', 'NVDA', 'VoiceOver for macOS']);
        expect(jawsBrowsersInOrder).toEqual(['Chrome', 'Firefox']);
        expect(voiceoverBrowsersInOrder).toEqual([
            'Safari',
            'Chrome',
            'Firefox'
        ]);
        expect(exactAtVersions).toEqual([]);
        expect(requiredStatuses.length).toBe(3);
    });

    it('matches up testPlanReports when they exist', async () => {
        const testPlanVersion = {
            phase: 'DRAFT',
            testPlanReports: [
                getFakeTestPlanReport({
                    atId: 1,
                    browserId: 2,
                    minimumAtVersionId: 1
                })
            ]
        };

        const statuses = await testPlanReportStatusesResolver(
            testPlanVersion,
            null,
            context
        );

        const statusesWithReport = statuses.filter(
            status => status.testPlanReport
        );

        expect(statuses.length).toBe(7);
        expect(statusesWithReport.length).toBe(1);
        expect(statusesWithReport[0].isRequired).toBe(true);
        expect(statusesWithReport[0].at.name).toBe('JAWS');
        expect(statusesWithReport[0].browser.name).toBe('Chrome');
        expect(statusesWithReport[0].minimumAtVersion.id).toBe(1);
    });

    it('supports duplicate at / browser / atVersions', async () => {
        const testPlanVersion = {
            phase: 'DRAFT',
            testPlanReports: [
                getFakeTestPlanReport({
                    atId: 1,
                    browserId: 2,
                    minimumAtVersionId: 1
                }),
                getFakeTestPlanReport({
                    atId: 1,
                    browserId: 2,
                    minimumAtVersionId: 1
                })
            ]
        };

        const statuses = await testPlanReportStatusesResolver(
            testPlanVersion,
            null,
            context
        );

        const statusesWithReport = statuses.filter(
            status => status.testPlanReport
        );

        expect(statuses.length).toBe(8);
        expect(statusesWithReport.length).toBe(2);
        expect(statusesWithReport[0].isRequired).toBe(true);
        expect(statusesWithReport[0].at.name).toBe('JAWS');
        expect(statusesWithReport[0].browser.name).toBe('Chrome');
        expect(statusesWithReport[0].minimumAtVersion.id).toBe(1);
        expect(statusesWithReport[1].isRequired).toBe(false);
        expect(statusesWithReport[1].at.name).toBe('JAWS');
        expect(statusesWithReport[1].browser.name).toBe('Chrome');
        expect(statusesWithReport[1].minimumAtVersion.id).toBe(1);
    });

    it('requires all versions to be covered', async () => {
        await dbCleaner(async transaction => {
            const context = getGraphQLContext({ req: { transaction } });

            const getDate = dayAdjustment => {
                return new Date(
                    Number(new Date()) + dayAdjustment * 1000 * 60 * 60 * 24
                ).toISOString();
            };

            await createAtVersion({
                values: { atId: 1, name: 'v2', releasedAt: getDate(-20) },
                transaction
            });

            const v3 = await createAtVersion({
                values: { atId: 1, name: 'v3', releasedAt: getDate(-15) },
                transaction
            });

            await createAtVersion({
                values: { atId: 1, name: 'v4', releasedAt: getDate(-10) },
                transaction
            });

            await createAtVersion({
                values: { atId: 1, name: 'v5', releasedAt: getDate(-5) },
                transaction
            });

            const testPlanVersion = {
                phase: 'RECOMMENDED',
                testPlanReports: [
                    getFakeTestPlanReport({
                        atId: 1,
                        browserId: 2,
                        exactAtVersionId: v3.id
                    })
                ]
            };

            const statuses = await testPlanReportStatusesResolver(
                testPlanVersion,
                null,
                context
            );

            const jawsChromeStatuses = statuses.filter(
                status =>
                    status.at.name === 'JAWS' &&
                    status.browser.name === 'Chrome'
            );

            const v2Status = jawsChromeStatuses.find(
                status => status.exactAtVersion.name == 'v2'
            );

            expect(jawsChromeStatuses[0].exactAtVersion.name).toBe('v3');
            expect(jawsChromeStatuses[0].isRequired).toBe(true);
            expect(jawsChromeStatuses[0].testPlanReport).toBeTruthy();
            expect(jawsChromeStatuses[1].exactAtVersion.name).toBe('v4');
            expect(jawsChromeStatuses[1].isRequired).toBe(false);
            expect(jawsChromeStatuses[1].testPlanReport).toBe(null);
            expect(jawsChromeStatuses[2].exactAtVersion.name).toBe('v5');
            expect(jawsChromeStatuses[2].isRequired).toBe(false);
            expect(jawsChromeStatuses[2].testPlanReport).toBe(null);
            expect(jawsChromeStatuses.length).toBe(3);
            expect(v2Status).toBe(undefined); // Old versions can be ignored
        });
    });
});
