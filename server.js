// server.js
// 🚀 Punto de entrada de la aplicación con arquitectura SOLID
// Maneja Auth (usuarios) y Events (eventos), usando MongoDB Atlas.

const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
require("dotenv").config();

// --- Repositorios ---
const MongoRepository = require("./src/repositories/mongoRepository");
const AuthRepository = require("./src/repositories/authRepository");

// --- Servicios y Controladores ---
const EventService = require("./src/services/eventService");
const EventController = require("./src/controllers/eventController");
const eventRoutesFactory = require("./src/routes/eventRoutes");

const AuthService = require("./src/services/authService");
const AuthController = require("./src/controllers/authController");
const authRoutesFactory = require("./src/routes/authRoutes");

// --- Configuración App ---
const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "public")));

// --- Eventos ---
const eventRepo = new MongoRepository(
  process.env.MONGO_URI,
  "Eventos", // 📌 Base de datos
  "Eventos"  // 📌 Colección
);
const eventService = new EventService(eventRepo);
const eventController = new EventController(eventService);
const eventRoutes = eventRoutesFactory(eventController);
app.use("/api/events", eventRoutes);

// --- Auth ---
const authRepo = new AuthRepository(
  process.env.MONGO_URI,
  "Eventos" // 📌 Usuarios se guardarán en la misma DB
); 
const authService = new AuthService(authRepo);
const authController = new AuthController(authService);
const authRoutes = authRoutesFactory(authController);
app.use("/api/auth", authRoutes);

// --- Server ---
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
  console.log(`🌍 Conectado a DB: Eventos (colección Eventos para eventos)`);
});
