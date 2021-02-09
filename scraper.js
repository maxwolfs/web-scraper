require('dotenv').config();
const puppeteer = require('puppeteer');
const { Telegraf } = require('telegraf');

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.launch();

setInterval(function () {
    scrapeProduct('https://www.thomann.de/de/behringer_rd_9.htm');
}, 10000);

async function scrapeProduct(url) {
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    async function sendMessage(value) {
        bot.telegram.sendMessage('-432915557', '🎉 Released – And its only ' + value + '€ at ' + url);
        // console.log('🎉 Released – And its only ' + value + '€ at ' + url)  

    }

    async function getPrice() {
    const src = await page.evaluate(() => {return document.querySelector('span[class="primary"]')});

    if (src !== null) {
        value = await page.evaluate(() => {
            return document.querySelector('span[class="primary"]').innerText.slice(0, -2)
        })
        await sendMessage(value)
            
    } else {
        bot.telegram.sendMessage('-432915557', "... still waiting ...");
        // console.log("... still waiting ...");
    }
    }   
    await getPrice();
    await browser.close();
}

