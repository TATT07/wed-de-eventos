// server.js - Punto de entrada
// Arquitectura pensada para seguir SOLID en JS: responsabilidades separadas en carpetas.
const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');

// Importar capas
const JsonRepository = require('./src/repositories/jsonRepository');
const EventService = require('./src/services/eventService');
const EventController = require('./src/controllers/eventController');
const eventRoutesFactory = require('./src/routes/eventRoutes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// Inyección de dependencias (Dependency Inversion Principle)
const repo = new JsonRepository(path.join(__dirname, 'src', 'data', 'db.json'));
const service = new EventService(repo);
const controller = new EventController(service);
const eventRoutes = eventRoutesFactory(controller);

app.use('/api/events', eventRoutes);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
