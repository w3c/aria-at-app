const { sequelize } = require('../../../models');
const AtService = require('../../../models/services/AtService');
const randomStringGenerator = require('../../util/random-character-generator');
const dbCleaner = require('../../util/db-cleaner');

afterAll(async () => {
    await sequelize.close();
});

describe('AtModel Data Checks', () => {
    it('should return valid at for id query with all associations', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById({ id: _id, t: false });
        const { id, name } = at;

        // A3
        expect(id).toEqual(_id);
        expect(at).toEqual(
            expect.objectContaining({
                name,
                id: expect.any(Number)
            })
        );
        expect(at).toHaveProperty('atVersions');
        expect(at).toHaveProperty('modes');
        expect(at).toHaveProperty('browsers');
    });

    it('should return valid at for id query with no associations', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById({
            id: _id,
            atVersionAttributes: [],
            atModeAttributes: [],
            browserAttributes: [],
            t: false
        });
        const { id, name } = at;

        // A3
        expect(id).toEqual(_id);
        expect(at).toEqual(
            expect.objectContaining({
                name,
                id: expect.any(Number)
            })
        );
        expect(at).not.toHaveProperty('atVersions');
        expect(at).not.toHaveProperty('modes');
        expect(at).not.toHaveProperty('browsers');
    });

    it('should not be valid at query', async () => {
        // A1
        const _id = 53935;

        // A2
        const at = await AtService.getAtById({ id: _id, t: false });

        // A3
        expect(at).toBeNull();
    });

    it('should contain valid at with atVersions array', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById({ id: _id, t: false });
        const { atVersions } = at;

        // A3
        expect(atVersions).toBeInstanceOf(Array);
        expect(atVersions.length).toBeGreaterThanOrEqual(1);
    });

    it('should contain valid at with modes array', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById({ id: _id, t: false });
        const { modes } = at;

        // A3
        expect(modes).toBeInstanceOf(Array);
        expect(modes.length).toBeGreaterThanOrEqual(1);
    });

    it('should contain valid at with browsers array', async () => {
        // A1
        const _id = 1;

        // A2
        const at = await AtService.getAtById({ id: _id, t: false });
        const { browsers } = at;

        // A3
        expect(browsers).toBeInstanceOf(Array);
        expect(browsers.length).toBeGreaterThanOrEqual(1);
    });

    it('should create and remove a new at', async () => {
        await dbCleaner(async t => {
            // A1
            const _name = randomStringGenerator();

            // A2 - create at
            const at = await AtService.createAt({ values: { name: _name }, t });
            const { id, name } = at;

            // A2 - remove at
            await AtService.removeAtById({ id, t });
            const deletedAt = await AtService.getAtById({ id, t });

            // after at created
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // after at removed
            expect(deletedAt).toBeNull();
        });
    });

    it('should create and update a new at', async () => {
        await dbCleaner(async t => {
            // A1
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();

            // A2 - create at
            const at = await AtService.createAt({ values: { name: _name }, t });
            const { id, name } = at;

            // A2 - update at
            const updatedAt = await AtService.updateAtById({
                id,
                values: { name: _updatedName },
                t
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
        await dbCleaner(async t => {
            // A1
            const _id = 1;

            // A2
            const originalAt = await AtService.getAtById({ id: _id, t });
            const updatedAt = await AtService.updateAtById({
                id: _id,
                values: {},
                t
            });

            // A3
            expect(originalAt).toMatchObject(updatedAt);
        });
    });

    it('should return collection of ats', async () => {
        // A1
        const result = await AtService.getAts({ t: false });

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    atVersions: expect.any(Array),
                    modes: expect.any(Array),
                    browsers: expect.any(Array)
                })
            ])
        );
    });

    it('should return collection of ats for name query', async () => {
        // A1
        const search = 'nvd';

        // A2
        const result = await AtService.getAts({ search, t: false });

        // A3
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.stringMatching(/nvd/gi),
                    atVersions: expect.any(Array),
                    modes: expect.any(Array),
                    browsers: expect.any(Array)
                })
            ])
        );
    });

    it('should return collection of ats with paginated structure', async () => {
        // A1
        const result = await AtService.getAts({
            atAttributes: ['name'],
            atVersionAttributes: [],
            atModeAttributes: [],
            browserAttributes: [],
            pagination: {
                enablePagination: true
            },
            t: false
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
    it('should return valid atVersion for id query with all associations', async () => {
        // A1
        const _id = 1;

        // A2
        const atVersion = await AtService.getAtVersionById({
            id: _id,
            t: false
        });
        const { id, name, at, releasedAt } = atVersion;

        // A3
        expect(id).toEqual(_id);
        expect(name).toBeTruthy();
        expect(releasedAt).toBeTruthy();
        expect(at).toEqual(
            expect.objectContaining({
                name: expect.any(String),
                id: expect.any(Number)
            })
        );
        expect(atVersion).toHaveProperty('at');
    });
    it('should return valid atVersion with at for query with all associations', async () => {
        // A1
        const _atId = 1;
        const _atVersion = '2021.2111.13';
        const _releasedAt = new Date('2021-11-01 04:00:00.000Z');

        // A2
        const atVersionInstance = await AtService.getAtVersionByQuery({
            where: {
                atId: _atId,
                name: _atVersion,
                releasedAt: _releasedAt
            },
            t: false
        });
        const { atId, name, at, releasedAt } = atVersionInstance;

        // A3
        expect(atId).toBeTruthy();
        expect(name).toBeTruthy();
        expect(at).toBeTruthy();
        expect(releasedAt).toBeTruthy();
        expect(atVersionInstance).toEqual(
            expect.objectContaining({
                atId: _atId,
                name: _atVersion,
                at: expect.objectContaining({
                    id: _atId,
                    name: expect.any(String)
                })
            })
        );
        expect(atVersionInstance).toHaveProperty('at');
    });

    it('should return valid atVersion for query with no associations', async () => {
        // A1
        const _atId = 1;
        const _atVersion = '2021.2111.13';
        const _releasedAt = new Date('2021-11-01 04:00:00.000Z');

        // A2
        const atVersionInstance = await AtService.getAtVersionByQuery({
            where: { atId: _atId, name: _atVersion, releasedAt: _releasedAt },
            atAttributes: [],
            t: false
        });
        const { atId, name } = atVersionInstance;

        // A3
        expect(atId).toBeTruthy();
        expect(name).toBeTruthy();
        expect(atVersionInstance).toEqual(
            expect.objectContaining({ atId: _atId, name: _atVersion })
        );
        expect(atVersionInstance).not.toHaveProperty('at');
    });

    it('should not be valid atVersion query', async () => {
        // A1
        const _atId = 53935;
        const _atVersion = randomStringGenerator();
        const _releasedAt = new Date('2022-04-05');

        // A2
        const atVersionResult = await AtService.getAtVersionByQuery({
            where: { atId: _atId, name: _atVersion, releasedAt: _releasedAt },
            t: false
        });

        // A3
        expect(atVersionResult).toBeNull();
    });

    it('should create and remove a new atVersion', async () => {
        await dbCleaner(async t => {
            // A1
            const _atId = 1;
            const _atVersion = randomStringGenerator();
            const _releasedAt = new Date('2022-05-01 20:00:00-04');

            // A2
            const atVersionInstance = await AtService.createAtVersion({
                values: {
                    atId: _atId,
                    name: _atVersion,
                    releasedAt: _releasedAt
                },
                t
            });
            const { atId, name, at, releasedAt } = atVersionInstance;

            // A2
            await AtService.removeAtVersionByQuery({
                where: { atId, name, releasedAt },
                t
            });
            const deletedAtVersion = await AtService.getAtVersionByQuery({
                where: {
                    atId,
                    name,
                    releasedAt
                },
                t
            });

            // after atVersion created
            expect(atId).toEqual(_atId);
            expect(name).toEqual(_atVersion);
            expect(at).toHaveProperty('id');
            expect(at).toHaveProperty('name');

            // after atVersion removed
            expect(deletedAtVersion).toBeNull();
        });
    });

    it('should create and update a new atVersion', async () => {
        await dbCleaner(async t => {
            // A1
            const _atId = 1;
            const _atVersion = randomStringGenerator();
            const _updatedAtVersion = randomStringGenerator();

            // A2
            const atVersionInstance = await AtService.createAtVersion({
                values: { atId: _atId, name: _atVersion },
                t
            });
            const { id, atId, name, at } = atVersionInstance;

            // A2
            const updatedAtVersionInstance =
                await AtService.updateAtVersionById({
                    id,
                    values: { name: _updatedAtVersion },
                    t
                });
            const { name: updatedAtVersion } = updatedAtVersionInstance;

            // after atVersion created
            expect(atId).toEqual(_atId);
            expect(name).toEqual(_atVersion);
            expect(at).toHaveProperty('id');
            expect(at).toHaveProperty('name');

            // after atVersion updated
            expect(_atVersion).not.toEqual(_updatedAtVersion);
            expect(name).not.toEqual(updatedAtVersion);
            expect(updatedAtVersion).toEqual(_updatedAtVersion);
        });
    });

    it('should return same atVersion if no update params passed', async () => {
        await dbCleaner(async t => {
            // A1
            const _atId = 1;
            const _atVersion = '2021.2111.13';
            const _releasedAt = new Date('2021-11-01 04:00:00.000Z');

            // A2
            const originalAtVersion = await AtService.getAtVersionByQuery({
                where: {
                    atId: _atId,
                    name: _atVersion,
                    releasedAt: _releasedAt
                },
                t
            });
            const updatedAtVersion = await AtService.updateAtVersionByQuery({
                where: {
                    atId: _atId,
                    name: _atVersion,
                    releasedAt: _releasedAt
                },
                values: {},
                t
            });

            // A3
            expect(originalAtVersion).toMatchObject(updatedAtVersion);
        });
    });

    it('should return collection of atVersions', async () => {
        // A1
        const result = await AtService.getAtVersions({ t: false });

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    atId: expect.any(Number),
                    name: expect.any(String),
                    at: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    }),
                    releasedAt: expect.anything()
                })
            ])
        );
    });

    it('should return collection of atVersions for atVersion query', async () => {
        // A1
        const search = '202';

        // A2
        const result = await AtService.getAtVersions({ search, t: false });

        // A3
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    atId: expect.any(Number),
                    name: expect.stringMatching(/202/gi),
                    at: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    }),
                    releasedAt: expect.anything()
                })
            ])
        );
    });

    it('should return collection of atVersions with paginated structure', async () => {
        // A1
        const result = await AtService.getAtVersions({
            atVersionAttributes: ['name'],
            atAttributes: [],
            pagination: { enablePagination: true },
            t: false
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

describe('AtModeModel Data Checks', () => {
    it('should return valid atMode with at for query with all associations', async () => {
        // A1
        const _atId = 1;
        const _name = 'READING';

        // A2
        const atMode = await AtService.getAtModeByQuery({
            where: { atId: _atId, name: _name },
            t: false
        });
        const { atId, name, at } = atMode;

        // A3
        expect(atId).toBeTruthy();
        expect(name).toBeTruthy();
        expect(at).toBeTruthy();
        expect(atMode).toEqual(
            expect.objectContaining({
                atId: _atId,
                name: _name,
                at: expect.objectContaining({
                    id: _atId,
                    name: expect.any(String)
                })
            })
        );
        expect(atMode).toHaveProperty('at');
    });

    it('should return valid atMode for query with no associations', async () => {
        // A1
        const _atId = 1;
        const _name = 'READING';

        // A2
        const atMode = await AtService.getAtModeByQuery({
            where: { atId: _atId, name: _name },
            atAttributes: [],
            t: false
        });
        const { atId, name } = atMode;

        // A3
        expect(atId).toBeTruthy();
        expect(name).toBeTruthy();
        expect(atMode).toEqual(
            expect.objectContaining({
                atId: _atId,
                name: _name
            })
        );
        expect(atMode).not.toHaveProperty('at');
    });

    it('should not be valid atMode query', async () => {
        // A1
        const _atId = 53935;
        const _name = randomStringGenerator();

        // A2
        const atMode = await AtService.getAtModeByQuery({
            where: { atId: _atId, name: _name },
            t: false
        });

        // A3
        expect(atMode).toBeNull();
    });

    it('should create and remove a new atMode', async () => {
        await dbCleaner(async t => {
            // A1
            const _atId = 1;
            const _name = randomStringGenerator();

            // A2
            const atMode = await AtService.createAtMode({
                values: { atId: _atId, name: _name },
                t
            });
            const { atId, name, at } = atMode;

            // A2
            await AtService.removeAtModeByQuery({ where: { atId, name }, t });
            const deletedAtMode = await AtService.getAtModeByQuery({
                where: { atId, name },
                t
            });

            // after atMode created
            expect(atId).toEqual(_atId);
            expect(name).toEqual(_name);
            expect(at).toHaveProperty('id');
            expect(at).toHaveProperty('name');

            // after atMode removed
            expect(deletedAtMode).toBeNull();
        });
    });

    it('should create and update a new atMode', async () => {
        await dbCleaner(async t => {
            // A1
            const _atId = 1;
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();

            // A2
            const atMode = await AtService.createAtMode({
                values: { atId: _atId, name: _name },
                t
            });
            const { atId, name, at } = atMode;

            // A2
            const updatedMode = await AtService.updateAtModeByQuery({
                where: { atId, name },
                values: { name: _updatedName },
                t
            });
            const { name: updatedName } = updatedMode;

            // after atMode created
            expect(atId).toEqual(_atId);
            expect(name).toEqual(_name);
            expect(at).toHaveProperty('id');
            expect(at).toHaveProperty('name');

            // after atMode updated
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return same atMode if no update params passed', async () => {
        await dbCleaner(async t => {
            // A1
            const _atId = 1;
            const _name = 'READING';

            // A2
            const originalAtMode = await AtService.getAtModeByQuery({
                where: { atId: _atId, name: _name },
                t
            });
            const updatedAtMode = await AtService.updateAtModeByQuery({
                where: { atId: _atId, name: _name },
                t
            });

            // A3
            expect(originalAtMode).toMatchObject(updatedAtMode);
        });
    });

    it('should return collection of atModes', async () => {
        // A1
        const result = await AtService.getAtModes({ t: false });

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    atId: expect.any(Number),
                    name: expect.any(String),
                    at: expect.objectContaining({
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
        const result = await AtService.getAtModes({ search, t: false });

        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    atId: expect.any(Number),
                    name: expect.stringMatching(/read/gi),
                    at: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    })
                })
            ])
        );
    });

    it('should return collection of atModes with paginated structure', async () => {
        // A1
        const result = await AtService.getAtModes({
            atModeAttributes: ['name'],
            atAttributes: [],
            pagination: { enablePagination: true },
            t: false
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
