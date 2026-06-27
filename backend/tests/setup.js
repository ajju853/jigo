const prisma = require('../src/config/database');

beforeAll(async () => {
  try {
    await prisma.$connect();
  } catch (err) {
    console.error('Test DB Connection Error:', err);
  }
});

afterEach(async () => {
  // Use a batch transaction for atomic cleanup
  try {
    await prisma.$transaction([
      prisma.review.deleteMany(),
      prisma.booking.deleteMany(),
      prisma.favorite.deleteMany(),
      prisma.message.deleteMany(),
      prisma.profile.deleteMany(),
      prisma.notification.deleteMany(),
      prisma.user.deleteMany()
    ]);
  } catch (err) {
    console.error('Test DB Cleanup Error:', err);
  }
});

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch (err) {
    console.error('Test DB Disconnect Error:', err);
  }
});
