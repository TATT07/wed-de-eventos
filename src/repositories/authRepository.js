// src/repositories/authRepository.js
const { MongoClient } = require("mongodb");

class AuthRepository {
  constructor(uri, dbName) {
    this.client = new MongoClient(uri);
    this.dbName = dbName;
  }

  async connect() {
    if (!this.client.topology || !this.client.topology.isConnected()) {
      await this.client.connect();
    }
    return this.client.db(this.dbName).collection("users"); // 📌 Guardar en Eventos.users
  }

  async createUser(user) {
    const collection = await this.connect();
    return await collection.insertOne(user);
  }

  async findUserByEmail(email) {
    const collection = await this.connect();
    return await collection.findOne({ email });
  }
}

module.exports = AuthRepository;
