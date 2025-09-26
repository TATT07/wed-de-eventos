// src/services/eventService.js
const { ObjectId } = require("mongodb");

class EventService {
  constructor(eventRepository) {
    this.eventRepository = eventRepository; // Inyección de dependencias
  }

  // Obtener todos los eventos (acceso público)
  async getAllEvents() {
    return await this.eventRepository.findAll();
  }

  // Crear evento (solo usuarios autenticados)
  async createEvent(eventData) {
    if (!eventData.title || !eventData.description || !eventData.date || !eventData.location) {
      throw new Error("Todos los campos son obligatorios.");
    }

    const newEvent = {
      title: eventData.title,
      description: eventData.description,
      date: eventData.date,
      location: eventData.location,
      createdBy: eventData.createdBy, // id del usuario que lo creó
      createdAt: new Date(),
    };

    return await this.eventRepository.create(newEvent);
  }

  // Actualizar evento (solo el creador)
  async updateEvent(eventId, eventData, userId) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Evento no encontrado.");

    if (event.createdBy.toString() !== userId.toString()) {
      throw new Error("No tienes permiso para editar este evento.");
    }

    const updatedEvent = {
      ...event,
      ...eventData,
      updatedAt: new Date(),
    };

    return await this.eventRepository.update(eventId, updatedEvent);
  }

  // Eliminar evento (solo el creador)
  async deleteEvent(eventId, userId) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) throw new Error("Evento no encontrado.");

    if (event.createdBy.toString() !== userId.toString()) {
      throw new Error("No tienes permiso para eliminar este evento.");
    }

    return await this.eventRepository.delete(eventId);
  }
}

module.exports = EventService;
