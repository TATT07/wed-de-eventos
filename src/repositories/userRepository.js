// src/repositories/userRepository.js
const { v4: uuidv4 } = require("uuid");
const db = require("../data/db.json");
const fs = require("fs");
const path = require("path");

const dbPath = path.join(__dirname, "../data/db.json");

const saveDb = () => {
  fs.writeFileSync(dbPath, JSON.stringify(db, null, 2));
};

const create = async ({ username, email, passwordHash }) => {
  const newUser = { id: uuidv4(), username, email, passwordHash };
  db.users.push(newUser);
  saveDb();
  return newUser;
};

const findByEmail = async (email) => {
  return db.users.find((u) => u.email === email);
};

module.exports = { create, findByEmail };
