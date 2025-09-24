const { sequelize } = require('../../../models');
const AuditService = require('../../../models/services/AuditService');
const { AUDIT_EVENT_TYPES } = require('../../../util/auditEventTypes');
const dbCleaner = require('../../util/db-cleaner');

describe('AuditService Data Checks', () => {
  afterAll(async () => {
    await sequelize.close();
  });

  describe('auditTesterAssignment', () => {
    it('should create an audit record for tester assignment', async () => {
      await dbCleaner(async transaction => {
        const performedByUserId = 1;
        const testerUserId = 2;
        const testerUsername = 'testuser';
        const testPlanReportId = 3;

        const auditRecord = await AuditService.auditTesterAssignment({
          performedByUserId,
          testerUserId,
          testerUsername,
          testPlanReportId,
          transaction
        });

        expect(auditRecord).toBeDefined();
        expect(auditRecord.eventType).toBe(AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT);
        expect(auditRecord.description).toContain(
          'Tester testuser assigned to test plan report'
        );
        expect(auditRecord.performedByUserId).toBe(performedByUserId);
        expect(auditRecord.entityId).toBe(testPlanReportId);
        expect(auditRecord.metadata.eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT
        );
        expect(auditRecord.metadata.testerUserId).toBe(testerUserId);
        expect(auditRecord.metadata.testPlanReportId).toBe(testPlanReportId);
        expect(auditRecord.createdAt).toBeDefined();
      });
    });
  });

  describe('auditTesterReassignment', () => {
    it('should create an audit record for tester reassignment', async () => {
      await dbCleaner(async transaction => {
        const performedByUserId = 1;
        const fromTesterUserId = 2;
        const fromTesterUsername = 'olduser';
        const toTesterUserId = 3;
        const toTesterUsername = 'newuser';
        const testPlanReportId = 4;
        const testPlanRunId = 5;

        const auditRecord = await AuditService.auditTesterReassignment({
          performedByUserId,
          fromTesterUserId,
          fromTesterUsername,
          toTesterUserId,
          toTesterUsername,
          testPlanReportId,
          testPlanRunId,
          transaction
        });

        expect(auditRecord).toBeDefined();
        expect(auditRecord.eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT
        );
        expect(auditRecord.description).toContain(
          'Tester reassigned from olduser to newuser'
        );
        expect(auditRecord.performedByUserId).toBe(performedByUserId);
        expect(auditRecord.entityId).toBe(testPlanReportId);
        expect(auditRecord.metadata.eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT
        );
        expect(auditRecord.metadata.fromTesterUserId).toBe(fromTesterUserId);
        expect(auditRecord.metadata.toTesterUserId).toBe(toTesterUserId);
        expect(auditRecord.metadata.testPlanReportId).toBe(testPlanReportId);
        expect(auditRecord.metadata.testPlanRunId).toBe(testPlanRunId);
        expect(auditRecord.createdAt).toBeDefined();
      });
    });
  });

  describe('auditTesterRemoval', () => {
    it('should create an audit record for tester removal', async () => {
      await dbCleaner(async transaction => {
        const performedByUserId = 1;
        const testerUserId = 2;
        const testerUsername = 'removeduser';
        const testPlanReportId = 3;

        const auditRecord = await AuditService.auditTesterRemoval({
          performedByUserId,
          testerUserId,
          testerUsername,
          testPlanReportId,
          transaction
        });

        expect(auditRecord).toBeDefined();
        expect(auditRecord.eventType).toBe(AUDIT_EVENT_TYPES.TESTER_REMOVAL);
        expect(auditRecord.description).toContain(
          'Tester removeduser removed from test plan report'
        );
        expect(auditRecord.performedByUserId).toBe(performedByUserId);
        expect(auditRecord.entityId).toBe(testPlanReportId);
        expect(auditRecord.metadata.eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_REMOVAL
        );
        expect(auditRecord.metadata.testerUserId).toBe(testerUserId);
        expect(auditRecord.metadata.testPlanReportId).toBe(testPlanReportId);
        expect(auditRecord.metadata.testPlanRunId).toBeNull();
        expect(auditRecord.createdAt).toBeDefined();
      });
    });

    it('should create an audit record for tester removal with testPlanRunId', async () => {
      await dbCleaner(async transaction => {
        const performedByUserId = 1;
        const testerUserId = 2;
        const testerUsername = 'removeduser';
        const testPlanReportId = 3;
        const testPlanRunId = 4;

        const auditRecord = await AuditService.auditTesterRemoval({
          performedByUserId,
          testerUserId,
          testerUsername,
          testPlanReportId,
          testPlanRunId,
          transaction
        });

        expect(auditRecord).toBeDefined();
        expect(auditRecord.eventType).toBe(AUDIT_EVENT_TYPES.TESTER_REMOVAL);
        expect(auditRecord.description).toContain(
          'Tester removeduser removed from test plan run 4 in test plan report 3'
        );
        expect(auditRecord.performedByUserId).toBe(performedByUserId);
        expect(auditRecord.entityId).toBe(testPlanReportId);
        expect(auditRecord.metadata.eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_REMOVAL
        );
        expect(auditRecord.metadata.testerUserId).toBe(testerUserId);
        expect(auditRecord.metadata.testPlanReportId).toBe(testPlanReportId);
        expect(auditRecord.metadata.testPlanRunId).toBe(testPlanRunId);
        expect(auditRecord.createdAt).toBeDefined();
      });
    });
  });

  describe('getAuditRecordsForTestPlanReport', () => {
    it('should retrieve audit records for a test plan report', async () => {
      await dbCleaner(async transaction => {
        const testPlanReportId = 1;

        // Create some test audit records
        await AuditService.auditTesterAssignment({
          performedByUserId: 1,
          testerUserId: 2,
          testerUsername: 'testuser',
          testPlanReportId,
          transaction
        });

        await AuditService.auditTesterReassignment({
          performedByUserId: 1,
          fromTesterUserId: 2,
          fromTesterUsername: 'olduser',
          toTesterUserId: 3,
          toTesterUsername: 'newuser',
          testPlanReportId,
          testPlanRunId: 3,
          transaction
        });

        const auditRecords =
          await AuditService.getAuditRecordsForTestPlanReport({
            testPlanReportId,
            transaction
          });

        expect(auditRecords).toHaveLength(2);
        expect(auditRecords[0].eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_REASSIGNMENT
        );
        expect(auditRecords[1].eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT
        );
      });
    });
  });

  describe('getAuditRecordsForTester', () => {
    it('should retrieve audit records for a specific tester', async () => {
      await dbCleaner(async transaction => {
        const testerUserId = 2;
        const testPlanReportId = 1;

        // Create some test audit records
        await AuditService.auditTesterAssignment({
          performedByUserId: 1,
          testerUserId: testerUserId,
          testerUsername: 'testuser',
          testPlanReportId,
          transaction
        });

        await AuditService.auditTesterReassignment({
          performedByUserId: 1,
          fromTesterUserId: testerUserId,
          fromTesterUsername: 'olduser',
          toTesterUserId: 3,
          toTesterUsername: 'newuser',
          testPlanReportId,
          testPlanRunId: 3,
          transaction
        });

        const auditRecords = await AuditService.getAuditRecordsForTester({
          testerUserId,
          transaction
        });

        expect(auditRecords).toHaveLength(2);
        // First record should be reassignment with toTesterUserId
        expect(auditRecords[0].metadata.toTesterUserId).toBe(testerUserId);
        // Second record should be assignment with testerUserId
        expect(auditRecords[1].metadata.testerUserId).toBe(testerUserId);
      });
    });
  });

  describe('createAuditRecord', () => {
    it('should create a custom audit record', async () => {
      await dbCleaner(async transaction => {
        const eventType = AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT;
        const description = 'Custom test event';
        const performedByUserId = 1;
        const entityId = 123;
        const metadata = { customField: 'test' };

        const auditRecord = await AuditService.createAuditRecord({
          eventType,
          description,
          performedByUserId,
          entityId,
          metadata,
          transaction
        });

        expect(auditRecord).toBeDefined();
        expect(auditRecord.eventType).toBe(eventType);
        expect(auditRecord.description).toBe(description);
        expect(auditRecord.performedByUserId).toBe(performedByUserId);
        expect(auditRecord.entityId).toBe(entityId);
        expect(auditRecord.metadata.customField).toBe('test');
        expect(auditRecord.createdAt).toBeDefined();
      });
    });
  });

  describe('getAuditRecordById', () => {
    it('should retrieve an audit record by ID', async () => {
      await dbCleaner(async transaction => {
        const performedByUserId = 1;
        const testerUserId = 2;
        const testPlanReportId = 3;

        const createdRecord = await AuditService.auditTesterAssignment({
          performedByUserId,
          testerUserId: testerUserId,
          testerUsername: 'testuser',
          testPlanReportId,
          transaction
        });

        const retrievedRecord = await AuditService.getAuditRecordById({
          id: createdRecord.id,
          transaction
        });

        expect(retrievedRecord).toBeDefined();
        expect(retrievedRecord.id).toBe(createdRecord.id);
        expect(retrievedRecord.eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT
        );
        expect(retrievedRecord.performedByUserId).toBe(performedByUserId);
      });
    });
  });

  describe('updateAuditRecordById', () => {
    it('should update an audit record by ID', async () => {
      await dbCleaner(async transaction => {
        const performedByUserId = 1;
        const testerUserId = 2;
        const testPlanReportId = 3;

        const createdRecord = await AuditService.auditTesterAssignment({
          performedByUserId,
          testerUserId: testerUserId,
          testerUsername: 'testuser',
          testPlanReportId,
          transaction
        });

        const updatedDescription = 'Updated description';
        const updatedRecord = await AuditService.updateAuditRecordById({
          id: createdRecord.id,
          values: { description: updatedDescription },
          transaction
        });

        expect(updatedRecord).toBeDefined();
        expect(updatedRecord.id).toBe(createdRecord.id);
        expect(updatedRecord.description).toBe(updatedDescription);
        expect(updatedRecord.eventType).toBe(
          AUDIT_EVENT_TYPES.TESTER_ASSIGNMENT
        );
      });
    });
  });

  describe('removeAuditRecordById', () => {
    it('should remove an audit record by ID', async () => {
      await dbCleaner(async transaction => {
        const performedByUserId = 1;
        const testerUserId = 2;
        const testPlanReportId = 3;

        const createdRecord = await AuditService.auditTesterAssignment({
          performedByUserId,
          testerUserId: testerUserId,
          testerUsername: 'testuser',
          testPlanReportId,
          transaction
        });

        const removed = await AuditService.removeAuditRecordById({
          id: createdRecord.id,
          transaction
        });

        expect(removed).toBe(true);

        const retrievedRecord = await AuditService.getAuditRecordById({
          id: createdRecord.id,
          transaction
        });

        expect(retrievedRecord).toBeNull();
      });
    });
  });

  describe('getAuditRecords', () => {
    it('should retrieve audit records with pagination', async () => {
      await dbCleaner(async transaction => {
        const testPlanReportId = 1;

        // Create multiple audit records
        await AuditService.auditTesterAssignment({
          performedByUserId: 1,
          testerUserId: 2,
          testerUsername: 'testuser',
          testPlanReportId,
          transaction
        });

        await AuditService.auditTesterReassignment({
          performedByUserId: 1,
          fromTesterUserId: 2,
          fromTesterUsername: 'olduser',
          toTesterUserId: 3,
          toTesterUsername: 'newuser',
          testPlanReportId,
          testPlanRunId: 3,
          transaction
        });

        const auditRecords = await AuditService.getAuditRecords({
          pagination: { enablePagination: true, limit: 1 },
          transaction
        });

        expect(auditRecords.data).toHaveLength(1);
        expect(auditRecords).toEqual(
          expect.objectContaining({
            page: 1,
            pageSize: expect.any(Number),
            resultsCount: expect.any(Number),
            totalResultsCount: expect.any(Number),
            pagesCount: expect.any(Number),
            data: expect.arrayContaining([
              expect.objectContaining({
                id: expect.any(Number)
              })
            ])
          })
        );
      });
    });
  });
});
