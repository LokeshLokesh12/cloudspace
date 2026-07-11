const http = require('http');
const { Server } = require('socket.io');
const jwt = require('jsonwebtoken');
const createApp = require('./app');
const connectDB = require('./config/database');
const env = require('./config/env');
const { ensureUploadsDir } = require('./utils/fileUtils');

const startServer = async () => {
  await connectDB();
  ensureUploadsDir();

  const app = createApp();
  const server = http.createServer(app);

  const io = new Server(server, {
    cors: { origin: env.clientUrl, credentials: true },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth?.token;
    if (!token) return next(new Error('Authentication required'));
    try {
      const decoded = jwt.verify(token, env.jwt.accessSecret);
      socket.userId = decoded.sub;
      next();
    } catch {
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    socket.join(`user:${socket.userId}`);
    console.log(`Socket connected: user ${socket.userId}`);
    socket.on('disconnect', () => console.log(`Socket disconnected: user ${socket.userId}`));
  });

  app.set('io', io);

  server.listen(env.port, () => {
    console.log(`Server running on port ${env.port} [${env.nodeEnv}]`);
  });
};

startServer();
