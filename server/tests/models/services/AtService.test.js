const { sequelize } = require('../../../models');
const AtService = require('../../../models/services/AtService');
const randomStringGenerator = require('../../util/random-character-generator');
const { dbCleaner } = require('../../util/db-cleaner');

afterAll(async () => {
    await sequelize.close(); // close connection to database
});

describe('AtModel Data Checks', () => {
    it('should return valid at for id query', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById(_id);
        const { id, name } = at;

        // A3
        expect(id).toEqual(_id);
        expect(at).toEqual(
            expect.objectContaining({
                name,
                id: expect.any(Number)
            })
        );
    });

    it('should not be valid at query', async () => {
        // A1
        const _id = 53935;

        // A2
        const at = await AtService.getAtById(_id);

        // A3
        expect(at).toBeNull();
    });

    it('should contain valid at with versions array', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById(_id);
        const { versions } = at;

        // A3
        expect(versions).toBeInstanceOf(Array);
        expect(versions.length).toBeGreaterThanOrEqual(1);
    });

    it('should contain valid at with modes array', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById(_id);
        const { modes } = at;

        // A3
        expect(modes).toBeInstanceOf(Array);
        expect(modes.length).toBeGreaterThanOrEqual(1);
    });

    it('should create and remove a new at', async () => {
        await dbCleaner(async () => {
            // A1
            const _name = randomStringGenerator();

            // A2 - create at
            const at = await AtService.createAt({ name: _name });
            const { id, name } = at;

            // A2 - remove at
            await AtService.removeAt(id);
            const deletedAt = await AtService.getAtById(id);

            // after at created
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // after at removed
            expect(deletedAt).toBeNull();
        });
    });

    it('should create and update a new at', async () => {
        await dbCleaner(async () => {
            // A1
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();

            // A2 - create at
            const at = await AtService.createAt({ name: _name });
            const { id, name } = at;

            // A2 - update at
            const updatedAt = await AtService.updateAt(id, {
                name: _updatedName
            });
            const { name: updatedName } = updatedAt;

            // after at created
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // after at updated
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return same at if no update params passed', async () => {
        await dbCleaner(async () => {
            // A1
            const _id = 1;

            // A2
            const originalAt = await AtService.getAtById(_id);
            const updatedAt = await AtService.updateAt(_id, {});

            // A3
            expect(originalAt).toMatchObject(updatedAt);
        });
    });

    it('should return collection of ats', async () => {
        // A1
        const result = await AtService.getAts('');

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    versions: expect.any(Array),
                    modes: expect.any(Array)
                })
            ])
        );
    });

    it('should return collection of users for name query', async () => {
        // A1
        const search = 'nvd';

        // A2
        const result = await AtService.getAts(search, {});

        // A3
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.stringMatching(/nvd/gi),
                    versions: expect.any(Array),
                    modes: expect.any(Array)
                })
            ])
        );
    });

    it('should return collection of ats with paginated structure', async () => {
        // A1
        const result = await AtService.getAts('', {}, ['name'], [], [], {
            enablePagination: true
        });

        // A3
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.objectContaining({
                page: 1,
                pageSize: expect.any(Number),
                resultsCount: expect.any(Number),
                totalResultsCount: expect.any(Number),
                pagesCount: expect.any(Number),
                data: expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String)
                    })
                ])
            })
        );
    });
});

