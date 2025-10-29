const { sequelize } = require('../../../models');
const dbCleaner = require('../../util/db-cleaner');
const randomStringGenerator = require('../../util/random-character-generator');
const AtBugService = require('../../../models/services/AtBugService');
const AssertionService = require('../../../models/services/AssertionService');

afterAll(async () => {
  await sequelize.close();
});

describe('AtBugService Data Checks', () => {
  it('should create, read, update and delete an AtBug', async () => {
    await dbCleaner(async transaction => {
      // A1
      const atId = 1;
      const title = `Bug ${randomStringGenerator()}`;
      const url = `https://example.com/issues/${Math.floor(
        Math.random() * 10000
      )}`;

      // A2 - create
      const created = await AtBugService.createAtBug({
        values: { title, url, atId },
        transaction
      });

      expect(created).toEqual(
        expect.objectContaining({
          id: expect.any(Number),
          title,
          url,
          atId
        })
      );

      const { id } = created;

      // A2 - getById
      const fetched = await AtBugService.getAtBugById({ id, transaction });
      expect(fetched).toEqual(
        expect.objectContaining({ id, title, url, atId })
      );

      // A2 - update
      const newTitle = `${title} (updated)`;
      await AtBugService.updateAtBugById({
        id,
        values: { title: newTitle },
        transaction
      });
      const updated = await AtBugService.getAtBugById({ id, transaction });
      expect(updated.title).toEqual(newTitle);

      // A2 - delete
      const deletedCount = await AtBugService.deleteAtBugById({
        id,
        transaction
      });
      expect(deletedCount).toBe(1);
      const deleted = await AtBugService.getAtBugById({ id, transaction });
      expect(deleted).toBeNull();
    });
  });

  it('should list AtBugs by atId', async () => {
    await dbCleaner(async transaction => {
      const atId = 1;
      const title = `Bug ${randomStringGenerator()}`;
      const url = `https://example.com/issues/${Math.floor(
        Math.random() * 10000
      )}`;

      const created = await AtBugService.createAtBug({
        values: { title, url, atId },
        transaction
      });

      const list = await AtBugService.getAtBugsByAtId({ atId, transaction });
      expect(list).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ id: created.id, atId })
        ])
      );
    });
  });

  it('should link and unlink AtBugs to an Assertion', async () => {
    await dbCleaner(async transaction => {
      // Create a bug
      const atId = 1;
      const bug = await AtBugService.createAtBug({
        values: {
          title: `Bug ${randomStringGenerator()}`,
          url: `https://example.com/issues/${Math.floor(
            Math.random() * 10000
          )}`,
          atId
        },
        transaction
      });

      // Create minimal assertion
      // Insert an Assertion via service for an existing test plan version
      const assertion = await AssertionService.createAssertion({
        values: {
          testPlanVersionId: 1,
          testId: 'singleTest',
          assertionIndex: Math.floor(Math.random() * 1000),
          priority: 'MUST',
          text: 'Convey role',
          encodedId: `${Date.now()}_${Math.random()}`
        },
        transaction
      });

      const linked = await AssertionService.linkAtBugsToAssertion({
        assertionId: assertion.id,
        atBugIds: [bug.id],
        commandId: 'test-command',
        transaction
      });

      expect(linked.atBugs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: bug.id })])
      );

      const unlinked = await AssertionService.unlinkAtBugsFromAssertion({
        assertionId: assertion.id,
        atBugIds: [bug.id],
        commandId: 'test-command',
        transaction
      });

      expect(unlinked.atBugs).toEqual([]);
    });
  });
});
