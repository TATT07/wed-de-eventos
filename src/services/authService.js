const jwt = require("jsonwebtoken");
const User = require("../models/userModel");
const connectDB = require("../repositories/mongoRepository");

const SECRET = "mi_secreto_seguro";

class AuthService {
  async register(username, email, password) {
    const db = await connectDB();
    const users = db.collection("users");

    const exist = await users.findOne({ email });
    if (exist) throw new Error("El usuario ya existe");

    const hashed = await User.hashPassword(password);
    const newUser = new User(username, email, hashed);

    await users.insertOne(newUser);
    return { message: "Usuario registrado con éxito" };
  }

  async login(email, password) {
    const db = await connectDB();
    const users = db.collection("users");

    const user = await users.findOne({ email });
    if (!user) throw new Error("Usuario no encontrado");

    const valid = await User.comparePassword(password, user.password);
    if (!valid) throw new Error("Contraseña incorrecta");

    const token = jwt.sign({ id: user._id, email: user.email }, SECRET, {
      expiresIn: "2h",
    });

    return { token, user: { id: user._id, username: user.username, email: user.email } };
  }
}

module.exports = AuthService;
