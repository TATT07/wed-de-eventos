class Event {
  constructor(title, description, date, location, userId) {
    this.title = title;
    this.description = description;
    this.date = date;
    this.location = location;
    this.userId = userId; // 🔑 creador del evento
  }
}

module.exports = Event;
