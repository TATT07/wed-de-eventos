// baseRepository.js
// Define una "interfaz" / clase base con los métodos principales.
// Aplica O (Open/Closed) y L (Liskov) porque otras implementaciones deben extenderla
// sin cambiar la firma de los métodos.
class BaseRepository {
  async getAll() { throw new Error('Not implemented'); }
  async getById(id) { throw new Error('Not implemented'); }
  async create(entity) { throw new Error('Not implemented'); }
  async update(id, changed) { throw new Error('Not implemented'); }
}

module.exports = BaseRepository;
