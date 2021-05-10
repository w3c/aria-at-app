/* eslint-disable jest/expect-expect */

const models = require('../../models');
const {
    assertModelNames,
    assertModelRelationships,
    assertModelProperties
} = require('../util/modelTestHelpers');

describe('sequelize', () => {
    it('contains the expected models', () => {
        assertModelNames(models, [
            'TestPlan',
            'TestPlanReport',
            'TestPlanRun',
            'TestedConfiguration',
            'TestResult',
            'User',
            'UserRole',
            'Role',
            'Browser',
            'BrowserVersion',
            'At',
            'AtMode',
            'AtModeForAt',
            'AtVersion'
        ]);
    });

    it('defines the expected relationships between models', () => {
        assertModelRelationships(models, {
            TestPlan: [{ hasOne: 'TestPlanReport' }],
            TestPlanReport: [
                { belongsTo: 'TestPlan' },
                { belongsTo: 'TestedConfiguration' },
                { hasMany: 'TestPlanRun' }
            ],
            TestPlanRun: [
                { belongsTo: 'TestPlanReport' },
                { belongsTo: 'User', as: 'tester' },
                { hasMany: 'TestResult' }
            ],
            TestedConfiguration: [
                { hasOne: 'TestPlanReport' },
                { belongsTo: 'At' },
                { belongsTo: 'AtVersion' },
                { belongsTo: 'Browser' },
                { belongsTo: 'BrowserVersion' }
            ],
            User: [{ hasMany: 'Role', through: 'UserRole' }],
            Role: [{ belongsToMany: 'User', through: 'UserRole' }],
            At: [
                { hasMany: 'AtVersion' },
                { hasMany: 'TestedConfiguration' },
                { hasMany: 'AtMode', through: 'AtModeForAt' }
            ],
            AtVersion: [{ belongsTo: 'At' }],
            AtMode: [{ belongsToMany: 'At', through: 'AtModeForAt' }],
            Browser: [{ hasMany: 'BrowserVersion' }],
            BrowserVersion: [
                { belongsTo: 'Browser' },
                { hasMany: 'TestedConfiguration' }
            ]
        });
    });

    it('defines the expected non-relationship properties', () => {
        assertModelProperties(models, {
            TestPlan: [
                'id',
                'title',
                'publishStatus',
                'revision',
                'sourceGitCommit',
                'exampleUrl',
                'createdAt'
            ],
            TestPlanReport: [
                'id',
                'publishStatus',
                'coveragePercent',
                'createdAt'
            ],
            TestPlanRun: ['id', 'isManuallyTested'],
            TestedConfiguration: ['id', 'title', 'publishStatus'],
            TestResult: ['startedAt', 'completedAt', 'data'],
            User: ['username'],
            UserRole: [],
            Role: ['name'],
            Browser: ['id', 'name'],
            BrowserVersion: ['version'],
            At: ['id', 'name'],
            AtMode: ['name'],
            AtModeForAt: [],
            AtVersion: ['version']
        });
    });
});
