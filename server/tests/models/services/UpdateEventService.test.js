const { sequelize } = require('../../../models');
const UpdateEventService = require('../../../models/services/UpdateEventService');
const dbCleaner = require('../../util/db-cleaner');

afterAll(async () => {
  await sequelize.close();
});

describe('UpdateEventService', () => {
  it('should create an update event', async () => {
    await dbCleaner(async transaction => {
      const eventData = {
        description: 'Test update event',
        type: 'GENERAL'
      };

      const result = await UpdateEventService.createUpdateEvent({
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

      const result = await UpdateEventService.createUpdateEvent({
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

      const created = await UpdateEventService.createUpdateEvent({
        values: eventData,
        transaction
      });

      const result = await UpdateEventService.getUpdateEventById({
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
      const result = await UpdateEventService.getUpdateEventById({
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
          UpdateEventService.createUpdateEvent({
            values: event,
            transaction
          })
        )
      );

      const results = await UpdateEventService.getUpdateEvents({
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
          UpdateEventService.createUpdateEvent({
            values: event,
            transaction
          })
        )
      );

      const results = await UpdateEventService.getUpdateEvents({
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

      const created = await UpdateEventService.createUpdateEvent({
        values: eventData,
        transaction
      });

      const updated = await UpdateEventService.updateUpdateEventById({
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

      const created = await UpdateEventService.createUpdateEvent({
        values: eventData,
        transaction
      });

      await UpdateEventService.removeUpdateEventById({
        id: created.id,
        transaction
      });

      const result = await UpdateEventService.getUpdateEventById({
        id: created.id,
        transaction
      });

      expect(result).toBeNull();
    });
  });
});
