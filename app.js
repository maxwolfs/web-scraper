require('dotenv').config();
const PORT = process.env.PORT || 3001;
const express = require('express');
const app = express();
const puppeteer = require('puppeteer');
const { Telegraf } = require('telegraf');
const { ToadScheduler, SimpleIntervalJob, Task } = require('toad-scheduler');

app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.launch();

const scheduler = new ToadScheduler()

const rd9Alarm = new Task('simple task', () => { scrapeProduct('https://www.thomann.de/de/behringer_rd_9.htm'); })
const job = new SimpleIntervalJob({ seconds: 10, }, rd9Alarm)

scheduler.addSimpleIntervalJob(job)

async function scrapeProduct(url) {
    const browser = await puppeteer.launch({ args: ['--no-sandbox'] });
    const page = await browser.newPage();
    await page.goto(url)

    await getPrice();
    await browser.close();

    async function getPrice() {
    const src = await page.evaluate(() => {return document.querySelector('span[class="primary"]')});

    if (src !== null) {
        const value = await page.evaluate(() => {
            return document.querySelector('span[class="primary"]').innerText.slice(0, -2)
        })
        await sendMessage(value)
            
    } else {
        console.log("... still waiting ...");
        app.get('/', (req, res) => {
            res.send('... still waiting ...')
        })
        }
    } 

    async function sendMessage(value) {
        const msg = '🎉 Released! – Go shop it for ' + value + '€ at ' + url;
        // send to public channel
        bot.telegram.sendMessage('@behringer_rd9_release', msg);
        console.log(msg);
        app.get('/', (req, res) => {
            res.send(msg)
        })
    }  
}

