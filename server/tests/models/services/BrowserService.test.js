const { sequelize } = require('../../../models');
const BrowserService = require('../../../models/services/BrowserService');
const randomStringGenerator = require('../../util/random-character-generator');
const dbCleaner = require('../../util/db-cleaner');

afterAll(async () => {
    await sequelize.close();
});

describe('BrowserModel Data Checks', () => {
    it('should return valid browser for id query with all associations', async () => {
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
                id: expect.any(Number)
            })
        );
        expect(browser).toHaveProperty('browserVersions');
    });

    it('should return valid browser for id query with no associations', async () => {
        // A1
        const _id = 1;

        // A2
        const browser = await BrowserService.getBrowserById(_id, null, []);
        const { id, name } = browser;

        // A3
        expect(id).toEqual(_id);
        expect(browser).toEqual(
            expect.objectContaining({
                name,
                id: expect.any(Number)
            })
        );
        expect(browser).not.toHaveProperty('browserVersions');
    });

    it('should not be valid browser query', async () => {
        // A1
        const _id = 53935;

        // A2
        const browser = await BrowserService.getBrowserById(_id);

        // A3
        expect(browser).toBeNull();
    });

    it('should contain valid browser with browserVersions array', async () => {
        // A1
        const _id = 1;

        // A2
        const browser = await BrowserService.getBrowserById(_id);
        const { browserVersions } = browser;

        // A3
        expect(browserVersions).toBeInstanceOf(Array);
        expect(browserVersions.length).toBeGreaterThanOrEqual(1);
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
                name: _updatedName
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
                    browserVersions: expect.any(Array)
                })
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
                    browserVersions: expect.any(Array)
                })
            ])
        );
    });

    it('should return collection of browsers with paginated structure', async () => {
        // A1
        const result = await BrowserService.getBrowsers('', {}, ['name'], [], {
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

describe('BrowserVersionModel Data Checks', () => {
    it('should return valid browserVersion with browser for query with all associations', async () => {
        // A1
        const _browserId = 1;
        const _name = '99.0.1';

        // A2
        const browserVersionInstance =
            await BrowserService.getBrowserVersionByQuery({
                browserId: _browserId,
                name: _name
            });
        const { id, browserId, name, browser } = browserVersionInstance;

        // A3
        expect(browserId).toBeTruthy();
        expect(name).toBeTruthy();
        expect(browser).toBeTruthy();
        expect(id).toBeTruthy();
        expect(browserVersionInstance).toEqual(
            expect.objectContaining({
                id: expect.anything(),
                browserId: _browserId,
                name: _name,
                browser: expect.objectContaining({
                    id: _browserId,
                    name: expect.any(String)
                })
            })
        );
        expect(browserVersionInstance).toHaveProperty('browser');
    });

    it('should return valid browserVersionInstance for query with no associations', async () => {
        // A1
        const _browserId = 1;
        const _name = '99.0.1';

        // A2
        const browserVersionInstance =
            await BrowserService.getBrowserVersionByQuery(
                {
                    browserId: _browserId,
                    name: _name
                },
                null,
                []
            );
        const { id, browserId, name } = browserVersionInstance;

        // A3
        expect(browserId).toBeTruthy();
        expect(name).toBeTruthy();
        expect(id).toBeTruthy();
        expect(browserVersionInstance).toEqual(
            expect.objectContaining({
                id: expect.anything(),
                browserId: _browserId,
                name: _name
            })
        );
        expect(browserVersionInstance).not.toHaveProperty('browser');
    });

    it('should not be valid browserVersion query', async () => {
        // A1
        const _browserId = 53935;
        const _name = randomStringGenerator();

        // A2
        const browserVersionInstance =
            await BrowserService.getBrowserVersionByQuery({
                browserId: _browserId,
                name: _name
            });

        // A3
        expect(browserVersionInstance).toBeNull();
    });

    it('should create and remove a new browserVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _browserId = 1;
            const _name = randomStringGenerator();

            // A2
            const browserVersionInstance =
                await BrowserService.createBrowserVersion({
                    browserId: _browserId,
                    name: _name
                });
            const { id, browserId, name, browser } = browserVersionInstance;

            // A2
            await BrowserService.removeBrowserVersionById(id);

            const deletedBrowserVersion =
                await BrowserService.getBrowserVersionByQuery({
                    browserId,
                    name
                });

            // after BrowserVersion created
            expect(id).toBeTruthy();
            expect(browserId).toEqual(_browserId);
            expect(name).toEqual(_name);
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
            const _name = randomStringGenerator();
            const _updatedName = randomStringGenerator();

            // A2
            const browserVersionInstance =
                await BrowserService.createBrowserVersion({
                    browserId: _browserId,
                    name: _name
                });
            const { id, browserId, name, browser } = browserVersionInstance;

            // A2
            const updatedBrowserVersion =
                await BrowserService.updateBrowserVersionById(id, {
                    name: _updatedName
                });
            const { name: updatedName } = updatedBrowserVersion;

            // after BrowserVersion created
            expect(id).toBeTruthy();
            expect(browserId).toEqual(_browserId);
            expect(name).toEqual(_name);
            expect(browser).toHaveProperty('id');
            expect(browser).toHaveProperty('name');

            // after browserVersion updated
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return same browserVersion if no update params passed', async () => {
        await dbCleaner(async () => {
            // A1
            const _browserId = 1;
            const _name = '99.0.1';

            // A2
            const originalBrowserVersion =
                await BrowserService.getBrowserVersionByQuery({
                    browserId: _browserId,
                    name: _name
                });
            const updatedBrowserVersion =
                await BrowserService.updateBrowserVersionByQuery({
                    browserId: _browserId,
                    name: _name
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
                    id: expect.anything(),
                    browserId: expect.any(Number),
                    name: expect.any(String),
                    browser: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    })
                })
            ])
        );
    });

    it('should return collection of browserVersions for browserVersion query', async () => {
        // A1
        const search = '99';

        // A2
        const result = await BrowserService.getBrowserVersions(search, {});

        // A3
        expect(result).toBeInstanceOf(Array);
        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result).toEqual(
            expect.arrayContaining([
                expect.objectContaining({
                    browserId: expect.any(Number),
                    name: expect.stringMatching(/99/gi),
                    browser: expect.objectContaining({
                        id: expect.any(Number),
                        name: expect.any(String)
                    })
                })
            ])
        );
    });

    it('should return collection of browserVersions with paginated structure', async () => {
        // A1
        const result = await BrowserService.getBrowserVersions(
            '',
            {},
            ['id', 'name'],
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
                        id: expect.anything(),
                        name: expect.any(String)
                    })
                ])
            })
        );
    });
});