describe('AtVersionModel Data Checks', () => {
    it('should return valid atVersion with atObject for query', async () => {
        // A1
        const _at = 1;
        const _version = '2021.2103.174';

        // A2
        const atVersion = await AtService.getAtVersionByQuery({
            at: _at,
            version: _version
        });
        const { at, version, atObject } = atVersion;

        // A3
        expect(at).toBeTruthy();
        expect(version).toBeTruthy();
        expect(atObject).toBeTruthy();
        expect(atVersion).toEqual(
            expect.objectContaining({
                at: _at,
                version: _version,
                atObject: expect.objectContaining({
                    id: _at,
                    name: expect.any(String)
                })
            })
        );
    });

    it('should not be valid atVersion query', async () => {
        // A1
        const _at = 53935;
        const _version = randomStringGenerator();

        // A2
        const atVersion = await AtService.getAtVersionByQuery({
            at: _at,
            version: _version
        });

        // A3
        expect(atVersion).toBeNull();
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

            // A2
            await AtService.removeAtVersionByQuery({ at, version });
            const deletedAtVersion = await AtService.getAtVersionByQuery({
                at,
                version
            });

            // after atVersion created
            expect(at).toEqual(_at);
            expect(version).toEqual(_version);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // after atVersion removed
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

            // A2
            const updatedAtVersion = await AtService.updateAtVersionByQuery(
                { at, version },
                { version: _updatedVersion }
            );
            const { version: updatedVersion } = updatedAtVersion;

            // after atVersion created
            expect(at).toEqual(_at);
            expect(version).toEqual(_version);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // after atVersion updated
            expect(_version).not.toEqual(_updatedVersion);
            expect(version).not.toEqual(updatedVersion);
            expect(updatedVersion).toEqual(_updatedVersion);
        });
    });

    it('should return same atVersion if no update params passed', async () => {
        await dbCleaner(async () => {
            // A1
            const _at = 1;
            const _version = '2021.2103.174';

            // A2
            const originalAtVersion = await AtService.getAtVersionByQuery({
                at: _at,
                version: _version
            });
            const updatedAtVersion = await AtService.updateAtVersionByQuery({
                at: _at,
                version: _version
            });

            // A3
            expect(originalAtVersion).toMatchObject(updatedAtVersion);
        });
    });

    it('should return collection of atVersions', async () => {
        // A1
        const result = await AtService.getAtVersions('');

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    at: expect.any(Number),
                    version: expect.any(String),
                    atObject: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    })
                })
            ])
        );
    });

    it('should return collection of atVersions for version query', async () => {
        // A1
        const search = '2019';

        // A2
        const result = await AtService.getAtVersions(search, {});

        // A3
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    at: expect.any(Number),
                    version: expect.stringMatching(/2019/gi),
                    atObject: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    })
                })
            ])
        );
    });

    it('should return collection of atVersions with paginated structure', async () => {
        // A1
        const result = await AtService.getAtVersions('', {}, ['version'], [], {
            enablePagination: true
        });

        // A3
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.objectContaining({
                page: 1,
                pageSize: expect.any(Number),
                resultsCount: expect.any(Number),
                totalResultsCount: expect.any(Number),
                pagesCount: expect.any(Number),
                data: expect.arrayContaining([
                    expect.objectContaining({
                        version: expect.any(String)
                    })
                ])
            })
        );
    });
});

describe('AtModeModel Data Checks', () => {
    it('should return valid atMode with atObject for query', async () => {
        // A1
        const _at = 1;
        const _name = 'reading';

        // A2
        const atMode = await AtService.getAtModeByQuery({
            at: _at,
            name: _name
        });
        const { at, name, atObject } = atMode;

        // A3
        expect(at).toBeTruthy();
        expect(name).toBeTruthy();
        expect(atObject).toBeTruthy();
        expect(atMode).toEqual(
            expect.objectContaining({
                at: _at,
                name: _name,
                atObject: expect.objectContaining({
                    id: _at,
                    name: expect.any(String)
                })
            })
        );
    });

    it('should not be valid atMode query', async () => {
        // A1
        const _at = 53935;
        const _name = randomStringGenerator();

        // A2
        const atMode = await AtService.getAtModeByQuery({
            at: _at,
            name: _name
        });

        // A3
        expect(atMode).toBeNull();
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

            // A2
            await AtService.removeAtModeByQuery({ at, name });
            const deletedAtMode = await AtService.getAtModeByQuery({
                at,
                name
            });

            // after atMode created
            expect(at).toEqual(_at);
            expect(name).toEqual(_name);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // after atMode removed
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

            // A2
            const updatedMode = await AtService.updateAtModeByQuery(
                { at, name },
                {
                    name: _updatedName
                }
            );
            const { name: updatedName } = updatedMode;

            // after atMode created
            expect(at).toEqual(_at);
            expect(name).toEqual(_name);
            expect(atObject).toHaveProperty('id');
            expect(atObject).toHaveProperty('name');

            // after atMode updated
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return same atMode if no update params passed', async () => {
        await dbCleaner(async () => {
            // A1
            const _at = 1;
            const _name = 'reading';

            // A2
            const originalAtMode = await AtService.getAtModeByQuery({
                at: _at,
                name: _name
            });
            const updatedAtMode = await AtService.updateAtModeByQuery({
                at: _at,
                name: _name
            });

            // A3
            expect(originalAtMode).toMatchObject(updatedAtMode);
        });
    });

    it('should return collection of atModes', async () => {
        // A1
        const result = await AtService.getAtModes('');

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    at: expect.any(Number),
                    name: expect.any(String),
                    atObject: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    })
                })
            ])
        );
    });

    it('should return collection of atModes for name query', async () => {
        // A1
        const search = 'rea';

        // A2
        const result = await AtService.getAtModes(search, {});

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    at: expect.any(Number),
                    name: expect.stringMatching(/read/gi),
                    atObject: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    })
                })
            ])
        );
    });

    it('should return collection of atModes with paginated structure', async () => {
        // A1
        const result = await AtService.getAtModes('', {}, ['name'], [], {
            enablePagination: true
        });

        // A3
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.objectContaining({
                page: 1,
                pageSize: expect.any(Number),
                resultsCount: expect.any(Number),
                totalResultsCount: expect.any(Number),
                pagesCount: expect.any(Number),
                data: expect.arrayContaining([
                    expect.objectContaining({
                        name: expect.any(String)
                    })
                ])
            })
        );
    });
});
