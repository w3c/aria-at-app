'use strict';

module.exports = {
    up: async queryInterface => {
        // Drop the primary key constraint to enable changing the 'id' column type
        await queryInterface.sequelize.query(
            `ALTER TABLE "CollectionJob" DROP CONSTRAINT "CollectionJob_pkey";`
        );

        // Change the 'id' column type to INTEGER
        await queryInterface.sequelize.query(
            `ALTER TABLE "CollectionJob" ALTER COLUMN "id" TYPE INTEGER USING ("id"::integer);`
        );

        // Create a sequence for auto-increment
        await queryInterface.sequelize.query(
            `CREATE SEQUENCE collectionjob_id_seq AS INTEGER;`
        );

        // Set the default value of 'id' to the next value of the sequence
        await queryInterface.sequelize.query(
            `ALTER TABLE "CollectionJob" ALTER COLUMN "id" SET DEFAULT nextval('collectionjob_id_seq');`
        );

        // Ensure that the sequence starts from the next value of the current maximum 'id'
        await queryInterface.sequelize.query(`
            SELECT setval(pg_get_serial_sequence('"CollectionJob"', 'id'), 
            COALESCE((SELECT MAX("id") FROM "CollectionJob"), 0) + 1);
        `);

        // Set the sequence as the owner of the 'id' column
        await queryInterface.sequelize.query(
            `ALTER SEQUENCE collectionjob_id_seq OWNED BY "CollectionJob"."id";`
        );

        // Add the primary key constraint back
        await queryInterface.sequelize.query(
            `ALTER TABLE "CollectionJob" ADD PRIMARY KEY ("id");`
        );
    },

    down: async queryInterface => {
        // Remove the primary key constraint
        await queryInterface.sequelize.query(
            `ALTER TABLE "CollectionJob" DROP CONSTRAINT "CollectionJob_pkey";`
        );

        // Drop the sequence created for auto-increment
        await queryInterface.sequelize.query(
            `DROP SEQUENCE collectionjob_id_seq;`
        );

        // Revert the 'id' column back to STRING
        await queryInterface.sequelize.query(
            `ALTER TABLE "CollectionJob" ALTER COLUMN "id" TYPE VARCHAR USING ("id"::text);`
        );

        // Add the primary key constraint back
        await queryInterface.sequelize.query(
            `ALTER TABLE "CollectionJob" ADD PRIMARY KEY ("id");`
        );
    }
};
