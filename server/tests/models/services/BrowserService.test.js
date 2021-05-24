const { sequelize } = require('../../../models');
const BrowserService = require('../../../models/services/BrowserService');
const randomStringGenerator = require('../../util/random-character-generator');
const { dbCleaner } = require('../../util/db-cleaner');

afterAll(async () => {
    await sequelize.close(); // close connection to database
});

describe('BrowserModel Data Checks', () => {
    it('should return valid browser for id query', async () => {
        const _id = 1;

        const browser = await BrowserService.getBrowserById(_id);
        const { id, name } = browser;

        expect(id).toEqual(_id);
        expect(name).toEqual('Firefox');
    });

    it('should not be valid browser query', async () => {
        const _id = 53935;

        const browser = await BrowserService.getBrowserById(_id);
        expect(browser).toBeNull();
    });

    it('should contain valid browser with versions array', async () => {
        const _id = 1;

        const browser = await BrowserService.getBrowserById(_id);
        const { versions } = browser;

        expect(browser).toHaveProperty('versions');
        expect(versions.length).toBeGreaterThanOrEqual(0);
    });

    it('should create and remove a new browser', async () => {
        await dbCleaner(async () => {
            // A1
            const _name = randomStringGenerator();

            // A2
            const browser = await BrowserService.createBrowser({ name: _name });
            const { id, name } = browser;

            // A3
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // A2
            await BrowserService.removeBrowser(id);
            const deletedBrowser = await BrowserService.getBrowserById(id);

            // A3
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

            // A3
            expect(id).toBeTruthy();
            expect(name).toEqual(_name);

            // A2
            const updatedBrowser = await BrowserService.updateBrowser(id, {
                name: _updatedName
            });
            const { name: updatedName } = updatedBrowser;

            // A3
            expect(_name).not.toEqual(_updatedName);
            expect(name).not.toEqual(updatedName);
            expect(updatedName).toEqual(_updatedName);
        });
    });

    it('should return collection of browsers', async () => {
        const result = await BrowserService.getBrowsers('');
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of browsers for name query', async () => {
        const search = 'chr';

        const result = await BrowserService.getBrowsers(search, {});
        const result0thIndex = result[0];

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result0thIndex).toHaveProperty('id');
        expect(result0thIndex).toHaveProperty('name');
        expect(result0thIndex.name).toMatch(/chr/gi);
    });

    it('should return collection of browsers with paginated structure', async () => {
        const result = await BrowserService.getBrowsers('', {}, ['name'], [], {
            enablePagination: true
        });
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});

describe('BrowserVersionModel Data Checks', () => {
    it('should return valid browserVersion for query', async () => {
        const _browser = 1;
        const _version = '86.0';

        const browserVersion = await BrowserService.getBrowserVersionByQuery({
            browser: _browser,
            version: _version
        });
        const { browser, version } = browserVersion;

        expect(browser).toBeTruthy();
        expect(version).toBeTruthy();
    });

    it('should not be valid browserVersion query', async () => {
        const _browser = 53935;
        const _version = randomStringGenerator();

        const browserVersion = await BrowserService.getBrowserVersionByQuery({
            browser: _browser,
            version: _version
        });
        expect(browserVersion).toBeNull();
    });

    it('should contain valid browserVersion with browserObject', async () => {
        const _browser = 1;
        const _version = '86.0';

        const browserVersion = await BrowserService.getBrowserVersionByQuery({
            browser: _browser,
            version: _version
        });
        const { browserObject } = browserVersion;

        expect(browserVersion).toHaveProperty('browserObject');
        expect(browserObject).toHaveProperty('id');
        expect(browserObject).toHaveProperty('name');
    });

    it('should create and remove a new browserVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _browser = 1;
            const _version = randomStringGenerator();

            // A2
            const browserVersion = await BrowserService.createBrowserVersion({
                browser: _browser,
                version: _version
            });
            const { browser, version, browserObject } = browserVersion;

            // A3
            expect(browser).toEqual(_browser);
            expect(version).toEqual(_version);
            expect(browserObject).toHaveProperty('id');
            expect(browserObject).toHaveProperty('name');

            // A2
            await BrowserService.removeBrowserVersionByQuery({
                browser,
                version
            });
            const deletedBrowserVersion = await BrowserService.getBrowserVersionByQuery(
                {
                    browser,
                    version
                }
            );

            // A3
            expect(deletedBrowserVersion).toBeNull();
        });
    });

    it('should create and update a new browserVersion', async () => {
        await dbCleaner(async () => {
            // A1
            const _browser = 1;
            const _version = randomStringGenerator();
            const _updatedVersion = randomStringGenerator();

            // A2
            const browserVersion = await BrowserService.createBrowserVersion({
                browser: _browser,
                version: _version
            });
            const { browser, version, browserObject } = browserVersion;

            // A3
            expect(browser).toEqual(_browser);
            expect(version).toEqual(_version);
            expect(browserObject).toHaveProperty('id');
            expect(browserObject).toHaveProperty('name');

            // A2
            const updatedBrowserVersion = await BrowserService.updateBrowserVersionByQuery(
                { browser, version },
                { version: _updatedVersion }
            );
            const { version: updatedVersion } = updatedBrowserVersion;

            // A3
            expect(_version).not.toEqual(_updatedVersion);
            expect(version).not.toEqual(updatedVersion);
            expect(updatedVersion).toEqual(_updatedVersion);
        });
    });

    it('should return collection of browserVersions', async () => {
        const result = await BrowserService.getBrowserVersions('');
        expect(result.length).toBeGreaterThanOrEqual(1);
    });

    it('should return collection of browserVersions for version query', async () => {
        const search = '87';

        const result = await BrowserService.getBrowserVersions(search, {});
        const result0thIndex = result[0];

        expect(result.length).toBeGreaterThanOrEqual(1);
        expect(result0thIndex).toHaveProperty('version');
        expect(result0thIndex.version).toMatch(/87/gi);
    });

    it('should return collection of browserVersions with paginated structure', async () => {
        const result = await BrowserService.getBrowserVersions(
            '',
            {},
            ['version'],
            [],
            { enablePagination: true }
        );
        expect(result).toHaveProperty('page');
        expect(result).toHaveProperty('data');
        expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
});
