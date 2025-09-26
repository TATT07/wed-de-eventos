// eventService.js
// Esta capa contiene la lógica de negocio. Se comunica con un repo (inyección).
// Aplica Single Responsibility (solo lógica de eventos) y Dependency Inversion
// (depende de una abstracción del repositorio).
class EventService {
  constructor(repository) {
    this.repo = repository;
  }

  async listEvents() {
    return await this.repo.getAll();
  }

  async getEvent(id) {
    return await this.repo.getById(id);
  }

  async createEvent(data) {
    // Validaciones simples
    if (!data.title || !data.date || !data.location) {
      throw new Error('Missing required fields: title, date, location');
    }
    return await this.repo.create({
      title: data.title,
      description: data.description || '',
      date: data.date,
      location: data.location,
      category: data.category || 'General',
      price: data.price || 0,
      organizer: data.organizer || 'Anon'
    });
  }

  async addComment(eventId, comment) {
    if (!comment || (!comment.text && !comment.rating)) {
      throw new Error('Comment text or rating required');
    }
    const saved = await this.repo.addComment(eventId, {
      text: comment.text || '',
      rating: comment.rating || null,
      author: comment.author || 'Anon'
    });
    return saved;
  }

  async getOrganizersRanking() {
    const orgs = await this.repo.getOrganizers();
    // calcular promedio
    const ranking = orgs.map(o => {
      const sum = (o.ratings || []).reduce((a,b)=>a+b, 0);
      const avg = (o.ratings && o.ratings.length) ? sum / o.ratings.length : 0;
      return { id: o.id, name: o.name, averageRating: avg, ratingCount: (o.ratings||[]).length };
    });
    // ordenar desc
    ranking.sort((a,b) => b.averageRating - a.averageRating);
    return ranking;
  }
}

module.exports = EventService;
