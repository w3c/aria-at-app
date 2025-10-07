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
      const bugId = `${Math.floor(Math.random() * 10000)}`;
      const url = `https://example.com/issues/${bugId}`;

      // Create AtBug via GraphQL
      const createMutation = gql`
        mutation Create($input: AtBugInput!) {
          createAtBug(input: $input) {
            id
            title
            bugId
            url
            at {
              id
              name
            }
          }
        }
      `;

      const createResult = await mutate(createMutation, {
        variables: { input: { title, bugId, url, atId } },
        transaction
      });

      const created = createResult.createAtBug;
      expect(created).toEqual(
        expect.objectContaining({ id: expect.any(String), title, bugId, url })
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
        mutation Link($assertionId: ID!, $atBugIds: [ID]!) {
          linkAtBugsToAssertion(
            assertionId: $assertionId
            atBugIds: $atBugIds
          ) {
            id
            atBugs {
              id
              bugId
              title
              url
            }
          }
        }
      `;

      const linkResult = await mutate(linkMutation, {
        variables: { assertionId: existingAssertionId, atBugIds: [created.id] },
        transaction
      });

      const linkedAssertion = linkResult.linkAtBugsToAssertion;
      expect(linkedAssertion.atBugs).toEqual(
        expect.arrayContaining([expect.objectContaining({ id: created.id })])
      );

      // Unlink bug from assertion
      const unlinkMutation = gql`
        mutation Unlink($assertionId: ID!, $atBugIds: [ID]!) {
          unlinkAtBugsFromAssertion(
            assertionId: $assertionId
            atBugIds: $atBugIds
          ) {
            id
            atBugs {
              id
            }
          }
        }
      `;

      const unlinkResult = await mutate(unlinkMutation, {
        variables: { assertionId: existingAssertionId, atBugIds: [created.id] },
        transaction
      });

      const unlinkedAssertion = unlinkResult.unlinkAtBugsFromAssertion;
      expect(unlinkedAssertion.atBugs).toEqual([]);
    });
  });
});
