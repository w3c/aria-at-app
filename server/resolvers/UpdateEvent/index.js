const { UpdateEvent } = require('../../models');

const updateEventResolvers = {
  Query: {
    updateEvents: async (_, { type }, { transaction }) => {
      try {
        const where = type ? { type } : {};
        const events = await UpdateEvent.findAll({
          where,
          order: [['timestamp', 'DESC']],
          transaction
        });

        // Always return an array, never null
        return events.map(event => {
          const json = event.toJSON();
          return {
            ...json,
            // Ensure required fields are never null
            id: json.id || 0,
            timestamp: event.timestamp
              ? event.timestamp.toISOString()
              : new Date().toISOString(),
            description: json.description || '',
            type: json.type || 'GENERAL',
            metadata: json.metadata || {}
          };
        });
      } catch (error) {
        console.error('Error in updateEvents resolver:', error);
        // Return empty array instead of null on error
        return [];
      }
    },
    updateEvent: async (_, { id }, { transaction }) => {
      const event = await UpdateEvent.findByPk(id, { transaction });
      if (!event) return null;
      const json = event.toJSON();
      return {
        ...json,
        timestamp: event.timestamp.toISOString()
      };
    }
  },

  Mutation: {
    createUpdateEvent: async (
      _,
      { description, type = 'GENERAL', metadata = {} },
      { transaction }
    ) => {
      const event = await UpdateEvent.create(
        {
          description,
          type,
          metadata
        },
        { transaction }
      );
      const json = event.toJSON();
      return {
        ...json,
        timestamp: event.timestamp.toISOString()
      };
    }
  }
};

const updateEvents = updateEventResolvers.Query.updateEvents;
const updateEvent = updateEventResolvers.Query.updateEvent;
const createUpdateEvent = updateEventResolvers.Mutation.createUpdateEvent;

module.exports = {
  updateEvents,
  updateEvent,
  createUpdateEvent
};
