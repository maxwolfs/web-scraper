// create a WebSocket connection to the server
const socket = io();

window.addEventListener("load", (event) => {
    updateLogsCount();
    updateTimeSinceStart();
});

// add a new log entry to the DOM
function addLogEntry(timestamp, message) {
    const logsElement = document.getElementById("logs");
    const logEntryElement = document.createElement("div");
    logEntryElement.classList.add("log-entry");
    const logTimestampElement = document.createElement("span");
    logTimestampElement.classList.add("log-timestamp");
    logTimestampElement.innerText = `[${formatTerminalTime(timestamp)}]`;
    const logMessageElement = document.createElement("span");
    logMessageElement.classList.add("log-message");
    logMessageElement.innerText = message;
    logEntryElement.appendChild(logTimestampElement);
    logEntryElement.appendChild(logMessageElement);
    logsElement.appendChild(logEntryElement);
    logsElement.scrollTop = logsElement.scrollHeight;
}

// listen for log entries from the server
socket.on("logEntry", ({ timestamp, message }) => {
    addLogEntry(timestamp, message);
    updateLogsCount();
    updateTimeSinceStart();
});

function updateTimeSinceStart() {
    fetch("/logs/first-timestamp")
        .then((response) => response.json())
        .then((data) => {
            const durationElement = document.getElementById("duration");
            const durationEntryElement = document.createElement("span");
            const time = formatHumanTimestamp(data.timestamp);
            durationElement.innerText = `${time} `;
            durationElement.appendChild(durationEntryElement);
        })
        .catch((error) => console.error(error));
}

function updateLogsCount() {
    fetch("/logs/count")
        .then((response) => response.json())
        .then((data) => {
            const countElement = document.getElementById("count");
            const countEntryElement = document.createElement("span");
            countElement.innerText = `${data.count} `;
            countElement.appendChild(countEntryElement);
        })
        .catch((error) => console.error(error));
}

// Helper function to format time in human-readable format
function formatHumanTimestamp(timestamp) {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = Math.floor((now - date) / 1000); // time difference in seconds

    if (diff < 60) {
        return `${diff} seconds ago`;
    } else if (diff < 60 * 60) {
        const minutes = Math.floor(diff / 60);
        return `${minutes} ${minutes === 1 ? "minute" : "minutes"} ago`;
    } else if (diff < 60 * 60 * 24) {
        const hours = Math.floor(diff / (60 * 60));
        return `${hours} ${hours === 1 ? "hour" : "hours"} ago`;
    } else if (diff < 60 * 60 * 24 * 7) {
        const days = Math.floor(diff / (60 * 60 * 24));
        return `${days} ${days === 1 ? "day" : "days"} ago`;
    } else {
        const year = date.getFullYear();
        const month = addZeroPadding(date.getMonth() + 1);
        const day = addZeroPadding(date.getDate());
        return `${year}-${month}-${day}`;
    }
}

function formatTerminalTime(timestamp) {
    const date = new Date(timestamp);
    const year = date.getFullYear();
    const month = addZeroPadding(date.getMonth() + 1);
    const day = addZeroPadding(date.getDate());
    const hours = addZeroPadding(date.getHours());
    const minutes = addZeroPadding(date.getMinutes());
    const seconds = addZeroPadding(date.getSeconds());
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
}

function addZeroPadding(number) {
    return number.toString().padStart(2, "0");
}