'use strict';

module.exports = {
    up: async (/* queryInterface, Sequelize */) => {
        // Add the columns for atId and browserId to TestPlanReport table, and
        // populate them with the atId and browserId which used to be in the
        // TestPlanTarget table. This may require raw SQL due to the fact that
        // the TestPlanTarget association was already removed from the code.
        //
        // Remove the TestPlanTarget table.
        //
        // Remove all existing AtVersions and BrowserVersions and replace with
        // the most recent versions minus one (e.g. Chrome is at version 100
        // right now so it would be Chrome 99.01.03. Replace 01 and 03 with real
        // values).
        //
        // Loop over all the TestPlanRuns. Then loop over all the TestResults
        // in each TestPlanRun. Then add populated atVersionId and
        // browserVersionId fields.
    }
};
