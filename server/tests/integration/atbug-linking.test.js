const { gql } = require('apollo-server');
const { sequelize } = require('../../models');
const dbCleaner = require('../util/db-cleaner');
const randomStringGenerator = require('../util/random-character-generator');
const { mutate, query } = require('../util/graphql-test-utilities');

afterAll(async () => {
  await sequelize.close();
});

describe('AT Bug linking - GraphQL integration', () => {
  it('creates an AT bug and links/unlinks it to an assertion via GraphQL', async () => {
    await dbCleaner(async transaction => {
      // Use existing AT and an existing Assertion from the seeded DB
      const { ats } = await query(
        gql`
          query {
            ats {
              id
              name
            }
          }
        `,
        { transaction }
      );
      const atId = ats[0].id;
      const title = `Bug ${randomStringGenerator()}`;
      const url = `https://example.com/issues/${Math.floor(
        Math.random() * 10000
      )}`;

      // Create AtBug via GraphQL
      const createMutation = gql`
        mutation Create($input: AtBugInput!) {
          createAtBug(input: $input) {
            id
            title
            url
            at {
              id
              name
            }
          }
        }
      `;

      const createResult = await mutate(createMutation, {
        variables: { input: { title, url, atId } },
        transaction
      });

      const created = createResult.createAtBug;
      expect(created).toEqual(
        expect.objectContaining({ id: expect.any(String), title, url })
      );

      // Get a numeric assertionId via service (GraphQL assertion ids are encoded strings)
      const {
        getAssertionsByTestPlanVersionId
      } = require('../../models/services/AssertionService');
      const assertions = await getAssertionsByTestPlanVersionId({
        testPlanVersionId: 1,
        transaction
      });
      const existingAssertionId = assertions[0].id;

      // Link bug to assertion
      const linkMutation = gql`
        mutation Link(
          $assertionId: ID!
          $atBugIds: [ID]!
          $commandId: String!
        ) {
          linkAtBugsToAssertion(
            assertionId: $assertionId
            atBugIds: $atBugIds
            commandId: $commandId
          ) {
            id
            atBugs {
              id
              title
              url
            }
          }
        }
      `;

      const linkResult = await mutate(linkMutation, {
        variables: {
          assertionId: existingAssertionId,
          atBugIds: [created.id],
          commandId: 'test-command'
        },
        transaction
      });

      const linkedAssertion = linkResult.linkAtBugsToAssertion;
      expect(linkedAssertion.atBugs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })])
      );

      // Unlink bug from assertion
      const unlinkMutation = gql`
        mutation Unlink(
          $assertionId: ID!
          $atBugIds: [ID]!
          $commandId: String!
        ) {
          unlinkAtBugsFromAssertion(
            assertionId: $assertionId
            atBugIds: $atBugIds
            commandId: $commandId
          ) {
            id
            atBugs {
              id
            }
          }
        }
      `;

      const unlinkResult = await mutate(unlinkMutation, {
        variables: {
          assertionId: existingAssertionId,
          atBugIds: [created.id],
          commandId: 'test-command'
        },
        transaction
      });

      const unlinkedAssertion = unlinkResult.unlinkAtBugsFromAssertion;
      expect(unlinkedAssertion.atBugs).toEqual([]);
    });
  });

  it('links the same bug to the same assertion with different command IDs', async () => {
    await dbCleaner(async transaction => {
      const { ats } = await query(
        gql`
          query {
            ats {
              id
              name
            }
          }
        `,
        { transaction }
      );
      const atId = ats[0].id;
      const title = `Bug ${randomStringGenerator()}`;
      const url = `https://example.com/issues/${Math.floor(
        Math.random() * 10000
      )}`;

      const createMutation = gql`
        mutation Create($input: AtBugInput!) {
          createAtBug(input: $input) {
            id
            title
            url
          }
        }
      `;

      const createResult = await mutate(createMutation, {
        variables: { input: { title, url, atId } },
        transaction
      });

      const bugId = createResult.createAtBug.id;

      const {
        getAssertionsByTestPlanVersionId
      } = require('../../models/services/AssertionService');
      const assertions = await getAssertionsByTestPlanVersionId({
        testPlanVersionId: 1,
        transaction
      });
      const assertionId = assertions[0].id;

      const linkMutation = gql`
        mutation Link(
          $assertionId: ID!
          $atBugIds: [ID]!
          $commandId: String!
        ) {
          linkAtBugsToAssertion(
            assertionId: $assertionId
            atBugIds: $atBugIds
            commandId: $commandId
          ) {
            id
            atBugs {
              id
              title
              url
            }
          }
        }
      `;

      const linkWithCommandId = await mutate(linkMutation, {
        variables: {
          assertionId,
          atBugIds: [bugId],
          commandId: 'command-1'
        },
        transaction
      });

      expect(linkWithCommandId.linkAtBugsToAssertion.atBugs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: bugId })])
      );

      const linkWithDifferentCommandId = await mutate(linkMutation, {
        variables: {
          assertionId,
          atBugIds: [bugId],
          commandId: 'command-2'
        },
        transaction
      });

      expect(linkWithDifferentCommandId.linkAtBugsToAssertion.atBugs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: bugId })])
      );

      const { AssertionAtBug } = require('../../models');
      const allLinks = await AssertionAtBug.findAll({
        where: { assertionId, atBugId: bugId },
        transaction
      });

      // Should have 2 links: one with 'command-1', one with 'command-2'
      // This verifies that Assertion A + Bug B + Command C is distinct from Assertion A + Bug B + Command D
      expect(allLinks).toHaveLength(2);
      const commandIds = allLinks.map(link => link.commandId).sort();
      expect(commandIds).toEqual(['command-1', 'command-2']);
    });
  });
});
