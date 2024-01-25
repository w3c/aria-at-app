const puppeteer = require('puppeteer');

(async () => {
    const browser = await puppeteer.launch({ headless: false });
    const [page] = await browser.pages();
    page.close();

    await Promise.all([
        (async () => {
            const page = await browser.newPage();
            await page.goto('http://localhost:3000/');
            await page.waitForSelector('h1');
            const h1Handle = await page.waitForSelector('h1');
            const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
            console.log('home h1', h1Text);
        })(),
        (async () => {
            const page = await browser.newPage();
            await page.goto('http://localhost:3000/reports');
            await page.waitForSelector('h2');
            const h1Handle = await page.waitForSelector('h1');
            const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
            console.log('reports h1', h1Text);
        })(),
        (async () => {
            const page = await browser.newPage();
            await page.goto('http://localhost:3000/data-management');
            await page.waitForSelector('h2');
            const h1Handle = await page.waitForSelector('h1');
            const h1Text = await h1Handle.evaluate(h1 => h1.innerText);
            console.log('data-management h1', h1Text);
        })()
    ]);

    await new Promise(resolve => setTimeout(resolve, 2000));
    await browser.close();
})();
