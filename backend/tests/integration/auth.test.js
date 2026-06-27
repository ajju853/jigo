const request = require('supertest');
const app = require('../../src/app');
const prisma = require('../../src/config/database');
const bcrypt = require('bcryptjs');

describe('Auth REST Endpoints', () => {
  it('should register a new customer account successfully', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({
        name: 'John Test',
        email: 'john.test@example.com',
        password: 'Password123!',
        role: 'customer',
        phone: '+91 98765 00000',
        location: 'Mumbai, MH'
      });

    expect(res.statusCode).toBe(201);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user).toHaveProperty('id');
    expect(res.body.user.email).toBe('john.test@example.com');
    expect(res.body.user.role).toBe('customer');
  });

  it('should authenticate registered login credentials', async () => {
    const passHash = await bcrypt.hash('SecurePassword456!', 10);
    
    // Seed mock test user
    const user = await prisma.user.create({
      data: {
        name: 'Login Test',
        email: 'login.test@example.com',
        passwordHash: passHash,
        role: 'customer',
        location: 'Mumbai, MH'
      }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'login.test@example.com',
        password: 'SecurePassword456!'
      });

    expect(res.statusCode).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body.user.email).toBe('login.test@example.com');
  });

  it('should reject invalid password logins', async () => {
    const passHash = await bcrypt.hash('SecurePassword456!', 10);
    await prisma.user.create({
      data: {
        name: 'Invalid Test',
        email: 'invalid.test@example.com',
        passwordHash: passHash,
        role: 'customer'
      }
    });

    const res = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'invalid.test@example.com',
        password: 'WrongPassword!'
      });

    expect(res.statusCode).toBe(401);
    expect(res.body).toHaveProperty('error');
    expect(res.body.message).toContain('Invalid email or password');
  });
});
