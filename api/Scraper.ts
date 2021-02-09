require('dotenv').config();
const puppeteer = require('puppeteer');
const { Telegraf } = require('telegraf');

export async function Scraper(url) {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.launch();
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
    await page.goto(url)

    async function sendMessage(value) {
        // send to public group
        bot.telegram.sendMessage('-432915557', '🎉 Released – And its only ' + value + '€ at ' + url);
        // send to public channel
        bot.telegram.sendMessage('@behringer_rd9_release', '🎉 Released – And its only ' + value + '€ at ' + url);
        // console.log('🎉 Released – And its only ' + value + '€ at ' + url)  

    }

    async function getPrice() {
    const src = await page.evaluate(() => {return document.querySelector('span[class="primary"]')});

    if (src !== null) {


        // const value = await page.evaluate(() => {
        //      return document.querySelector('span[class="primary"]').innerText.slice(0, -2)
        // })

        const value = await page.$eval('span[class="primary"]', node => (<HTMLElement>node).innerText.slice(0,-2));


        await sendMessage(value)
            
    } else {
        // send to public group
        bot.telegram.sendMessage('-432915557', "... still waiting ...");
        // send to public channel
        bot.telegram.sendMessage('@behringer_rd9_release', "... still waiting ...");
        // console.log("... still waiting ...");
    }
    }   
    await getPrice();
    await browser.close();
}

export default Scraper;