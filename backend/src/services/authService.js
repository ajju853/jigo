const crypto = require('crypto');
const prisma = require('../config/database');
const { hashPassword, comparePassword } = require('../utils/bcrypt');
const { generateToken, generateRefreshToken, verifyRefreshToken, blacklistedTokens } = require('../utils/jwt');
const { sendMail } = require('./emailService');

class AuthService {
  async register(data) {
    const { email, password, name, role, phone, location, profilePhoto, dateOfBirth, gender } = data;

    if (!dateOfBirth || !gender) {
      const err = new Error('Date of birth and gender are required for registration.');
      err.statusCode = 400;
      err.error = 'Registration Error';
      throw err;
    }

    // Age validation
    const dob = new Date(dateOfBirth);
    const today = new Date();
    let age = today.getFullYear() - dob.getFullYear();
    const monthDiff = today.getMonth() - dob.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--;
    }

    if (age < 18) {
      const err = new Error('You must be at least 18 years old to register.');
      err.statusCode = 400;
      err.error = 'Age Restriction';
      throw err;
    }

    const existingUser = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    });

    if (existingUser) {
      const err = new Error('Email address is already registered.');
      err.statusCode = 400;
      err.error = 'Registration Error';
      throw err;
    }

    const passwordHash = await hashPassword(password);

    const result = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email: email.toLowerCase(),
          passwordHash,
          name,
          role,
          phone,
          location: location || 'Mumbai, Maharashtra',
          profilePhoto: profilePhoto || (role === 'customer'
            ? "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&q=80&w=200"
            : "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200"),
          isVerified: role === 'customer',
          dateOfBirth: new Date(dateOfBirth),
          gender: gender
        }
      });

      let profile = null;
      if (role === 'jigolo') {
        profile = await tx.profile.create({
          data: {
            userId: newUser.id,
            bio: 'Hello! I am new here. Please write a description under settings.',
            age: 25,
            gender: 'Male',
            pricePerHour: 1500,
            tags: ['New'],
            languages: ['English'],
            images: ['https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600'],
            specialties: ['Social Companion'],
            services: [
              { id: `pkg_${Date.now()}_1`, name: "Standard Date (1 Hr)", duration: 1, price: 1500 }
            ],
            availability: {
              Friday: ["18:00 - 22:00"],
              Saturday: ["12:00 - 22:00"],
              Sunday: ["12:00 - 20:00"]
            }
          }
        });
      }

      return { user: newUser, profile };
    });

    const token = generateToken({ id: result.user.id, role: result.user.role });
    const refreshToken = generateRefreshToken({ id: result.user.id, role: result.user.role });
    const { passwordHash: _, ...userWithoutPassword } = result.user;

    return {
      token,
      refreshToken,
      user: { ...userWithoutPassword, profile: result.profile }
    };
  }

  async login(email, password) {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true }
    });

    if (!user || !(await comparePassword(password, user.passwordHash))) {
      const err = new Error('Invalid email or password.');
      err.statusCode = 401;
      err.error = 'Authentication Error';
      throw err;
    }

    if (!user.isActive) {
      const err = new Error('Your account is currently disabled. Contact support for info.');
      err.statusCode = 403;
      err.error = 'Access Suspended';
      throw err;
    }

    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() }
    });

    const token = generateToken({ id: user.id, role: user.role });
    const refreshToken = generateRefreshToken({ id: user.id, role: user.role });
    const { passwordHash: _, ...userWithoutPassword } = user;

    return {
      token,
      refreshToken,
      user: userWithoutPassword
    };
  }

  async getMe(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { profile: true }
    });

    if (!user) {
      const err = new Error('User not found.');
      err.statusCode = 404;
      err.error = 'Not Found';
      throw err;
    }

    const { passwordHash: _, ...userWithoutPassword } = user;
    return { user: userWithoutPassword };
  }

  async refreshToken(token) {
    try {
      const decoded = verifyRefreshToken(token);
      const user = await prisma.user.findUnique({ where: { id: decoded.id } });
      if (!user || !user.isActive) throw new Error();

      const newToken = generateToken({ id: user.id, role: user.role });
      const newRefreshToken = generateRefreshToken({ id: user.id, role: user.role });
      return { token: newToken, refreshToken: newRefreshToken };
    } catch {
      const err = new Error('Invalid or expired refresh token.');
      err.statusCode = 401;
      err.error = 'Authentication Error';
      throw err;
    }
  }

  async logout(token) {
    blacklistedTokens.add(token);
    return { message: 'Logged out successfully.' };
  }

  async forgotPassword(email) {
    const user = await prisma.user.findUnique({ where: { email: email.toLowerCase() } });
    if (!user) return { message: 'If that email exists, a reset link has been sent.' };

    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetExpires = new Date(Date.now() + 3600000);

    await prisma.user.update({
      where: { id: user.id },
      data: { passwordResetToken: resetToken, passwordResetExpires: resetExpires }
    });

    const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${resetToken}`;

    await sendMail({
      to: user.email,
      subject: 'Password Reset - Jigo App',
      html: `<div><h2>Password Reset</h2><p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 1 hour.</p></div>`
    });

    return { message: 'If that email exists, a reset link has been sent.' };
  }

  async resetPassword(token, newPassword) {
    const user = await prisma.user.findFirst({
      where: {
        passwordResetToken: token,
        passwordResetExpires: { gte: new Date() }
      }
    });

    if (!user) {
      const err = new Error('Invalid or expired reset token.');
      err.statusCode = 400;
      err.error = 'Reset Error';
      throw err;
    }

    const passwordHash = await hashPassword(newPassword);
    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash,
        passwordResetToken: null,
        passwordResetExpires: null
      }
    });

    return { message: 'Password reset successfully.' };
  }
}

module.exports = new AuthService();
