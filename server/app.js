require('dotenv').config();
const express = require('express')
const http = require('http')
const db = require('./connection/connect')
const app = express()
const PORT = 3123
const cors = require('cors')
const { Server } = require('socket.io')

// Middleware
app.use(express.json())
app.use(cors())

// Create server
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: "*" }
})

// Socket.io
io.on("connection", (socket) => {
    console.log("User connected: ", socket.id);

    //Handle message
    socket.on("send_message", async ({ userId, message, isAnonymous }) => {
        try {
            await db.query("INSERT INTO messages (user_id, message, is_anonymous) VALUES (?, ?, ?)", [userId, message, isAnonymous]);

            // Retrieves the username, message and timestamp
            const [rows] = await db.query(`SELECT m.user_id, 
                m.message, 
                u.name AS user, 
                m.timestamp FROM messages m 
                JOIN users u ON m.user_id = u.id 
                WHERE m.user_id = ? 
                ORDER BY m.timestamp DESC LIMIT 1`, 
                [userId]);

            const messageData = rows[0];
            // Checking for anonymous
            if (isAnonymous) {
                messageData.user = "Anonymous"
            }

            io.emit("receive_message", {
                user_id: messageData.user_id,
                user: isAnonymous ? "Anonymous" : messageData.user,
                message: messageData.message,
                timestamp: messageData.timestamp
            });

        } catch (e) {
            console.error(e);
        }
    });

    socket.on("disconnect", () => {
        console.log("User disconnected: ", socket.id);
    });
});


app.get('/', (req, res) => {
    res.status(200).send("Server is running!")
});

app.get('/messages', async (req, res) => {
    try {
        const [rows] = await db.query(`
            SELECT m.user_id, 
            m.message, 
            CASE WHEN m.is_anonymous THEN 'Anonymous' ELSE u.name END as user, 
            m.timestamp FROM messages m 
            JOIN users u ON m.user_id = u.id 
            ORDER BY m.timestamp ASC
            `);
        res.json(rows);
    } catch (err) {
        console.error(err);
    }
})

app.post('/join', async (req, res) => {
    const { name } = req.body;

    try {
        const [rows] = await db.query("SELECT * FROM users WHERE name = ?", [name]);

        let userId;
        if (rows.length > 0) {
            userId = rows[0].id;
        } else {
            const [result] = await db.query("INSERT INTO users (name) VALUE (?)", [name]);
            userId = result.insertId;
        }

        res.json({ userId, name });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Database error!" });
    }
})

server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});