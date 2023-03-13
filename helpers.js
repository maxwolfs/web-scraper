// helpers.js

// Helper function to get the total number of log entries
async function getTotalLogs(pool) {
    const query = {
        text: "SELECT COUNT(*) FROM logs",
    };
    try {
        const result = await pool.query(query);
        return result.rows[0].count;
    } catch (err) {
        console.error("Error getting total logs:", err);
    }
}

// Helper function to get the timestamp of the first log entry
async function getFirstLogTimestamp(pool) {
    const query = {
        text: "SELECT timestamp FROM logs ORDER BY timestamp ASC LIMIT 1",
    };
    try {
        const result = await pool.query(query);
        return result.rows[0].timestamp;
    } catch (err) {
        console.error("Error getting first log timestamp:", err);
    }
}

module.exports = {
    getTotalLogs,
    getFirstLogTimestamp,
};
