const prisma = require('../config/database');

class UserService {
  async updateMe(userId, data) {
    const { name, phone, location, profilePhoto } = data;

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: { name, phone, location, profilePhoto }
    });

    const { passwordHash: _, ...userWithoutPassword } = updatedUser;
    return userWithoutPassword;
  }
}

module.exports = new UserService();
