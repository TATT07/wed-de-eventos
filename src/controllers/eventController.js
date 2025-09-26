// eventController.js
// Controller: solo se encarga de recibir la solicitud y delegar al Service.
// Cada método tiene una única responsabilidad (S - Single Responsibility).
class EventController {
  constructor(service) {
    this.service = service;
    // bind para conservar 'this' en los handlers
    this.list = this.list.bind(this);
    this.get = this.get.bind(this);
    this.create = this.create.bind(this);
    this.addComment = this.addComment.bind(this);
    this.organizers = this.organizers.bind(this);
  }

  async list(req, res) {
    try {
      const data = await this.service.listEvents();
      res.json(data);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async get(req, res) {
    try {
      const id = req.params.id;
      const ev = await this.service.getEvent(id);
      if (!ev) return res.status(404).json({ error: 'Event not found' });
      res.json(ev);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }

  async create(req, res) {
    try {
      const payload = req.body;
      const created = await this.service.createEvent(payload);
      res.status(201).json(created);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async addComment(req, res) {
    try {
      const id = req.params.id;
      const payload = req.body;
      const updated = await this.service.addComment(id, payload);
      if (!updated) return res.status(404).json({ error: 'Event not found' });
      res.json(updated);
    } catch (err) {
      res.status(400).json({ error: err.message });
    }
  }

  async organizers(req, res) {
    try {
      const ranking = await this.service.getOrganizersRanking();
      res.json(ranking);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  }
}

module.exports = EventController;
