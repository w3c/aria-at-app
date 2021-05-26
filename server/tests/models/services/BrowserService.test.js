const { sequelize } = require('../../../models');
const BrowserService = require('../../../models/services/BrowserService');
const randomStringGenerator = require('../../util/random-character-generator');
const { dbCleaner } = require('../../util/db-cleaner');

afterAll(async () => {
    await sequelize.close();
});

describe('BrowserModel Data Checks', () => {
    it('should return valid browser for id query', async () => {
        // A1
        const _id = 1;

        // A2
        const browser = await BrowserService.getBrowserById(_id);
        const { id, name } = browser;

        // A3
        expect(id).toEqual(_id);
        expect(browser).toEqual(
            expect.objectContaining({
                name,
                id: expect.any(Number),
            })
        );
    });

    it('should not be valid browser query', async () => {
        // A1
        const _id = 53935;

        // A2
        const browser = await BrowserService.getBrowserById(_id);

        // A3
        expect(browser).toBeNull();
    });

    it('should contain valid browser with versions array', async () => {
        // A1
        const _id = 1;

        // A2
        const browser = await BrowserService.getBrowserById(_id);
        const { versions } = browser;

        // A3
        expect(versions).toBeInstanceOf(Array);
        expect(versions.length).toBeGreaterThanOrEqual(1);
    });

    it('should create and remove a new browser', async () => {
        await dbCleaner(async () => {
            // A1
            const _name = randomStringGenerator();

            // A2
            const browser = await BrowserService.createBrowser({ name: _name });
            const { id, name } = browser;

            // A2
            await BrowserService.removeBrowser(id);
            const deletedBrowser = await BrowserService.getBrowserById(id);

            // after browser created
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // after browser removed
            expect(deletedBrowser).toBeNull();
        });
    });

    it('should create and update a new browser', async () => {
        await dbCleaner(async () => {
            // A1
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();

            // A2
            const browser = await BrowserService.createBrowser({ name: _name });
            const { id, name } = browser;

            // A2
            const updatedBrowser = await BrowserService.updateBrowser(id, {
                name: _updatedName,
            });
            const { name: updatedName } = updatedBrowser;

            // after browser created
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // after browser removed
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return same browser if no update params passed', async () => {
        await dbCleaner(async () => {
            // A1
            const _id = 1;

            // A2
            const originalBrowser = await BrowserService.getBrowserById(_id);
            const updatedBrowser = await BrowserService.updateBrowser(_id, {});

            // A3
            expect(originalBrowser).toMatchObject(updatedBrowser);
        });
    });

    it('should return collection of browsers', async () => {
        // A1
        const result = await BrowserService.getBrowsers('');

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.any(String),
                    versions: expect.any(Array),
                }),
            ])
        );
    });

    it('should return collection of browsers for name query', async () => {
        // A1
        const search = 'chr';

        // A2
        const result = await BrowserService.getBrowsers(search, {});

        // A3
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    id: expect.any(Number),
                    name: expect.stringMatching(/chr/gi),
                    versions: expect.any(Array),
                }),
            ])
        );
    });

    it('should return collection of browsers with paginated structure', async () => {
        // A1
        const result = await BrowserService.getBrowsers('', {}, ['name'], [], {
            enablePagination: true,
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
                        name: expect.any(String),
                    }),
                ]),
            })
        );
    });
});

describe('BrowserVersionModel Data Checks', () => {
    it('should return valid browserVersion with browserObject for query', async () => {
        // A1
        const _browserId = 1;
        const _version = '86.0';

        // A2
        const browserVersion = await BrowserService.getBrowserVersionByQuery({
            browserId: _browserId,
            version: _version,
        });
        const { browserId, version, browser } = browserVersion;

        // A3
        expect(browserId).toBeTruthy();
        expect(version).toBeTruthy();
        expect(browser).toBeTruthy();
        expect(browserVersion).toEqual(
            expect.objectContaining({
                browserId: _browserId,
                version: _version,
                browser: expect.objectContaining({
                    id: _browserId,
                    name: expect.any(String),
                }),
            })
        );
    });

    it('should not be valid browserVersion query', async () => {
        // A1
        const _browserId = 53935;
        const _version = randomStringGenerator();

        // A2
        const browserVersion = await BrowserService.getBrowserVersionByQuery({
            browserId: _browserId,
            version: _version,
        });

        // A3
        expect(browserVersion).toBeNull();
    });

    it('should create and remove a new browserVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _browserId = 1;
            const _version = randomStringGenerator();

            // A2
            const browserVersion = await BrowserService.createBrowserVersion({
                browserId: _browserId,
                version: _version,
            });
            const { browserId, version, browser } = browserVersion;

            // A2
            await BrowserService.removeBrowserVersionByQuery({
                browserId,
                version,
            });

            const deletedBrowserVersion =
                await BrowserService.getBrowserVersionByQuery({
                    browserId,
                    version,
                });

            // after BrowserVersion created
            expect(browserId).toEqual(_browserId);
            expect(version).toEqual(_version);
            expect(browser).toHaveProperty('id');
            expect(browser).toHaveProperty('name');

            // after browserVersion removed
            expect(deletedBrowserVersion).toBeNull();
        });
    });

    it('should create and update a new browserVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _browserId = 1;
            const _version = randomStringGenerator();
            const _updatedVersion = randomStringGenerator();

            // A2
            const browserVersion = await BrowserService.createBrowserVersion({
                browserId: _browserId,
                version: _version,
            });
            const { browserId, version, browser } = browserVersion;

            // A2
            const updatedBrowserVersion =
                await BrowserService.updateBrowserVersionByQuery(
                    { browserId, version },
                    { version: _updatedVersion }
                );
            const { version: updatedVersion } = updatedBrowserVersion;

            // after BrowserVersion created
            expect(browserId).toEqual(_browserId);
            expect(version).toEqual(_version);
            expect(browser).toHaveProperty('id');
            expect(browser).toHaveProperty('name');

            // after browserVersion updated
            expect(_version).not.toEqual(_updatedVersion);
            expect(version).not.toEqual(updatedVersion);
            expect(updatedVersion).toEqual(_updatedVersion);
        });
    });

    it('should return same browserVersion if no update params passed', async () => {
        await dbCleaner(async () => {
            // A1
            const _browserId = 1;
            const _version = '86.0';

            // A2
            const originalBrowserVersion =
                await BrowserService.getBrowserVersionByQuery({
                    browserId: _browserId,
                    version: _version,
                });
            const updatedBrowserVersion =
                await BrowserService.updateBrowserVersionByQuery({
                    browserId: _browserId,
                    version: _version,
                });

            // A3
            expect(originalBrowserVersion).toMatchObject(updatedBrowserVersion);
        });
    });

    it('should return collection of browserVersions', async () => {
        // A1
        const result = await BrowserService.getBrowserVersions('');

        // A3
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    browserId: expect.any(Number),
                    version: expect.any(String),
                    browser: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                    }),
                }),
            ])
        );
    });

    it('should return collection of browserVersions for version query', async () => {
        // A1
        const search = '87';

        // A2
        const result = await BrowserService.getBrowserVersions(search, {});

        // A3
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    browserId: expect.any(Number),
                    version: expect.stringMatching(/87/gi),
                    browser: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String),
                    }),
                }),
            ])
        );
    });

    it('should return collection of browserVersions with paginated structure', async () => {
        // A1
        const result = await BrowserService.getBrowserVersions(
            '',
            {},
            ['version'],
            [],
            { enablePagination: true }
        );

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
                        version: expect.any(String),
                    }),
                ]),
            })
        );
    });
});
