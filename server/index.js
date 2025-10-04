const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 3000;
const authRoute = require('./routes/authRoute');
const ticketRoute = require('./routes/ticketRoute');
const { rateLimit } = require('./middleware/rateLimitMiddleware');
const { isLoggedIn } = require('./middleware/authMiddleware');
const { startSlaChecker } = require("./cron/slaChecker");

dotenv.config();

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_URL || "http://localhost:5173",
        credentials: true,
    },
})

connectDB();
startSlaChecker(io);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());
app.use(cookieParser());
app.set("io", io);

app.use('/api/auth/', authRoute);
app.use('/api/tickets/', isLoggedIn, rateLimit, ticketRoute);

server.listen(PORT, () => {
    console.log(`Server is live on PORT: ${PORT}`)
})