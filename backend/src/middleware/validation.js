/**
 * Schema validator middleware using Zod
 * @param {import('zod').AnyZodObject} schema 
 */
const validate = (schema) => (req, res, next) => {
  try {
    const parsed = schema.parse({
      body: req.body,
      query: req.query,
      params: req.params
    });
    
    // Replace requests with parsed/coerced data
    if (parsed.body) req.body = parsed.body;
    if (parsed.query) req.query = parsed.query;
    if (parsed.params) req.params = parsed.params;
    
    next();
  } catch (err) {
    if (err.errors) {
      return res.status(400).json({
        error: 'Validation Error',
        details: err.errors.map(e => ({
          field: e.path.filter(p => p !== 'body' && p !== 'query' && p !== 'params').join('.'),
          message: e.message
        }))
      });
    }
    next(err);
  }
};

module.exports = validate;
