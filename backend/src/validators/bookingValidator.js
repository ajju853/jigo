const { z } = require('zod');

const createBookingSchema = z.object({
  body: z.object({
    profileId: z.string({ required_error: 'profileId is required' }).uuid('Invalid profile UUID'),
    date: z.string({ required_error: 'Date is required' }), // e.g., '2026-06-28'
    time: z.string({ required_error: 'Time is required' }), // e.g., '19:00'
    packageId: z.string({ required_error: 'packageId is required' }),
    duration: z.number({ required_error: 'Duration is required' }).positive(),
    totalPrice: z.number({ required_error: 'totalPrice is required' }).positive(),
    specialRequests: z.string().optional()
  })
});

const updateBookingStatusSchema = z.object({
  body: z.object({
    status: z.enum(['pending', 'confirmed', 'completed', 'cancelled'], {
      required_error: 'Status is required and must be pending, confirmed, completed, or cancelled'
    }),
    cancellationReason: z.string().optional()
  })
});

module.exports = {
  createBookingSchema,
  updateBookingStatusSchema
};
