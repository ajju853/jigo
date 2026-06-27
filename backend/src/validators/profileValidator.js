const { z } = require('zod');

const updateProfileSchema = z.object({
  body: z.object({
    bio: z.string().optional(),
    age: z.number().int().min(18, 'Must be at least 18 years old').max(99).optional(),
    gender: z.string().optional(),
    tags: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    pricePerHour: z.number().positive('Price must be a positive number').optional(),
    availability: z.record(z.array(z.string())).optional(), // Maps Day -> Array of time strings
    services: z.array(
      z.object({
        id: z.string(),
        name: z.string(),
        duration: z.number(),
        price: z.number()
      })
    ).optional(),
    images: z.array(z.string().url('Invalid image URL')).optional()
  })
});

const updateUserSchema = z.object({
  body: z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').optional(),
    phone: z.string().optional(),
    location: z.string().optional(),
    profilePhoto: z.string().url('Invalid photo URL').optional().or(z.literal(''))
  })
});

module.exports = {
  updateProfileSchema,
  updateUserSchema
};
