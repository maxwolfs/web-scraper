const puppeteer = require("puppeteer");
const TelegramBot = require("node-telegram-bot-api");

// Replace with your Telegram bot API token
const telegramToken = process.env.BOT_TOKEN;

// Replace with the chat or channel ID you want to send messages to
const chatId = "YOUR_CHAT_ID";

// URL of the page to scrape
const url =
    "https://www.canyon.com/de-de/rennrad/race-rennrad/ultimate/cf-sl/ultimate-cf-sl-7-etap/3318.html?dwvar_3318_pv_rahmenfarbe=R101_P01";

// Interval between each request in milliseconds (10 seconds)
const interval = 10000;

// Initialize the Telegram bot
const bot = new TelegramBot(telegramToken, { polling: false });

// Function to check if the button is available
async function checkAvailability() {
    try {
        const browser = await puppeteer.launch();
        const page = await browser.newPage();
        await page.goto(url);
        const button = await page.$('button[data-product-size="S"]');
        if (button) {
            // Button is available, send a message to the Telegram channel
            bot.sendMessage(chatId, "🚲");
        } else {
            console.log("🚳");
        }
        await browser.close();
    } catch (error) {
        console.error(error);
    }
}

// Call the checkAvailability function every interval milliseconds
setInterval(checkAvailability, interval);
