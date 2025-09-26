// src/routes/authRoutes.js
const express = require("express");

function authRoutesFactory(controller) {
  const router = express.Router();

  router.post("/register", controller.register);
  router.post("/login", controller.login);

  return router;
}

module.exports = authRoutesFactory;
