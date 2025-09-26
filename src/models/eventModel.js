// eventModel.js
// Modelo ligero para eventos.
class Event {
  constructor({ id, title, description, date, location, category, price, organizer, comments }) {
    this.id = id;
    this.title = title;
    this.description = description;
    this.date = date;
    this.location = location;
    this.category = category;
    this.price = price;
    this.organizer = organizer;
    this.comments = comments || [];
  }
}

module.exports = Event;
