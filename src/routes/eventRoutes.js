// src/routes/eventRoutes.js

const express = require("express");
const authMiddleware = require("../utils/authMiddleware");

function eventRoutesFactory(controller) {
  const router = express.Router();

  // Obtener todos los eventos (público)
  router.get("/", async (req, res) => {
    try {
      const events = await controller.getAllEvents();
      res.json(events);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // Crear un evento (requiere login)
  router.post("/", authMiddleware, async (req, res) => {
    try {
      const { title, description, date, location } = req.body;
      const event = await controller.createEvent(
        title,
        description,
        date,
        location,
        req.user.id
      );
      res.json(event);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Actualizar evento (solo creador puede modificar)
  router.put("/:id", authMiddleware, async (req, res) => {
    try {
      const updatedEvent = await controller.updateEvent(
        req.params.id,
        req.body,
        req.user.id
      );
      res.json(updatedEvent);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  // Eliminar evento (solo creador puede borrar)
  router.delete("/:id", authMiddleware, async (req, res) => {
    try {
      const deleted = await controller.deleteEvent(req.params.id, req.user.id);
      res.json(deleted);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  });

  return router;
}

module.exports = eventRoutesFactory;
