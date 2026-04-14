const service = require("../services/auth.service");
const { registerSchema, loginSchema } = require("../utils/validators");

const healthCheck = (req, res) => {
  res.json({ status: "ok" });
};

const register = async (req, res) => {
  try {
    const data = registerSchema.parse(req.body);
    const user = await service.register(data);
    res.status(201).json(user);
  } catch (e) {
    res.status(e.status || 400).json({ error: e.message });
  }
};

const login = async (req, res) => {
  try {
    const data = loginSchema.parse(req.body);
    const result = await service.login(data);
    res.status(200).json(result);
  } catch (e) {
    res.status(e.status || 401).json({ error: e.message });
  }
};

module.exports = {
  register,
  login,
  healthCheck
};