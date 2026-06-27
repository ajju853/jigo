// Mock Database for Jigo application

export const mockUsers = [
  {
    id: "user_customer_1",
    name: "Aarav Sharma",
    email: "aarav@example.com",
    role: "customer",
    phone: "+91 98765 43210",
    location: "Mumbai, Maharashtra",
    profilePhoto: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200",
    preferences: {
      gender: "Female",
      ageRange: "18-35",
      locationRadius: "15km"
    },
    joinedDate: "2025-01-10"
  },
  {
    id: "user_customer_2",
    name: "Priya Patel",
    email: "priya@example.com",
    role: "customer",
    phone: "+91 98123 45678",
    location: "Delhi, NCR",
    profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=200",
    preferences: {
      gender: "Male",
      ageRange: "26-45",
      locationRadius: "25km"
    },
    joinedDate: "2025-03-22"
  },
  {
    id: "user_jigolo_1", // Links to profile_1
    name: "Kabir Malhotra",
    email: "kabir@example.com",
    role: "jigolo",
    phone: "+91 99999 88888",
    location: "Bandra, Mumbai",
    profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
    joinedDate: "2024-11-05"
  }
];

export const mockProfiles = [
  {
    id: "profile_1",
    userId: "user_jigolo_1",
    name: "Kabir Malhotra",
    age: 26,
    gender: "Male",
    location: "Bandra, Mumbai",
    bio: "Sophisticated, well-read gentleman with a passion for fine dining, ballroom dancing, and deep philosophical conversations. Ideal companion for high-profile corporate galas, private dinners, or a relaxed weekend getaway.",
    price: 2500, // INR per hour
    rating: 4.9,
    reviewsCount: 38,
    verified: true,
    tags: ["🔥 Popular", "⭐ Top Rated"],
    languages: ["English", "Hindi", "Punjabi"],
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Fine Dining", "Social Escort", "Travel Companion", "Fitness Guide"],
    services: [
      { id: "pkg_1_1", name: "Social Companion Dinner (1 Hr)", duration: 1, price: 2500 },
      { id: "pkg_1_2", name: "Gala Event Accompany (2 Hrs)", duration: 2, price: 4500 },
      { id: "pkg_1_3", name: "Premium VIP Escort (4 Hrs)", duration: 4, price: 8000 },
      { id: "pkg_1_4", name: "Weekend Getaway Travel Package (Full Day)", duration: 24, price: 25000 }
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
  },
  {
    id: "profile_2",
    userId: "user_jigolo_2",
    name: "Rohan Mehra",
    age: 24,
    gender: "Male",
    location: "Indiranagar, Bengaluru",
    bio: "Energetic, fitness enthusiast, and professional conversationalist. Love exploring cafes, trekking, and listening to indie music. Always down for some fun, laughter, and high energy gatherings.",
    price: 1800,
    rating: 4.7,
    reviewsCount: 24,
    verified: true,
    tags: ["🆕 New", "🔥 Popular"],
    languages: ["English", "Hindi", "Kannada"],
    images: [
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Cafe Hopping", "Adventure Companion", "Concert Buddy", "Gym Partner"],
    services: [
      { id: "pkg_2_1", name: "Quick Hangout (1 Hr)", duration: 1, price: 1800 },
      { id: "pkg_2_2", name: "Cafe/Trek Explorer (2 Hrs)", duration: 2, price: 3200 },
      { id: "pkg_2_3", name: "Concert or Party Buddy (4 Hrs)", duration: 4, price: 6000 }
    ],
    availability: {
      Friday: ["17:00 - 23:00"],
      Saturday: ["08:00 - 23:00"],
      Sunday: ["08:00 - 22:00"]
    }
  },
  {
    id: "profile_3",
    userId: "user_jigolo_3",
    name: "Arjun Sen",
    age: 28,
    gender: "Male",
    location: "Salt Lake, Kolkata",
    bio: "Art history scholar, pianist, and wine lover. Looking to accompany discerning clients to art galleries, classical music concerts, or intellectual gatherings. Speaks four languages fluently.",
    price: 3000,
    rating: 5.0,
    reviewsCount: 16,
    verified: true,
    tags: ["⭐ Top Rated"],
    languages: ["English", "Bengali", "Hindi", "French"],
    images: [
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Art Exhibitions", "Intellectual Dialogues", "Classical Music", "Wine Tasting"],
    services: [
      { id: "pkg_3_1", name: "Art Walk & Dialogue (1 Hr)", duration: 1, price: 3000 },
      { id: "pkg_3_2", name: "Opera/Concert Companion (2 Hrs)", duration: 2, price: 5500 },
      { id: "pkg_3_3", name: "Exhibition & Private Dinner (4 Hrs)", duration: 4, price: 10000 }
    ],
    availability: {
      Wednesday: ["14:00 - 21:00"],
      Thursday: ["14:00 - 21:00"],
      Friday: ["14:00 - 22:00"],
      Saturday: ["12:00 - 22:00"]
    }
  },
  {
    id: "profile_4",
    userId: "user_jigolo_4",
    name: "Aisha Patel",
    age: 25,
    gender: "Female",
    location: "Juhu, Mumbai",
    bio: "Outgoing fashion stylist and model who enjoys upscale parties, travel, and high-fashion galas. Excellent listener with a vibrant personality, ready to accompany you to any social event.",
    price: 3200,
    rating: 4.8,
    reviewsCount: 30,
    verified: true,
    tags: ["🔥 Popular"],
    languages: ["English", "Hindi", "Gujarati"],
    images: [
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Fashion Galas", "Nightclubs", "Luxury Travel Escort", "Private Gatherings"],
    services: [
      { id: "pkg_4_1", name: "Fashion & Gala Companion (2 Hrs)", duration: 2, price: 6000 },
      { id: "pkg_4_2", name: "Premium Club Escort (4 Hrs)", duration: 4, price: 11000 },
      { id: "pkg_4_3", name: "Outstation Yacht Party (Full Day)", duration: 24, price: 35000 }
    ],
    availability: {
      Thursday: ["20:00 - 02:00"],
      Friday: ["18:00 - 03:00"],
      Saturday: ["18:00 - 03:00"],
      Sunday: ["12:00 - 20:00"]
    }
  },
  {
    id: "profile_5",
    userId: "user_jigolo_5",
    name: "Dev Dixit",
    age: 32,
    gender: "Male",
    location: "Vasant Vihar, Delhi",
    bio: "Mature, professional, and composed entrepreneur. Expert in golf, corporate etiquettes, and high-end networking. Perfect companion for corporate networking events, private business dinners, and golf afternoons.",
    price: 3500,
    rating: 4.9,
    reviewsCount: 22,
    verified: true,
    tags: ["⭐ Top Rated"],
    languages: ["English", "Hindi"],
    images: [
      "https://images.unsplash.com/photo-1489980508314-941910ded1f4?auto=format&fit=crop&q=80&w=600",
      "https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Business Networking", "Golf Companion", "Private Lounge Dinners", "Strategic Advisory Chat"],
    services: [
      { id: "pkg_5_1", name: "Golf Companion Session (2 Hrs)", duration: 2, price: 7000 },
      { id: "pkg_5_2", name: "Business Dinner & Escort (4 Hrs)", duration: 4, price: 13000 },
      { id: "pkg_5_3", name: "Full Day Golf & Business Socials", duration: 8, price: 24000 }
    ],
    availability: {
      Monday: ["09:00 - 17:00"],
      Tuesday: ["09:00 - 17:00"],
      Wednesday: ["09:00 - 17:00"],
      Thursday: ["09:00 - 17:00"],
      Friday: ["09:00 - 22:00"]
    }
  },
  {
    id: "profile_6",
    userId: "user_jigolo_6",
    name: "Rishi Verma",
    age: 27,
    gender: "Male",
    location: "Koramangala, Bengaluru",
    bio: "Former athlete and personal coach, currently full-time life explorer. Very outgoing, love electronic music festivals, beaches, and workouts. Let's do beach dates, workout sessions, or hitting local clubs.",
    price: 2000,
    rating: 4.6,
    reviewsCount: 15,
    verified: false,
    tags: ["🔥 Popular"],
    languages: ["English", "Hindi", "Telugu"],
    images: [
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Gym Partnering", "Pool Parties", "Clubbing Companion"],
    services: [
      { id: "pkg_6_1", name: "Fitness/Gym Workout (1.5 Hrs)", duration: 1.5, price: 2800 },
      { id: "pkg_6_2", name: "VIP Club Companion (3 Hrs)", duration: 3, price: 5500 }
    ],
    availability: {
      Monday: ["06:00 - 10:00", "18:00 - 22:00"],
      Wednesday: ["06:00 - 10:00", "18:00 - 22:00"],
      Friday: ["18:00 - 02:00"],
      Saturday: ["10:00 - 02:00"],
      Sunday: ["10:00 - 20:00"]
    }
  },
  {
    id: "profile_7",
    userId: "user_jigolo_7",
    name: "Neha Sen",
    age: 24,
    gender: "Female",
    location: "Park Street, Kolkata",
    bio: "Creative writer, literature lover, and coffee critic. I offer companion dates centered on deep discussions, museum walks, coffee tasting, and visiting libraries.",
    price: 2200,
    rating: 4.8,
    reviewsCount: 19,
    verified: true,
    tags: ["🆕 New"],
    languages: ["English", "Bengali"],
    images: [
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Coffee Dates", "Bookstore Walks", "Museum Tour Escort"],
    services: [
      { id: "pkg_7_1", name: "Coffee Date & Chat (1 Hr)", duration: 1, price: 2200 },
      { id: "pkg_7_2", name: "Bookstore & Museum Date (3 Hrs)", duration: 3, price: 5800 }
    ],
    availability: {
      Tuesday: ["11:00 - 18:00"],
      Thursday: ["11:00 - 18:00"],
      Saturday: ["11:00 - 20:00"],
      Sunday: ["11:00 - 17:00"]
    }
  },
  {
    id: "profile_8",
    userId: "user_jigolo_8",
    name: "Vikram Singhania",
    age: 29,
    gender: "Male",
    location: "Gachibowli, Hyderabad",
    bio: "Tech entrepreneur, chef, and standup comedy enthusiast. I combine culinary wisdom, clean humor, and intellect. Let's cook together or visit local comedy clubs.",
    price: 2600,
    rating: 4.9,
    reviewsCount: 14,
    verified: true,
    tags: ["⭐ Top Rated"],
    languages: ["English", "Telugu", "Hindi"],
    images: [
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Private Chef Date", "Comedy Night", "Tech Network Meetup"],
    services: [
      { id: "pkg_8_1", name: "Standup Comedy Companion (2 Hrs)", duration: 2, price: 4800 },
      { id: "pkg_8_2", name: "Culinary & Cooking Experience (4 Hrs)", duration: 4, price: 9500 }
    ],
    availability: {
      Saturday: ["12:00 - 23:59"],
      Sunday: ["12:00 - 22:00"]
    }
  },
  {
    id: "profile_9",
    userId: "user_jigolo_9",
    name: "Samira Ali",
    age: 26,
    gender: "Non-binary",
    location: "Kora, Bengaluru",
    bio: "Alternative fashion designer, DJ, and tarot reader. Welcoming all open-minded folks to join me for electronic music gigs, underground art exhibits, or intimate chats about astrology.",
    price: 2400,
    rating: 4.7,
    reviewsCount: 11,
    verified: false,
    tags: ["🆕 New"],
    languages: ["English", "Urdu", "Hindi"],
    images: [
      "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["DJ Gig Companion", "Tarot Session Escort", "Indie Art Exhibitions"],
    services: [
      { id: "pkg_9_1", name: "Gigs & DJ Companion (2 Hrs)", duration: 2, price: 4400 },
      { id: "pkg_9_2", name: "Tarot Reading + Art Tour (4 Hrs)", duration: 4, price: 8500 }
    ],
    availability: {
      Wednesday: ["16:00 - 22:00"],
      Friday: ["18:00 - 02:00"],
      Saturday: ["14:00 - 02:00"]
    }
  },
  {
    id: "profile_10",
    userId: "user_jigolo_10",
    name: "Ranveer Roy",
    age: 30,
    gender: "Male",
    location: "Aurobindo Marg, Delhi",
    bio: "Photographer, poet, and acoustic guitarist. Love nature walks, historical monuments, and vintage films. Looking to escort clients on monument photo trips or deep musical cafe sessions.",
    price: 2100,
    rating: 4.8,
    reviewsCount: 17,
    verified: true,
    tags: ["🔥 Popular"],
    languages: ["English", "Hindi", "Bengali"],
    images: [
      "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&q=80&w=600"
    ],
    specialties: ["Portrait Photo Walk", "Nature Retreat Escort", "Live Acoustic Evening"],
    services: [
      { id: "pkg_10_1", name: "Acoustic Evening Cafe Date (2 Hrs)", duration: 2, price: 4000 },
      { id: "pkg_10_2", name: "Monument Photo Walk (4 Hrs)", duration: 4, price: 7500 }
    ],
    availability: {
      Tuesday: ["08:00 - 13:00"],
      Thursday: ["08:00 - 13:00"],
      Saturday: ["07:00 - 18:00"],
      Sunday: ["07:00 - 18:00"]
    }
  }
];

export const mockReviews = {
  profile_1: [
    { id: "rev_1_1", reviewerName: "Ritu M.", rating: 5, date: "2025-06-15", text: "Kabir was incredibly polite and classy. He made a fantastic impression on my guests at the corporate gala dinner." },
    { id: "rev_1_2", reviewerName: "Sneha G.", rating: 5, date: "2025-06-02", text: "Truly a gentleman. Engaging conversation and excellent dining manners. Will definitely book again!" },
    { id: "rev_1_3", reviewerName: "Ananya K.", rating: 4.8, date: "2025-05-18", text: "Excellent companion, prompt and attentive. Very knowledgeable about local culture." }
  ],
  profile_2: [
    { id: "rev_2_1", reviewerName: "Kavya P.", rating: 5, date: "2025-06-20", text: "Rohan has such infectious high energy. The cafe crawl was extremely fun and full of laughter." },
    { id: "rev_2_2", reviewerName: "Aishwarya S.", rating: 4, date: "2025-05-30", text: "Good listener and very active. Fun company for our weekend hike." }
  ],
  profile_3: [
    { id: "rev_3_1", reviewerName: "Paramita D.", rating: 5, date: "2025-06-10", text: "Arjun was an exceptional partner for the museum walk. His knowledge of contemporary art was highly impressive." }
  ]
};

export const mockBookings = [
  {
    id: "booking_1",
    profileId: "profile_1",
    customerId: "user_customer_1",
    date: "2026-06-28",
    time: "19:00",
    packageId: "pkg_1_1",
    duration: 1,
    status: "confirmed",
    totalPrice: 2500,
    specialRequests: "Pick-up near Juhu Circle. Formal black tie dinner.",
    createdAt: "2026-06-25"
  },
  {
    id: "booking_2",
    profileId: "profile_2",
    customerId: "user_customer_1",
    date: "2026-06-30",
    time: "10:00",
    packageId: "pkg_2_2",
    duration: 2,
    status: "pending",
    totalPrice: 3200,
    specialRequests: "Prefer local street cafes.",
    createdAt: "2026-06-26"
  },
  {
    id: "booking_3",
    profileId: "profile_1",
    customerId: "user_customer_2",
    date: "2026-06-15",
    time: "20:00",
    packageId: "pkg_1_2",
    duration: 2,
    status: "completed",
    totalPrice: 4500,
    specialRequests: "Dinner companion.",
    createdAt: "2026-06-13"
  }
];

export const mockConversations = [
  {
    conversationId: "conv_1",
    userIds: ["user_customer_1", "user_jigolo_1"],
    participants: {
      user_customer_1: { name: "Aarav Sharma", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200", online: true },
      user_jigolo_1: { name: "Kabir Malhotra", photo: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=200", online: true }
    },
    lastMessage: "Looking forward to our session tomorrow at Bandra!",
    lastUpdated: "2026-06-25T18:30:00Z",
    unreadCount: 0,
    messages: [
      { id: "msg_1", senderId: "user_customer_1", text: "Hello Kabir! Are you free this weekend?", timestamp: "2026-06-25T18:25:00Z" },
      { id: "msg_2", senderId: "user_jigolo_1", text: "Hey Aarav! Yes, I am free on Sunday evening after 6 PM.", timestamp: "2026-06-25T18:27:00Z" },
      { id: "msg_3", senderId: "user_customer_1", text: "Perfect, let's schedule a 1-hour session. I will book through the app.", timestamp: "2026-06-25T18:29:00Z" },
      { id: "msg_4", senderId: "user_jigolo_1", text: "Looking forward to our session tomorrow at Bandra!", timestamp: "2026-06-25T18:30:00Z" }
    ]
  },
  {
    conversationId: "conv_2",
    userIds: ["user_customer_1", "user_jigolo_2"],
    participants: {
      user_customer_1: { name: "Aarav Sharma", photo: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&q=80&w=200", online: true },
      user_jigolo_2: { name: "Rohan Mehra", photo: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=200", online: false }
    },
    lastMessage: "I have reviewed your booking request and will accept it.",
    lastUpdated: "2026-06-26T01:10:00Z",
    unreadCount: 1,
    messages: [
      { id: "msg_5", senderId: "user_customer_1", text: "Hi Rohan, just sent a request for the Cafe Crawl package.", timestamp: "2026-06-26T01:05:00Z" },
      { id: "msg_6", senderId: "user_jigolo_2", text: "I have reviewed your booking request and will accept it.", timestamp: "2026-06-26T01:10:00Z" }
    ]
  }
];
