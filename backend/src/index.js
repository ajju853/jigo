require('dotenv').config();
const http = require('http');
const cron = require('node-cron');
const { Server } = require('socket.io');
const app = require('./app');
const prisma = require('./config/database');
const { setupSocket } = require('./socket/handler');
const cronService = require('./services/cronService');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    await prisma.$connect();
    console.log('PostgreSQL database connected successfully via Prisma ORM.');

    cron.schedule('0 0 * * *', () => {
      cronService.runAll();
    });
    console.log('Cron jobs scheduled (daily at midnight).');

    cron.schedule('*/30 * * * *', () => {
      cronService.expireSubscriptions();
      cronService.expirePromotions();
    });
    console.log('Cron jobs scheduled (every 30 min for expiry checks).');

    const server = http.createServer(app);

    const io = new Server(server, {
      cors: {
        origin: true,
        methods: ['GET', 'POST']
      }
    });

    setupSocket(io);

    server.listen(PORT, () => {
      console.log(`Jigo API server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to connect to the database or start the server:', error);
    process.exit(1);
  }
}

startServer();

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  console.log('Database client disconnected. Jigo API shut down gracefully.');
  process.exit(0);
});
