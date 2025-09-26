// src/controllers/authController.js
class AuthController {
  constructor(authService) {
    this.authService = authService;
  }

  register = async (req, res) => {
    try {
      const { username, email, password } = req.body;
      const user = await this.authService.register(username, email, password);
      res.status(201).json(user);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };

  login = async (req, res) => {
    try {
      const { email, password } = req.body;
      const data = await this.authService.login(email, password);
      res.json(data);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  };
}

module.exports = AuthController;
