// jsonRepository.js
// Implementación simple que usa un archivo JSON como almacén.
// Single Responsibility: esta clase solo se encarga de lectura/escritura.
const fs = require('fs').promises;
const BaseRepository = require('./baseRepository');
const { v4: uuidv4 } = require('uuid');

class JsonRepository extends BaseRepository {
  constructor(filePath) {
    super();
    this.filePath = filePath;
  }

  async _readFile() {
    try {
      const content = await fs.readFile(this.filePath, 'utf8');
      return JSON.parse(content);
    } catch (err) {
      // Si no existe, devolver estructura inicial
      return { events: [], organizers: [] };
    }
  }

  async _writeFile(data) {
    await fs.mkdir(require('path').dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2), 'utf8');
  }

  async getAll() {
    const data = await this._readFile();
    return data.events;
  }

  async getById(id) {
    const data = await this._readFile();
    return data.events.find(e => e.id === id);
  }

  async create(event) {
    const data = await this._readFile();
    const newEvent = Object.assign({}, event, { id: uuidv4(), comments: [] });
    data.events.push(newEvent);
    // registrar organizador si no existe
    if (event.organizer) {
      let org = data.organizers.find(o => o.name === event.organizer);
      if (!org) {
        org = { id: uuidv4(), name: event.organizer, ratings: [] };
        data.organizers.push(org);
      }
    }
    await this._writeFile(data);
    return newEvent;
  }

  async update(id, changed) {
    const data = await this._readFile();
    const idx = data.events.findIndex(e => e.id === id);
    if (idx === -1) return null;
    data.events[idx] = Object.assign({}, data.events[idx], changed);
    await this._writeFile(data);
    return data.events[idx];
  }

  // Métodos extra para comentarios y organizadores

  async addComment(eventId, comment) {
    const data = await this._readFile();
    const ev = data.events.find(e => e.id === eventId);
    if (!ev) return null;
    ev.comments = ev.comments || [];
    ev.comments.push(Object.assign({ id: uuidv4() }, comment));
    // actualizar organizador ratings
    if (ev.organizer && comment.rating) {
      let org = data.organizers.find(o => o.name === ev.organizer);
      if (!org) {
        org = { id: uuidv4(), name: ev.organizer, ratings: [] };
        data.organizers.push(org);
      }
      org.ratings.push(comment.rating);
    }
    await this._writeFile(data);
    return ev;
  }

  async getOrganizers() {
    const data = await this._readFile();
    return data.organizers;
  }
}

module.exports = JsonRepository;
