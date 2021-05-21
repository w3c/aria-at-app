const { sequelize } = require('../../../models');
const AtService = require('../../../models/services/AtService');
const randomStringGenerator = require('../../util/random-character-generator');
const { dbCleaner } = require('../../util/db-cleaner');

afterAll(async () => {
    await sequelize.close(); // close connection to database
});

describe('AtModel Data Checks', () => {
    it('should return valid at for id query', async () => {
        const _id = 1;

        const at = await AtService.getAtById(_id);
        const { id, name } = at;

        expect(id).toEqual(_id);
        expect(name).toEqual('JAWS');
    });

    it('should not be valid at query', async () => {
        const _id = 53935;

        const at = await AtService.getAtById(_id);
        expect(at).toBeNull();
    });

    it('should contain valid at with versions array', async () => {
        const _id = 1;

        const at = await AtService.getAtById(_id);
        const { versions } = at;

        expect(at).toHaveProperty('versions');
        expect(versions.length).toBeGreaterThanOrEqual(0);
    });

    it('should contain valid at with modes array', async () => {
        const _id = 1;

        const at = await AtService.getAtById(_id);
        const { modes } = at;

        expect(at).toHaveProperty('modes');
        expect(modes.length).toBeGreaterThanOrEqual(0);
    });

    it('should create and remove a new at', async () => {
        await dbCleaner(async () => {
            // A1
            const _name = randomStringGenerator();

            // A2
            const at = await AtService.createAt({ name: _name });
            const { id, name } = at;

            // A3
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // A2
            await AtService.removeAt(id);
            const deletedAt = await AtService.getAtById(id);

            // A3
            expect(deletedAt).toBeNull();
        });
    });

    it('should create and update a new at', async () => {
        await dbCleaner(async () => {
            // A1
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();

            // A2
            const at = await AtService.createAt({ name: _name });
            const { id, name } = at;

            // A3
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // A2
            const updatedAt = await AtService.updateAt(id, {
                name: _updatedName
            });
            const { name: updatedName } = updatedAt;

            // A3
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return collection of ats', async () => {
        const result = await AtService.getAts('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of users for name query', async () => {
        const search = 'nvd';

        const result = await AtService.getAts(search, {});
        const result0thIndex = result[0];

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result0thIndex).toHaveProperty('id');
        expect(result0thIndex).toHaveProperty('name');
        expect(result0thIndex.name).toMatch(/nvd/gi);
    });

    it('should return collection of ats with paginated structure', async () => {
        const result = await AtService.getAts('', {}, ['name'], [], [], {
            enablePagination: true
        });
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});

describe('AtVersionModel Data Checks', () => {
    it('should return valid atVersion for query', async () => {
        const _at = 1;
        const _version = '2021.2103.174';

        const atVersion = await AtService.getAtVersionByQuery({
            at: _at,
            version: _version
        });
        const { at, version } = atVersion;

        expect(at).toBeTruthy();
        expect(version).toBeTruthy();
    });

    it('should not be valid atVersion query', async () => {
        const _at = 53935;
        const _version = randomStringGenerator();

        const atVersion = await AtService.getAtVersionByQuery({
            at: _at,
            version: _version
        });
        expect(atVersion).toBeNull();
    });

    it('should contain valid atVersion with atObject', async () => {
        const _at = 1;
        const _version = '2021.2103.174';

        const atVersion = await AtService.getAtVersionByQuery({
            at: _at,
            version: _version
        });
        const { atObject } = atVersion;

        expect(atVersion).toHaveProperty('atObject');
        expect(atObject).toHaveProperty('id');
        expect(atObject).toHaveProperty('name');
    });

    it('should create and remove a new atVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _at = 1;
            const _version = randomStringGenerator();

            // A2
            const atVersion = await AtService.createAtVersion({
                at: _at,
                version: _version
            });
            const { at, version, atObject } = atVersion;

            // A3
            expect(at).toEqual(_at);
            expect(version).toEqual(_version);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // A2
            await AtService.removeAtVersionByQuery({ at, version });
            const deletedAtVersion = await AtService.getAtVersionByQuery({
                at,
                version
            });

            // A3
            expect(deletedAtVersion).toBeNull();
        });
    });

    it('should create and update a new atVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _at = 1;
            const _version = randomStringGenerator();
            const _updatedVersion = randomStringGenerator();

            // A2
            const atVersion = await AtService.createAtVersion({
                at: _at,
                version: _version
            });
            const { at, version, atObject } = atVersion;

            // A3
            expect(at).toEqual(_at);
            expect(version).toEqual(_version);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // A2
            const updatedAtVersion = await AtService.updateAtVersionByQuery(
                { at, version },
                { version: _updatedVersion }
            );
            const { version: updatedVersion } = updatedAtVersion;

            // A3
            expect(_version).not.toEqual(_updatedVersion);
            expect(version).not.toEqual(updatedVersion);
            expect(updatedVersion).toEqual(_updatedVersion);
        });
    });

    it('should return collection of atVersions', async () => {
        const result = await AtService.getAtVersions('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of atVersions for version query', async () => {
        const search = '2019';

        const result = await AtService.getAtVersions(search, {});
        const result0thIndex = result[0];

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result0thIndex).toHaveProperty('version');
        expect(result0thIndex.version).toMatch(/2019/gi);
    });

    it('should return collection of atVersions with paginated structure', async () => {
        const result = await AtService.getAtVersions('', {}, ['version'], [], {
            enablePagination: true
        });
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});

describe('AtModeModel Data Checks', () => {
    it('should return valid atMode for query', async () => {
        const _at = 1;
        const _name = 'reading';

        const atMode = await AtService.getAtModeByQuery({
            at: _at,
            name: _name
        });
        const { at, name } = atMode;

        expect(at).toBeTruthy();
        expect(name).toBeTruthy();
    });

    it('should not be valid atMode query', async () => {
        const _at = 53935;
        const _name = randomStringGenerator();

        const atMode = await AtService.getAtModeByQuery({
            at: _at,
            name: _name
        });
        expect(atMode).toBeNull();
    });

    it('should contain valid atMode with atObject', async () => {
        const _at = 1;
        const _name = 'reading';

        const atMode = await AtService.getAtModeByQuery({
            at: _at,
            name: _name
        });
        const { atObject } = atMode;

        expect(atMode).toHaveProperty('atObject');
        expect(atObject).toHaveProperty('id');
        expect(atObject).toHaveProperty('name');
    });

    it('should create and remove a new atMode', async () => {
        await dbCleaner(async () => {
            // A1
            const _at = 1;
            const _name = randomStringGenerator();

            // A2
            const atMode = await AtService.createAtMode({
                at: _at,
                name: _name
            });
            const { at, name, atObject } = atMode;

            // A3
            expect(at).toEqual(_at);
            expect(name).toEqual(_name);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // A2
            await AtService.removeAtModeByQuery({ at, name });
            const deletedAtMode = await AtService.getAtModeByQuery({
                at,
                name
            });

            // A3
            expect(deletedAtMode).toBeNull();
        });
    });

    it('should create and update a new atMode', async () => {
        await dbCleaner(async () => {
            // A1
            const _at = 1;
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();

            // A2
            const atMode = await AtService.createAtMode({
                at: _at,
                name: _name
            });
            const { at, name, atObject } = atMode;

            // A3
            expect(at).toEqual(_at);
            expect(name).toEqual(_name);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // A2
            const updatedMode = await AtService.updateAtModeByQuery(
                { at, name },
                {
                    name: _updatedName
                }
            );
            const { name: updatedName } = updatedMode;

            // A3
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return collection of atModes', async () => {
        const result = await AtService.getAtModes('', {});
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of atModes for name query', async () => {
        const search = 'rea';

        const result = await AtService.getAtModes(search, {});
        const result0thIndex = result[0];

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result0thIndex).toHaveProperty('name');
        expect(result0thIndex.name).toMatch(/rea/gi);
    });

    it('should return collection of atModes with paginated structure', async () => {
        const result = await AtService.getAtModes('', {}, ['name'], [], {
            enablePagination: true
        });
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});
