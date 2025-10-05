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

const isProd = process.env.NODE_ENV === 'production';
const CLIENT_URL = isProd
  ? process.env.CLIENT_URL || 'https://help-desk-97kgh9i2d-chasang-tserinh-bhutias-projects.vercel.app/'  
  : process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
  },
});

connectDB();
startSlaChecker(io);

// ✅ Allow cookies from your frontend
app.use(
  cors({
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("io", io);

// Routes
app.use('/api/auth', authRoute);
app.use('/api/tickets', isLoggedIn, rateLimit, ticketRoute);

server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});
