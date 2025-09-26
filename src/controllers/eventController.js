// src/controllers/eventController.js

class EventController {
  constructor(eventService) {
    this.eventService = eventService;
  }

  // Obtener todos los eventos (visibles para cualquiera)
  async getAllEvents() {
    return await this.eventService.getAllEvents();
  }

  // Crear evento (requiere estar autenticado)
  async createEvent(title, description, date, location, userId) {
    if (!title || !description || !date || !location) {
      throw new Error("Todos los campos son obligatorios.");
    }
    return await this.eventService.createEvent({
      title,
      description,
      date,
      location,
      createdBy: userId,
    });
  }

  // Actualizar evento (solo el creador puede hacerlo)
  async updateEvent(eventId, eventData, userId) {
    return await this.eventService.updateEvent(eventId, eventData, userId);
  }

  // Eliminar evento (solo el creador puede hacerlo)
  async deleteEvent(eventId, userId) {
    return await this.eventService.deleteEvent(eventId, userId);
  }
}

module.exports = EventController;
