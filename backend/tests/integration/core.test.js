const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/database');

describe('Profile REST Endpoints', () => {
  let token;
  let jigoloToken;
  let jigolo;

  beforeAll(async () => {
    const customerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Profile Tester', email: 'profile.test@example.com', password: 'Pass1234!', role: 'customer' });
    token = customerRes.body.token;

    const jigoloRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Jigolo Tester', email: 'jigolo.profile@example.com', password: 'Pass1234!', role: 'jigolo', phone: '+91 11111 11111', location: 'Delhi' });
    jigoloToken = jigoloRes.body.token;
    jigolo = jigoloRes.body.user;
  });

  it('should list all profiles publicly', async () => {
    const res = await request(app).get('/api/profiles');
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should get a single profile by ID', async () => {
    const profile = await prisma.profile.findFirst();
    if (!profile) return;
    const res = await request(app).get(`/api/profiles/${profile.id}`);
    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('id');
  });

  it('should return 404 for non-existent profile', async () => {
    const res = await request(app).get('/api/profiles/00000000-0000-0000-0000-000000000000');
    expect(res.statusCode).toBe(404);
  });
});

describe('Booking REST Endpoints', () => {
  let customerToken;
  let jigoloToken;
  let jigoloId;
  let profileId;
  let bookingId;

  beforeAll(async () => {
    const customerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Booking Customer', email: 'booking.customer@example.com', password: 'Pass1234!', role: 'customer' });
    customerToken = customerRes.body.token;

    const jigoloRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Booking Jigolo', email: 'booking.jigolo@example.com', password: 'Pass1234!', role: 'jigolo', phone: '+91 22222 22222', location: 'Mumbai' });
    jigoloToken = jigoloRes.body.token;
    jigoloId = jigoloRes.body.user.id;

    const profile = await prisma.profile.findUnique({ where: { userId: jigoloId } });
    if (profile) profileId = profile.id;
  });

  it('should create a booking with correct endTime calculation', async () => {
    if (!profileId) return;

    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({
        profileId,
        date: '2026-07-15',
        time: '14:00',
        duration: 2,
        packageId: 'standard',
        totalPrice: 200
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('id');
    expect(res.body.startTime).toBe('14:00');
    expect(res.body.endTime).toBe('16:00');
    expect(res.body.bookingNumber).toBeTruthy();
    expect(res.body.paymentStatus).toBe('pending');
    bookingId = res.body.id;
  });

  it('should list bookings for customer', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${customerToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should list bookings for jigolo', async () => {
    const res = await request(app)
      .get('/api/bookings')
      .set('Authorization', `Bearer ${jigoloToken}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });

  it('should update booking status', async () => {
    if (!bookingId) return;
    const res = await request(app)
      .put(`/api/bookings/${bookingId}`)
      .set('Authorization', `Bearer ${jigoloToken}`)
      .send({ status: 'confirmed' });
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe('confirmed');
  });

  it('should reject booking own profile', async () => {
    if (!profileId) return;
    const res = await request(app)
      .post('/api/bookings')
      .set('Authorization', `Bearer ${jigoloToken}`)
      .send({
        profileId,
        date: '2026-08-01',
        time: '10:00',
        duration: 1,
        packageId: 'standard',
        totalPrice: 100
      });
    expect(res.statusCode).toBe(400);
  });
});

describe('Review REST Endpoints', () => {
  let customerToken;
  let jigoloId;
  let profileId;
  let bookingId;

  beforeAll(async () => {
    const customerRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Review Customer', email: 'review.customer@example.com', password: 'Pass1234!', role: 'customer' });
    customerToken = customerRes.body.token;

    const jigoloRes = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Review Jigolo', email: 'review.jigolo@example.com', password: 'Pass1234!', role: 'jigolo' });
    jigoloId = jigoloRes.body.user.id;

    const profile = await prisma.profile.findUnique({ where: { userId: jigoloId } });
    if (profile) profileId = profile.id;
    if (!profileId) return;

    const booking = await prisma.booking.create({
      data: {
        customerId: customerRes.body.user.id,
        jigoloId,
        profileId,
        date: new Date('2026-07-01'),
        startTime: '10:00',
        endTime: '12:00',
        totalPrice: 150,
        status: 'completed',
        paymentStatus: 'paid',
        bookingNumber: 'REV-TEST-001'
      }
    });
    bookingId = booking.id;
  });

  it('should create a review for completed booking', async () => {
    if (!bookingId) return;
    const res = await request(app)
      .post('/api/reviews')
      .set('Authorization', `Bearer ${customerToken}`)
      .send({ bookingId, rating: 5, comment: 'Excellent service!' });
    expect(res.statusCode).toBe(201);
    expect(res.body.rating).toBe(5);
  });

  it('should list reviews for a profile', async () => {
    if (!profileId) return;
    const res = await request(app).get(`/api/reviews/${profileId}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Message REST Endpoints', () => {
  let token1;
  let token2;
  let user2;

  beforeAll(async () => {
    const res1 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Msg User 1', email: 'msg1@example.com', password: 'Pass1234!', role: 'customer' });
    token1 = res1.body.token;

    const res2 = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Msg User 2', email: 'msg2@example.com', password: 'Pass1234!', role: 'jigolo' });
    token2 = res2.body.token;
    user2 = res2.body.user;
  });

  it('should send a message between users', async () => {
    const res = await request(app)
      .post('/api/messages')
      .set('Authorization', `Bearer ${token1}`)
      .send({ receiverId: user2.id, content: 'Hello! Are you available?' });
    expect(res.statusCode).toBe(201);
    expect(res.body.messages).toBeDefined();
  });

  it('should list conversations', async () => {
    const res = await request(app)
      .get('/api/messages')
      .set('Authorization', `Bearer ${token1}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
  });
});

describe('Notification REST Endpoints', () => {
  let token;
  let userId;

  beforeAll(async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ name: 'Notif User', email: 'notif@example.com', password: 'Pass1234!', role: 'customer' });
    token = res.body.token;
    userId = res.body.user.id;

    await prisma.notification.create({
      data: { userId, title: 'Test Notification', message: 'This is a test', type: 'test' }
    });
  });

  it('should list notifications', async () => {
    const res = await request(app)
      .get('/api/notifications')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(Array.isArray(res.body)).toBe(true);
    expect(res.body.length).toBeGreaterThanOrEqual(1);
  });

  it('should mark a notification as read', async () => {
    const notif = await prisma.notification.findFirst({ where: { userId } });
    if (!notif) return;
    const res = await request(app)
      .put(`/api/notifications/${notif.id}/read`)
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
    expect(res.body.isRead).toBe(true);
  });

  it('should mark all notifications as read', async () => {
    const res = await request(app)
      .put('/api/notifications/read-all')
      .set('Authorization', `Bearer ${token}`);
    expect(res.statusCode).toBe(200);
  });
});
