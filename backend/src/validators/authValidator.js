const { z } = require('zod');

const registerSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters'),
    name: z.string({ required_error: 'Name is required' }).min(2, 'Name must be at least 2 characters'),
    role: z.enum(['customer', 'jigolo'], { required_error: 'Role is required and must be customer or jigolo' }),
    phone: z.string().optional(),
    location: z.string().optional(),
    profilePhoto: z.string().url('Invalid profile photo URL').optional().or(z.literal(''))
  })
});

const loginSchema = z.object({
  body: z.object({
    email: z.string({ required_error: 'Email is required' }).email('Invalid email address'),
    password: z.string({ required_error: 'Password is required' }).min(6, 'Password must be at least 6 characters')
  })
});

module.exports = {
  registerSchema,
  loginSchema
};
