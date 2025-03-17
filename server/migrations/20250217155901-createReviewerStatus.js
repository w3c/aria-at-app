'use strict';

const knownVendorUsernames = [
  'BrettLewisVispero',
  'cookiecrook',
  'RFischer-FS',
  'stevefaulkner'
];

const checkIfValidVendorUsername = username => {
  let userId, vendorId, expectedVendorAtId;
  switch (username) {
    case 'BrettLewisVispero':
      userId = 34;
      vendorId = 1;
      expectedVendorAtId = 1;
      break;
    case 'cookiecrook':
      userId = 39;
      vendorId = 4;
      expectedVendorAtId = 3;
      break;
    case 'RFischer-FS':
      userId = 29;
      vendorId = 1;
      expectedVendorAtId = 1;
      break;
    case 'stevefaulkner':
      userId = 33;
      vendorId = 1;
      expectedVendorAtId = 1;
      break;
    default:
      break;
  }
  return [userId, vendorId, expectedVendorAtId];
};

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    return queryInterface.sequelize.transaction(async transaction => {
      // Collect all the TestPlanVersion.tests information to move into ReviewerStatus
      const testPlanVersions = await queryInterface.sequelize.query(
        `select id, tests from "TestPlanVersion"`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      const testPlanReports = await queryInterface.sequelize.query(
        `select id, "testPlanVersionId", "vendorReviewStatus", "atId" from "TestPlanReport"`,
        {
          type: Sequelize.QueryTypes.SELECT,
          transaction
        }
      );

      const reviewerStatuses = [];

      for (const testPlanReport of testPlanReports) {
        const testPlanVersion = testPlanVersions.find(
          ({ id }) => testPlanReport.testPlanVersionId === id
        );

        for (const test of testPlanVersion.tests) {
          if (!test.viewers.length) continue;

          for (const viewer of test.viewers) {
            if (
              !(
                viewer.vendorId ||
                knownVendorUsernames.includes(viewer.username)
              )
            ) {
              continue;
            }

            const [knownVendorUserId, knownVendorVendorId, expectedVendorAtId] =
              checkIfValidVendorUsername(viewer.username);

            if (expectedVendorAtId !== testPlanReport.atId) continue;

            const userId = viewer.id || knownVendorUserId;
            const vendorId = viewer.vendorId || knownVendorVendorId;
            const viewedTests = testPlanVersion.tests
              .filter(({ viewers }) =>
                viewers.find(({ id: viewerId }) => viewerId === userId)
              )
              .map(({ id }) => id);
            const isApproved = testPlanReport.vendorReviewStatus === 'APPROVED';
            const date = new Date();

            let reviewerStatus = {
              userId,
              vendorId,
              testPlanReportId: testPlanReport.id,
              testPlanVersionId: testPlanVersion.id,
              viewedTests,
              reviewStatus: isApproved ? 'APPROVED' : 'IN_PROGRESS',
              approvedAt: isApproved ? date : null,
              createdAt: date,
              updatedAt: date
            };

            const viewerExists = reviewerStatuses.find(
              ({ userId, vendorId, testPlanReportId }) =>
                reviewerStatus.userId === userId &&
                reviewerStatus.vendorId === vendorId &&
                reviewerStatus.testPlanReportId === testPlanReportId
            );

            if (!viewerExists) {
              reviewerStatuses.push(reviewerStatus);
            }
            break;
          }
        }
      }

      // Remove TestPlanVersion.tests[].viewers[]
      const testPlanVersionsWithViewersToRemove = testPlanVersions.map(
        testPlanVersion => {
          testPlanVersion.tests.forEach(test => delete test.viewers);
          return testPlanVersion;
        }
      );
      for (const testPlanVersion of testPlanVersionsWithViewersToRemove) {
        await queryInterface.sequelize.query(
          `update "TestPlanVersion" set "tests" = ? where id = ?`,
          {
            replacements: [
              JSON.stringify(testPlanVersion.tests),
              testPlanVersion.id
            ],
            transaction
          }
        );
      }

      // Remove TestPlanReport.vendorReviewStatus column
      await queryInterface.removeColumn(
        'TestPlanReport',
        'vendorReviewStatus',
        { transaction }
      );

      await queryInterface.createTable(
        'ReviewerStatus',
        {
          userId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
              model: 'User',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          vendorId: {
            type: Sequelize.INTEGER,
            allowNull: true,
            references: {
              model: 'Vendor',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          testPlanReportId: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            allowNull: false,
            references: {
              model: 'TestPlanReport',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          testPlanVersionId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
              model: 'TestPlanVersion',
              key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
          },
          viewedTests: {
            type: Sequelize.ARRAY(Sequelize.TEXT),
            defaultValue: [],
            allowNull: false
          },
          reviewStatus: {
            type: Sequelize.TEXT,
            allowNull: true,
            defaultValue: 'IN_PROGRESS'
          },
          approvedAt: {
            type: Sequelize.DATE,
            defaultValue: null,
            allowNull: true
          },
          createdAt: { type: Sequelize.DATE },
          updatedAt: { type: Sequelize.DATE }
        },
        {
          transaction
        }
      );

      if (reviewerStatuses.length) {
        await queryInterface.bulkInsert('ReviewerStatus', reviewerStatuses, {
          transaction
        });
      }
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('ReviewerStatus');
    await queryInterface.addColumn('TestPlanReport', 'vendorReviewStatus', {
      type: Sequelize.TEXT,
      defaultValue: null,
      allowNull: true
    });
  }
};
