require('dotenv').config();
const http = require('http');
const { Server } = require('socket.io');
const app = require('./app');
const connectDB = require('./config/db');
const { initSockets } = require('./sockets');

const PORT = process.env.PORT || 5000;

const start = async () => {
  await connectDB();

  const server = http.createServer(app);

  const allowedOrigins = (process.env.CLIENT_URLS || '').split(',').map((s) => s.trim());
  const io = new Server(server, { cors: { origin: allowedOrigins, credentials: true } });
  initSockets(io);

  server.listen(PORT, () => {
    console.log(`Local Bites API running on port ${PORT} [${process.env.NODE_ENV}]`);
  });
};

start();
