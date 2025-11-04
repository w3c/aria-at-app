const { sequelize } = require('../../../models');
const AssertionService = require('../../../models/services/AssertionService');
const TestPlanVersionService = require('../../../models/services/TestPlanVersionService');
const randomStringGenerator = require('../../util/random-character-generator');
const dbCleaner = require('../../util/db-cleaner');

afterAll(async () => {
  await sequelize.close();
});

describe('AssertionService Data Checks', () => {
  let testTestPlanVersion;

  // Get an existing TestPlanVersion to use for testing
  beforeAll(async () => {
    const testPlanVersions = await TestPlanVersionService.getTestPlanVersions({
      transaction: false
    });
    testTestPlanVersion = testPlanVersions[0];
  });

  it('should create and query assertions by testPlanVersionId', async () => {
    await dbCleaner(async transaction => {
      // Create test assertions
      const assertionsData = [
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId: 'test-id-1',
          assertionIndex: 0,
          priority: 'MUST',
          text: 'Test assertion 1',
          encodedId: `encoded-${randomStringGenerator()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId: 'test-id-1',
          assertionIndex: 1,
          priority: 'SHOULD',
          text: 'Test assertion 2',
          encodedId: `encoded-${randomStringGenerator()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await AssertionService.bulkCreateAssertions({
        assertionsData,
        transaction
      });

      // Query by testPlanVersionId
      const assertions =
        await AssertionService.getAssertionsByTestPlanVersionId({
          testPlanVersionId: testTestPlanVersion.id,
          transaction
        });

      expect(assertions).toBeInstanceOf(Array);
      expect(assertions.length).toBeGreaterThanOrEqual(2);
      expect(assertions).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            testPlanVersionId: testTestPlanVersion.id,
            testId: 'test-id-1',
            priority: expect.any(String)
          })
        ])
      );
    });
  });

  it('should create and query assertions by testId', async () => {
    await dbCleaner(async transaction => {
      const testId = `test-${randomStringGenerator()}`;
      const assertionsData = [
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId,
          assertionIndex: 0,
          priority: 'MUST',
          text: 'Assertion for testId query',
          encodedId: `encoded-${randomStringGenerator()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await AssertionService.bulkCreateAssertions({
        assertionsData,
        transaction
      });

      // Query by testId
      const assertions = await AssertionService.getAssertionsByTestId({
        testId,
        transaction
      });

      expect(assertions).toBeInstanceOf(Array);
      expect(assertions.length).toBe(1);
      expect(assertions[0]).toEqual(
        expect.objectContaining({
          testId,
          assertionIndex: 0,
          priority: 'MUST',
          text: 'Assertion for testId query'
        })
      );
    });
  });

  it('should query assertion by encodedId', async () => {
    await dbCleaner(async transaction => {
      const encodedId = `encoded-${randomStringGenerator()}`;
      const assertionsData = [
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId: 'test-for-encoded-id',
          assertionIndex: 0,
          priority: 'MUST',
          text: 'Assertion with encodedId',
          encodedId,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await AssertionService.bulkCreateAssertions({
        assertionsData,
        transaction
      });

      // Query by encodedId
      const assertion = await AssertionService.getAssertionByEncodedId({
        encodedId,
        transaction
      });

      expect(assertion).toBeTruthy();
      expect(assertion.encodedId).toBe(encodedId);
      expect(assertion.text).toBe('Assertion with encodedId');
    });
  });

  it('should create assertion with v2 format fields', async () => {
    await dbCleaner(async transaction => {
      const assertionsData = [
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId: 'test-v2-format',
          assertionIndex: 0,
          priority: 'MUST',
          rawAssertionId: 'raw-assertion-123',
          assertionStatement: 'convey name "checkbox"',
          assertionPhrase: 'convey role',
          assertionExceptions: [
            {
              priority: 'SHOULD',
              commandId: 'cmd-1',
              settings: 'reading'
            }
          ],
          encodedId: `encoded-v2-${randomStringGenerator()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      const created = await AssertionService.bulkCreateAssertions({
        assertionsData,
        transaction
      });

      expect(created).toBeInstanceOf(Array);
      expect(created[0]).toEqual(
        expect.objectContaining({
          rawAssertionId: 'raw-assertion-123',
          assertionStatement: 'convey name "checkbox"',
          assertionPhrase: 'convey role',
          assertionExceptions: expect.arrayContaining([
            expect.objectContaining({
              priority: 'SHOULD',
              commandId: 'cmd-1'
            })
          ])
        })
      );
    });
  });

  it('should create single assertion', async () => {
    await dbCleaner(async transaction => {
      const encodedId = `encoded-single-${randomStringGenerator()}`;
      const assertion = await AssertionService.createAssertion({
        values: {
          testPlanVersionId: testTestPlanVersion.id,
          testId: 'test-single',
          assertionIndex: 0,
          priority: 'SHOULD',
          text: 'Single assertion',
          encodedId
        },
        transaction
      });

      expect(assertion).toBeTruthy();
      expect(assertion.id).toBeTruthy();
      expect(assertion.encodedId).toBe(encodedId);
      expect(assertion.priority).toBe('SHOULD');
    });
  });

  it('should update assertion by id', async () => {
    await dbCleaner(async transaction => {
      const encodedId = `encoded-update-${randomStringGenerator()}`;
      const assertion = await AssertionService.createAssertion({
        values: {
          testPlanVersionId: testTestPlanVersion.id,
          testId: 'test-update',
          assertionIndex: 0,
          priority: 'MUST',
          text: 'Original text',
          encodedId
        },
        transaction
      });

      const updated = await AssertionService.updateAssertionById({
        id: assertion.id,
        values: {
          text: 'Updated text',
          priority: 'SHOULD'
        },
        transaction
      });

      expect(updated[0]).toBe(1); // Number of rows updated
    });
  });

  it('should delete assertion by id', async () => {
    await dbCleaner(async transaction => {
      const encodedId = `encoded-delete-${randomStringGenerator()}`;
      const assertion = await AssertionService.createAssertion({
        values: {
          testPlanVersionId: testTestPlanVersion.id,
          testId: 'test-delete',
          assertionIndex: 0,
          priority: 'MAY',
          text: 'To be deleted',
          encodedId
        },
        transaction
      });

      const deleteCount = await AssertionService.deleteAssertionById({
        id: assertion.id,
        transaction
      });

      expect(deleteCount).toBe(1);

      // Verify deletion
      const deleted = await AssertionService.getAssertionById({
        id: assertion.id,
        transaction
      });

      expect(deleted).toBeNull();
    });
  });

  it('should return null for non-existent encodedId', async () => {
    const assertion = await AssertionService.getAssertionByEncodedId({
      encodedId: 'non-existent-encoded-id',
      transaction: false
    });

    expect(assertion).toBeNull();
  });

  it('should return empty array for non-existent testId', async () => {
    const assertions = await AssertionService.getAssertionsByTestId({
      testId: 'non-existent-test-id',
      transaction: false
    });

    expect(assertions).toBeInstanceOf(Array);
    expect(assertions.length).toBe(0);
  });

  it('should order assertions by assertionIndex when querying by testId', async () => {
    await dbCleaner(async transaction => {
      const testId = `test-order-${randomStringGenerator()}`;
      const assertionsData = [
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId,
          assertionIndex: 2,
          priority: 'MUST',
          text: 'Third assertion',
          encodedId: `encoded-${randomStringGenerator()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId,
          assertionIndex: 0,
          priority: 'MUST',
          text: 'First assertion',
          encodedId: `encoded-${randomStringGenerator()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        },
        {
          testPlanVersionId: testTestPlanVersion.id,
          testId,
          assertionIndex: 1,
          priority: 'SHOULD',
          text: 'Second assertion',
          encodedId: `encoded-${randomStringGenerator()}`,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      ];

      await AssertionService.bulkCreateAssertions({
        assertionsData,
        transaction
      });

      const assertions = await AssertionService.getAssertionsByTestId({
        testId,
        transaction
      });

      expect(assertions.length).toBe(3);
      expect(assertions[0].assertionIndex).toBe(0);
      expect(assertions[1].assertionIndex).toBe(1);
      expect(assertions[2].assertionIndex).toBe(2);
      expect(assertions[0].text).toBe('First assertion');
      expect(assertions[1].text).toBe('Second assertion');
      expect(assertions[2].text).toBe('Third assertion');
    });
  });
});
