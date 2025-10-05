const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const http = require('http');
const { Server } = require('socket.io');
const connectDB = require('./config/db');
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
  ? process.env.CLIENT_URL || 'https://help-desk-gamma-nine.vercel.app'
  : process.env.CLIENT_URL || 'http://localhost:5173';

const io = new Server(server, {
  cors: {
    origin: CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"]
  }
});

connectDB();
startSlaChecker(io);

app.use(cors({
  origin: CLIENT_URL,
  credentials: true,
  methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
  allowedHeaders: [
    "Content-Type",
    "Authorization",
    "idempotency-key",
    "Accept",
    "Origin",
    "X-Requested-With",
    "Access-Control-Request-Method",
    "Access-Control-Request-Headers"
  ]
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("io", io);

app.use('/api/auth', authRoute);
app.use('/api/tickets', isLoggedIn, rateLimit, ticketRoute);

server.listen(process.env.PORT || 3000, () => {
  console.log(`Server running on port ${process.env.PORT || 3000}`);
});
