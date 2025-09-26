// src/repositories/mongoRepository.js
const { MongoClient, ObjectId, ServerApiVersion } = require("mongodb");

class MongoRepository {
  constructor(uri, dbName, collectionName) {
    this.client = new MongoClient(uri, {
      serverApi: {
        version: ServerApiVersion.v1,
        strict: true,
        deprecationErrors: true,
      },
    });
    this.dbName = dbName;
    this.collectionName = collectionName;
  }

  async connect() {
    if (!this.client.topology || !this.client.topology.isConnected()) {
      await this.client.connect();
      console.log("✅ Conectado a MongoDB");
    }
    return this.client.db(this.dbName).collection(this.collectionName);
  }

  async findAll() {
    const collection = await this.connect();
    return await collection.find().toArray();
  }

  async findById(id) {
    const collection = await this.connect();
    return await collection.findOne({ _id: new ObjectId(id) });
  }

  async create(data) {
    const collection = await this.connect();
    const result = await collection.insertOne(data);
    return { _id: result.insertedId, ...data };
  }

  async update(id, data) {
    const collection = await this.connect();
    await collection.updateOne(
      { _id: new ObjectId(id) },
      { $set: data }
    );
    return this.findById(id);
  }

  async delete(id) {
    const collection = await this.connect();
    return await collection.deleteOne({ _id: new ObjectId(id) });
  }
}

module.exports = MongoRepository;
