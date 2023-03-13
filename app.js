require("dotenv").config();
const PORT = process.env.PORT || 3001;
const express = require("express");
const app = express();
const puppeteer = require("puppeteer");
const { Telegraf } = require("telegraf");
const { ToadScheduler, SimpleIntervalJob, Task } = require("toad-scheduler");

app.listen(PORT, () => {
    console.log(`Our app is running on port ${PORT}`);
});

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.launch();

const scheduler = new ToadScheduler();

const productUrl =
    "https://www.canyon.com/de-de/rennrad/race-rennrad/ultimate/cf-sl/ultimate-cf-sl-7-etap/3318.html?dwvar_3318_pv_rahmenfarbe=R101_P01";

const productAlarm = new Task("simple task", () => {
    scrapeProduct(productUrl);
});
const job = new SimpleIntervalJob({ seconds: 60 }, productAlarm);

scheduler.addSimpleIntervalJob(job);

async function scrapeProduct(url) {
    try {
        const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
        const page = await browser.newPage();
        await page.goto(url);

        await checkAvailability();
        await browser.close();

        async function checkAvailability() {
            const src = await page.evaluate(() => {
                return document.querySelector('button[data-product-size="S"]');
            });

            if (src !== null) {
                await sendMessage("🚲");
            } else {
                console.log("🚳");
                app.get("/", (req, res) => {
                    res.send("🚳");
                });
            }
        }

        async function sendMessage() {
            const msg = "🎉 Released! – Go shop it for at " + productUrl;
            // send to public channel
            bot.telegram.sendMessage("@CanyonUltimateCFSL7eTapSBlackSnow", msg);
            console.log(msg);
            app.get("/", (req, res) => {
                res.send(msg);
            });
        }
    } catch (err) {
        console.error(err);
    }
}
