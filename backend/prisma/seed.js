const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function hashPassword(pass) {
  return bcrypt.hash(pass, 10);
}

async function main() {
  console.log('🌱 Starting database seeding...');

  // 1. Clean existing records in correct dependency order
  await prisma.review.deleteMany();
  await prisma.booking.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.message.deleteMany();
  await prisma.profile.deleteMany();
  await prisma.notification.deleteMany();
  await prisma.user.deleteMany();

  console.log('🧹 Cleaned existing database tables.');

  const passHash = await hashPassword('password123');

  // 2. Create Admin User
  await prisma.user.create({
    data: {
      email: 'admin@jigo.app',
      passwordHash: passHash,
      name: 'Admin',
      role: 'admin',
      isVerified: true,
      isActive: true
    }
  });

  // 3. Create Customers
  const customer1 = await prisma.user.create({
    data: {
      email: 'aarav@example.com',
      passwordHash: passHash,
      name: 'Aarav Sharma',
      role: 'customer',
      phone: '+91 98765 43210',
      location: 'Mumbai, Maharashtra',
      profilePhoto: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200',
      isVerified: true
    }
  });

  const customer2 = await prisma.user.create({
    data: {
      email: 'priya@example.com',
      passwordHash: passHash,
      name: 'Priya Patel',
      role: 'customer',
      phone: '+91 98123 45678',
      location: 'Delhi, NCR',
      profilePhoto: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200',
      isVerified: true
    }
  });

  console.log('👥 Created customer accounts.');

  // 3. Create Jigolo User Accounts & Profiles
  const jigolosSeed = [
    {
      email: 'kabir@example.com',
      name: 'Kabir Malhotra',
      phone: '+91 99999 88888',
      location: 'Bandra, Mumbai',
      profilePhoto: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
      profile: {
        bio: 'Sophisticated, well-read gentleman with a passion for fine dining, ballroom dancing, and deep philosophical conversations. Ideal companion for high-profile corporate galas, private dinners, or a relaxed weekend getaway.',
        age: 26,
        gender: 'Male',
        pricePerHour: 2500,
        rating: 4.9,
        reviewsCount: 3,
        verified: true,
        tags: ['🔥 Popular', '⭐ Top Rated'],
        languages: ['English', 'Hindi', 'Punjabi'],
        specialties: ['Fine Dining', 'Social Escort', 'Travel Companion', 'Fitness Guide'],
        images: [
          'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600'
        ],
        services: [
          { id: 'pkg_1_1', name: 'Social Companion Dinner (1 Hr)', duration: 1, price: 2500 },
          { id: 'pkg_1_2', name: 'Gala Event Accompany (2 Hrs)', duration: 2, price: 4500 },
          { id: 'pkg_1_3', name: 'Premium VIP Escort (4 Hrs)', duration: 4, price: 8000 },
          { id: 'pkg_1_4', name: 'Weekend Getaway Travel Package (Full Day)', duration: 24, price: 25000 }
        ],
        availability: {
          Monday: ["18:00 - 23:00"],
          Tuesday: ["18:00 - 23:00"],
          Wednesday: ["18:00 - 23:00"],
          Thursday: ["18:00 - 23:00"],
          Friday: ["15:00 - 23:59"],
          Saturday: ["10:00 - 23:59"],
          Sunday: ["10:00 - 22:00"]
        }
      }
    },
    {
      email: 'rohan@example.com',
      name: 'Rohan Mehra',
      phone: '+91 98765 00001',
      location: 'Indiranagar, Bengaluru',
      profilePhoto: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
      profile: {
        bio: 'Energetic, fitness enthusiast, and professional conversationalist. Love exploring cafes, trekking, and listening to indie music. Always down for some fun, laughter, and high energy gatherings.',
        age: 24,
        gender: 'Male',
        pricePerHour: 1800,
        rating: 4.7,
        reviewsCount: 2,
        verified: true,
        tags: ['🆕 New', '🔥 Popular'],
        languages: ['English', 'Hindi', 'Kannada'],
        specialties: ['Cafe Hopping', 'Adventure Companion', 'Concert Buddy', 'Gym Partner'],
        images: [
          'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600'
        ],
        services: [
          { id: 'pkg_2_1', name: 'Quick Hangout (1 Hr)', duration: 1, price: 1800 },
          { id: 'pkg_2_2', name: 'Cafe/Trek Explorer (2 Hrs)', duration: 2, price: 3200 },
          { id: 'pkg_2_3', name: 'Concert or Party Buddy (4 Hrs)', duration: 4, price: 6000 }
        ],
        availability: {
          Friday: ["17:00 - 23:00"],
          Saturday: ["08:00 - 23:00"],
          Sunday: ["08:00 - 22:00"]
        }
      }
    },
    {
      email: 'arjun@example.com',
      name: 'Arjun Sen',
      phone: '+91 98765 00002',
      location: 'Salt Lake, Kolkata',
      profilePhoto: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
      profile: {
        bio: 'Art history scholar, pianist, and wine lover. Looking to accompany discerning clients to art galleries, classical music concerts, or intellectual gatherings. Speaks four languages fluently.',
        age: 28,
        gender: 'Male',
        pricePerHour: 3000,
        rating: 5.0,
        reviewsCount: 1,
        verified: true,
        tags: ['⭐ Top Rated'],
        languages: ['English', 'Bengali', 'Hindi', 'French'],
        specialties: ['Art Exhibitions', 'Intellectual Dialogues', 'Classical Music', 'Wine Tasting'],
        images: [
          'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600',
          'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600'
        ],
        services: [
          { id: 'pkg_3_1', name: 'Art Walk & Dialogue (1 Hr)', duration: 1, price: 3000 },
          { id: 'pkg_3_2', name: 'Opera/Concert Companion (2 Hrs)', duration: 2, price: 5500 },
          { id: 'pkg_3_3', name: 'Exhibition & Private Dinner (4 Hrs)', duration: 4, price: 10000 }
        ],
        availability: {
          Wednesday: ["14:00 - 21:00"],
          Thursday: ["14:00 - 21:00"],
          Friday: ["14:00 - 22:00"],
          Saturday: ["12:00 - 22:00"]
        }
      }
    }
  ];

  const profileMap = {}; // Maps email -> Profile details

  for (const j of jigolosSeed) {
    const user = await prisma.user.create({
      data: {
        email: j.email,
        passwordHash: passHash,
        name: j.name,
        role: 'jigolo',
        phone: j.phone,
        location: j.location,
        profilePhoto: j.profilePhoto,
        isVerified: true
      }
    });

    const profile = await prisma.profile.create({
      data: {
        userId: user.id,
        ...j.profile
      }
    });

    profileMap[j.email] = { user, profile };
  }

  console.log('🤵 Created jigolo accounts and profiles.');

  // 4. Create Bookings
  const kabirInfo = profileMap['kabir@example.com'];
  const rohanInfo = profileMap['rohan@example.com'];

  const booking1 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      jigoloId: kabirInfo.user.id,
      profileId: kabirInfo.profile.id,
      date: new Date('2026-06-28'),
      startTime: '19:00',
      endTime: '20:00',
      package: 'pkg_1_1',
      totalPrice: 2500,
      status: 'confirmed',
      specialRequests: 'Pick-up near Juhu Circle. Formal black tie dinner.',
      paymentStatus: 'paid'
    }
  });

  const booking2 = await prisma.booking.create({
    data: {
      customerId: customer1.id,
      jigoloId: rohanInfo.user.id,
      profileId: rohanInfo.profile.id,
      date: new Date('2026-06-30'),
      startTime: '10:00',
      endTime: '12:00',
      package: 'pkg_2_2',
      totalPrice: 3200,
      status: 'pending',
      specialRequests: 'Prefer local street cafes.',
      paymentStatus: 'paid'
    }
  });

  const booking3 = await prisma.booking.create({
    data: {
      customerId: customer2.id,
      jigoloId: kabirInfo.user.id,
      profileId: kabirInfo.profile.id,
      date: new Date('2026-06-15'),
      startTime: '20:00',
      endTime: '22:00',
      package: 'pkg_1_2',
      totalPrice: 4500,
      status: 'completed',
      specialRequests: 'Dinner companion.',
      paymentStatus: 'paid'
    }
  });

  console.log('📅 Created sample bookings.');

  // 5. Create Reviews
  await prisma.review.create({
    data: {
      bookingId: booking3.id,
      reviewerId: customer2.id,
      jigoloId: kabirInfo.user.id,
      rating: 5,
      comment: 'Kabir was incredibly polite and classy. He made a fantastic impression on my guests at the corporate gala dinner.'
    }
  });

  console.log('⭐ Created reviews.');

  // 6. Create Message Conversations
  await prisma.message.createMany({
    data: [
      { senderId: customer1.id, receiverId: kabirInfo.user.id, content: 'Hello Kabir! Are you free this weekend?', createdAt: new Date('2026-06-25T18:25:00Z') },
      { senderId: kabirInfo.user.id, receiverId: customer1.id, content: 'Hey Aarav! Yes, I am free on Sunday evening after 6 PM.', createdAt: new Date('2026-06-25T18:27:00Z') },
      { senderId: customer1.id, receiverId: kabirInfo.user.id, content: 'Perfect, let\'s schedule a 1-hour session. I will book through the app.', createdAt: new Date('2026-06-25T18:29:00Z') },
      { senderId: kabirInfo.user.id, receiverId: customer1.id, content: 'Looking forward to our session tomorrow at Bandra!', createdAt: new Date('2026-06-25T18:30:00Z') },
      
      { senderId: customer1.id, receiverId: rohanInfo.user.id, content: 'Hi Rohan, just sent a request for the Cafe Crawl package.', createdAt: new Date('2026-06-26T01:05:00Z') },
      { senderId: rohanInfo.user.id, receiverId: customer1.id, content: 'I have reviewed your booking request and will accept it.', createdAt: new Date('2026-06-26T01:10:00Z'), isRead: false }
    ]
  });

  console.log('💬 Created message history.');
  console.log('🌳 Seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
