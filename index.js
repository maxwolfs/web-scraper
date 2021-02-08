const puppeteer = require('puppeteer');

async function scrapeProduct(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    async function getPrice() {
    const src = await page.evaluate(() => {return document.querySelector('span[class="primary"]')});

    if (src !== null) {
        value = await page.evaluate(() => {
            return document.querySelector('span[class="primary"]').innerText.slice(0, -2)});
    } else {
        value = "Not available yet"
    }

    console.log({value});
    
    }

    await getPrice();
    await browser.close();
}

scrapeProduct('https://www.thomann.de/de/behringer_rd_9.htm');