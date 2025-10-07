const { sequelize } = require('../../../models');
const EventService = require('../../../models/services/EventService');
const { EVENT_TYPES } = require('../../../util/eventTypes');
const dbCleaner = require('../../util/db-cleaner');

afterAll(async () => {
  await sequelize.close();
});

describe('Common event related operations', () => {
  it('should create an update event', async () => {
    await dbCleaner(async transaction => {
      const eventData = {
        description: 'Test update event',
        type: 'GENERAL'
      };

      const result = await EventService.createUpdateEvent({
        values: eventData,
        transaction
      });

      expect(result).toHaveProperty('id');
      expect(result.description).toBe(eventData.description);
      expect(result.type).toBe(eventData.type);
      expect(result).toHaveProperty('timestamp');
    });
  });

  it('should create with custom attributes', async () => {
    await dbCleaner(async transaction => {
      const eventData = {
        description: 'Test update event',
        type: 'COLLECTION_JOB'
      };

      const result = await EventService.createUpdateEvent({
        values: eventData,
        updateEventAttributes: ['id', 'description', 'type'],
        transaction
      });

      const resultKeys = Object.keys(result).filter(key => key !== 'timestamp');
      expect(resultKeys).toEqual(['id', 'description', 'type']);
      expect(result.description).toBe(eventData.description);
    });
  });

  it('should retrieve an update event by id', async () => {
    await dbCleaner(async transaction => {
      const eventData = {
        description: 'Test update event',
        type: 'GENERAL'
      };

      const created = await EventService.createUpdateEvent({
        values: eventData,
        transaction
      });

      const result = await EventService.getUpdateEventById({
        id: created.id,
        transaction
      });

      expect(result.id).toBe(created.id);
      expect(result.description).toBe(eventData.description);
      expect(result.type).toBe(eventData.type);
    });
  });

  it('should return null for non-existent id', async () => {
    await dbCleaner(async transaction => {
      const result = await EventService.getUpdateEventById({
        id: 999999,
        transaction
      });

      expect(result).toBeNull();
    });
  });

  it('should retrieve multiple update events', async () => {
    await dbCleaner(async transaction => {
      const events = [
        { description: 'Event 1', type: 'GENERAL' },
        { description: 'Event 2', type: 'TEST_PLAN_RUN' }
      ];

      const createdEvents = await Promise.all(
        events.map(event =>
          EventService.createUpdateEvent({
            values: event,
            transaction
          })
        )
      );

      const results = await EventService.getUpdateEvents({
        where: {
          id: createdEvents.map(event => event.id)
        },
        transaction
      });

      expect(results).toHaveLength(2);
      expect(results[0]).toHaveProperty('timestamp');
      expect(results[1]).toHaveProperty('timestamp');

      // Verify the created events match our input
      const descriptions = results.map(r => r.description).sort();
      expect(descriptions).toEqual(['Event 1', 'Event 2']);
    });
  });

  it('should filter events by type', async () => {
    await dbCleaner(async transaction => {
      const events = [
        { description: 'Event 1', type: 'GENERAL' },
        { description: 'Event 2', type: 'TEST_PLAN_RUN' }
      ];

      await Promise.all(
        events.map(event =>
          EventService.createUpdateEvent({
            values: event,
            transaction
          })
        )
      );

      const results = await EventService.getUpdateEvents({
        where: { type: 'GENERAL' },
        transaction
      });

      expect(results).toHaveLength(1);
      expect(results[0].type).toBe('GENERAL');
    });
  });

  it('should update an existing event', async () => {
    await dbCleaner(async transaction => {
      const eventData = {
        description: 'Original description',
        type: 'GENERAL'
      };

      const created = await EventService.createUpdateEvent({
        values: eventData,
        transaction
      });

      const updated = await EventService.updateUpdateEventById({
        id: created.id,
        values: {
          description: 'Updated description'
        },
        transaction
      });

      expect(updated.id).toBe(created.id);
      expect(updated.description).toBe('Updated description');
      expect(updated.type).toBe(eventData.type);
    });
  });

  it('should delete an existing event', async () => {
    await dbCleaner(async transaction => {
      const eventData = {
        description: 'To be deleted',
        type: 'GENERAL'
      };

      const created = await EventService.createUpdateEvent({
        values: eventData,
        transaction
      });

      await EventService.removeUpdateEventById({
        id: created.id,
        transaction
      });

      const result = await EventService.getUpdateEventById({
        id: created.id,
        transaction
      });

      expect(result).toBeNull();
    });
  });
});

