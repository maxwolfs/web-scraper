require('dotenv').config();
const PORT = process.env.PORT || 3000;
const puppeteer = require('puppeteer');
const { Telegraf } = require('telegraf');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');

const scheduler = new ToadScheduler()

const rd9Alarm = new Task('simple task', () => { scrapeProduct('https://www.thomann.de/de/behringer_rd_9.htm'); })
const dailyStatus = new Task('simple task', () => { dailyReminder() })
const job = new SimpleIntervalJob({ seconds: 10, }, rd9Alarm)
const daily = new SimpleIntervalJob({ days: 1, }, dailyStatus)

scheduler.addSimpleIntervalJob(job)
scheduler.addSimpleIntervalJob(daily)

async function dailyReminder(url) {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.launch();
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url)

    async function sendMessage(value) {
        bot.telegram.sendMessage('@behringer_rd9_release', '🎉 Released – And its only ' + value + '€ at ' + url);
        console.log('🎉 Released – And its only ' + value + '€ at ' + url)
    }

    async function getPrice() {
        const src = await page.evaluate(() => { return document.querySelector('span[class="primary"]') });

        if (src !== null) {
            const value = await page.evaluate(() => {
                return document.querySelector('span[class="primary"]').innerText.slice(0, -2)
            })
            await sendMessage(value)
        } else {
            bot.telegram.sendMessage('Another day has passed and still waiting...');
            console.log("Another day has passed and still waiting...");
        }
    }
    await getPrice();
    await browser.close();
}

async function scrapeProduct(url) {
    const bot = new Telegraf(process.env.BOT_TOKEN);
    bot.launch();
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url)

    async function sendMessage(value) {
        // send to public group
        bot.telegram.sendMessage('-432915557', '🎉 Released – And its only ' + value + '€ at ' + url);
        // send to public channel
        bot.telegram.sendMessage('@behringer_rd9_release', '🎉 Released – And its only ' + value + '€ at ' + url);
        console.log('🎉 Released – And its only ' + value + '€ at ' + url)  

    }

    async function getPrice() {
    const src = await page.evaluate(() => {return document.querySelector('span[class="primary"]')});

    if (src !== null) {
        const value = await page.evaluate(() => {
            return document.querySelector('span[class="primary"]').innerText.slice(0, -2)
        })
        await sendMessage(value)
            
    } else {
        // send to public group
        // bot.telegram.sendMessage('-432915557', "... still waiting ...");
        // // send to public channel
        // bot.telegram.sendMessage('@behringer_rd9_release', "... still waiting ...");
        console.log("... still waiting ...");
    }
    }   
    await getPrice();
    await browser.close();
}

