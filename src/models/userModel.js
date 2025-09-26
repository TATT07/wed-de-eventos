const bcrypt = require("bcrypt");

class User {
  constructor(username, email, password) {
    this.username = username;
    this.email = email;
    this.password = password; // hash antes de guardar
  }

  static async hashPassword(password) {
    return await bcrypt.hash(password, 10);
  }

  static async comparePassword(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = User;