describe('User related event operations', () => {
  const performedByUserId = 1;
  const testerUserId = 2;
  const testerUsername = 'testuser';
  const testPlanReportId = 3;
  const testPlanRunId = 4;
  const fromTesterUserId = 2;
  const fromTesterUsername = 'olduser';
  const toTesterUserId = 3;
  const toTesterUsername = 'newuser';

  it('should create an event for tester assignment', async () => {
    await dbCleaner(async transaction => {
      const event = await EventService.createTesterAssignmentEvent({
        performedByUserId,
        testerUserId,
        testerUsername,
        testPlanReportId,
        testPlanRunId,
        transaction
      });

      expect(event).toBeDefined();
      expect(event.eventType).toBe(EVENT_TYPES.TESTER_ASSIGNMENT);
      expect(event.description).toContain(
        'Tester testuser assigned to test plan run 4 in test plan report 3'
      );
      expect(event.performedByUserId).toBe(performedByUserId);
      expect(event.entityId).toBe(testPlanReportId);
      expect(event.metadata.eventType).toBe(EVENT_TYPES.TESTER_ASSIGNMENT);
      expect(event.metadata.testerUserId).toBe(testerUserId);
      expect(event.metadata.testPlanReportId).toBe(testPlanReportId);
      expect(event.createdAt).toBeDefined();
    });
  });

  it('should create an vent for tester reassignment', async () => {
    await dbCleaner(async transaction => {
      const event = await EventService.createTesterReassignmentEvent({
        performedByUserId,
        fromTesterUserId,
        fromTesterUsername,
        toTesterUserId,
        toTesterUsername,
        testPlanReportId,
        testPlanRunId,
        transaction
      });

      expect(event).toBeDefined();
      expect(event.eventType).toBe(EVENT_TYPES.TESTER_REASSIGNMENT);
      expect(event.description).toContain(
        'Tester reassigned from olduser to newuser'
      );
      expect(event.performedByUserId).toBe(performedByUserId);
      expect(event.entityId).toBe(testPlanReportId);
      expect(event.metadata.eventType).toBe(EVENT_TYPES.TESTER_REASSIGNMENT);
      expect(event.metadata.fromTesterUserId).toBe(fromTesterUserId);
      expect(event.metadata.toTesterUserId).toBe(toTesterUserId);
      expect(event.metadata.testPlanReportId).toBe(testPlanReportId);
      expect(event.metadata.testPlanRunId).toBe(testPlanRunId);
      expect(event.createdAt).toBeDefined();
    });
  });

  it('should create an event for tester removal', async () => {
    await dbCleaner(async transaction => {
      const event = await EventService.createTesterRemovalEvent({
        performedByUserId,
        testerUserId,
        testerUsername,
        testPlanReportId,
        transaction
      });

      expect(event).toBeDefined();
      expect(event.eventType).toBe(EVENT_TYPES.TESTER_REMOVAL);
      expect(event.description).toContain(
        'Tester testuser removed from test plan report'
      );
      expect(event.performedByUserId).toBe(performedByUserId);
      expect(event.entityId).toBe(testPlanReportId);
      expect(event.metadata.eventType).toBe(EVENT_TYPES.TESTER_REMOVAL);
      expect(event.metadata.testerUserId).toBe(testerUserId);
      expect(event.metadata.testPlanReportId).toBe(testPlanReportId);
      expect(event.metadata.testPlanRunId).toBeNull();
      expect(event.createdAt).toBeDefined();
    });
  });

  it('should create an event for tester removal with testPlanRunId', async () => {
    await dbCleaner(async transaction => {
      const event = await EventService.createTesterRemovalEvent({
        performedByUserId,
        testerUserId,
        testerUsername,
        testPlanReportId,
        testPlanRunId,
        transaction
      });

      expect(event).toBeDefined();
      expect(event.eventType).toBe(EVENT_TYPES.TESTER_REMOVAL);
      expect(event.description).toContain(
        'Tester testuser removed from test plan run 4 in test plan report 3'
      );
      expect(event.performedByUserId).toBe(performedByUserId);
      expect(event.entityId).toBe(testPlanReportId);
      expect(event.metadata.eventType).toBe(EVENT_TYPES.TESTER_REMOVAL);
      expect(event.metadata.testerUserId).toBe(testerUserId);
      expect(event.metadata.testPlanReportId).toBe(testPlanReportId);
      expect(event.metadata.testPlanRunId).toBe(testPlanRunId);
      expect(event.createdAt).toBeDefined();
    });
  });

  it('should retrieve events for a test plan report', async () => {
    await dbCleaner(async transaction => {
      // Create test events for assignment and reassignment to verify retrieval
      await EventService.createTesterAssignmentEvent({
        performedByUserId,
        testerUserId,
        testerUsername,
        testPlanReportId,
        testPlanRunId,
        transaction
      });

      await EventService.createTesterReassignmentEvent({
        performedByUserId,
        fromTesterUserId,
        fromTesterUsername,
        toTesterUserId,
        toTesterUsername,
        testPlanReportId,
        testPlanRunId,
        transaction
      });

      const events = await EventService.getEventsForTestPlanReport({
        testPlanReportId,
        transaction
      });

      expect(events).toHaveLength(2);
      expect(events[0].eventType).toBe(EVENT_TYPES.TESTER_ASSIGNMENT);
      expect(events[1].eventType).toBe(EVENT_TYPES.TESTER_REASSIGNMENT);
    });
  });

  it('should retrieve event for a specific tester', async () => {
    await dbCleaner(async transaction => {
      // Create test event for assignment and reassignment to verify tester-specific retrieval
      await EventService.createTesterAssignmentEvent({
        performedByUserId,
        testerUserId,
        testerUsername,
        testPlanReportId,
        testPlanRunId,
        transaction
      });

      await EventService.createTesterReassignmentEvent({
        performedByUserId,
        fromTesterUserId,
        fromTesterUsername,
        toTesterUserId,
        toTesterUsername,
        testPlanReportId,
        testPlanRunId,
        transaction
      });

      const events = await EventService.getEventsForTester({
        testerUserId,
        transaction
      });

      expect(events).toHaveLength(2);
      // First record should be tester assignment (contains testerUserId)
      expect(events[0].metadata.testerUserId).toBe(testerUserId);
      // Second record should be tester reassignment (contains fromTesterUserId and toTesterUserId)
      expect(events[1].metadata.fromTesterUserId).toBe(fromTesterUserId);
      expect(events[1].metadata.toTesterUserId).toBe(toTesterUserId);
    });
  });

  it('should create a custom event', async () => {
    await dbCleaner(async transaction => {
      const eventType = EVENT_TYPES.TESTER_ASSIGNMENT;
      const description = 'Custom test event';
      const performedByUserId = 1;
      const entityId = 123;
      const metadata = { customField: 'test' };

      const event = await EventService.createEvent({
        values: {
          eventType,
          description,
          performedByUserId,
          entityId,
          metadata
        },
        transaction
      });

      expect(event).toBeDefined();
      expect(event.eventType).toBe(eventType);
      expect(event.description).toBe(description);
      expect(event.performedByUserId).toBe(performedByUserId);
      expect(event.entityId).toBe(entityId);
      expect(event.metadata.customField).toBe('test');
      expect(event.createdAt).toBeDefined();
    });
  });
});
