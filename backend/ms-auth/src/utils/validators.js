const { z } = require("zod");

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

module.exports = {
  registerSchema,
  loginSchema
};