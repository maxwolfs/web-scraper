require("dotenv").config();
const PORT = process.env.PORT || 3001;
const express = require("express");
const app = express();
const { Pool } = require("pg");
var cors = require("cors");
const http = require("http");
const socketio = require("socket.io");
const puppeteer = require("puppeteer");
const { Telegraf } = require("telegraf");
const { ToadScheduler, SimpleIntervalJob, Task } = require("toad-scheduler");
const { getTotalLogs, getFirstLogTimestamp } = require("./helpers");

// create a server and attach the app to it
const server = http.createServer(app);

// listen for HTTP requests on port 3000
server.listen(PORT, () => {
    console.log(`Server started on port ${PORT}`);
});

// create a Socket.io instance and attach it to the server
const io = socketio(server, {
    path: "/socket.io",
    cors: { origin: "*" },
});

// serve static files from the public directory
app.use(express.static("public"));
app.use(cors());

// serve the socket.io client script
app.get("/socket.io/socket.io.js", (req, res) => {
    res.sendFile(
        __dirname + "/node_modules/socket.io/client-dist/socket.io.js"
    );
});

// create a new PostgreSQL connection pool
const pool = new Pool({
    user: process.env.PG_USER,
    host: process.env.PG_HOST,
    database: process.env.PG_DB,
    password: process.env.PG_PW,
    port: 5432, // default PostgreSQL port
});

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.launch();

const scheduler = new ToadScheduler();

const productsToCheck = [
    {
        title: "cf-sl-7-etap",
        url: "https://www.canyon.com/de-de/rennrad/race-rennrad/ultimate/cf-sl/ultimate-cf-sl-7-etap/3318.html?dwvar_3318_pv_rahmenfarbe=R101_P01",
    },
    {
        title: "cf-sl-8-aero",
        url: "https://www.canyon.com/de-de/rennrad/race-rennrad/ultimate/cf-sl/ultimate-cf-sl-7-etap/3318.html?dwvar_3318_pv_rahmenfarbe=R101_P01",
    },
];

const productAlarm = new Task("simple task", () => {
    scrapeProduct(productsToCheck);
});
const job = new SimpleIntervalJob({ seconds: 10 }, productAlarm);

scheduler.addSimpleIntervalJob(job);

async function scrapeProduct(productsToCheck) {
    try {
        const browser = await puppeteer.launch({ args: ["--no-sandbox"] });
        const page = await browser.newPage();

        for (const product of productsToCheck) {
            await page.goto(product.url);

            await checkAvailability(product);
        }

        await browser.close();

        async function checkAvailability(product) {
            const src = await page.evaluate(() => {
                return document.querySelector('button[data-product-size="S"]');
            });

            const success =
                "🚲 – Go get  " +
                product.title +
                " fast 🎉: ----> " +
                product.url;
            const waiting = "🚳 – " + product.title + " not available yet. ⏳";
            const timestamp = new Date().toISOString();

            if (src !== null) {
                bot.telegram.sendMessage("@ultimateMalle", success);
                addLogEntry(timestamp, success);
            } else {
                addLogEntry(timestamp, waiting);
            }
        }
    } catch (err) {
        console.error(err);
    }
}

// function to add a new log entry to the database
async function addLogEntry(timestamp, message) {
    const query = {
        text: "INSERT INTO logs (timestamp, message) VALUES ($1, $2)",
        values: [timestamp, message],
    };

    try {
        await pool.query(query);
        pool.query(
            `NOTIFY logs, '{"timestamp":"${timestamp}", "message":"${message}"}'`
        );
    } catch (err) {
        console.error("Error adding log entry:", err);
    }
}

// subscribe to new log entries in the database
async function subscribeToLogs() {
    const client = await pool.connect();
    await client.query("LISTEN logs");
    console.log("Subscribed to logs");

    client.on("notification", async (msg) => {
        const entry = JSON.parse(msg.payload);
        io.emit("logEntry", entry);
    });
}

subscribeToLogs();

// Route to get the total number of log entries
app.get("/logs/count", async (req, res) => {
    try {
        const count = await getTotalLogs(pool);
        res.json({ count });
    } catch (err) {
        res.status(500).json({ error: "Error getting total logs" });
    }
});

// Route to get the timestamp of the first log entry
app.get("/logs/first-timestamp", async (req, res) => {
    try {
        const timestamp = await getFirstLogTimestamp(pool);
        res.json({ timestamp });
    } catch (err) {
        res.status(500).json({ error: "Error getting first log timestamp" });
    }
});
