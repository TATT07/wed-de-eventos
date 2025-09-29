// Funciones de API comunes
class ApiService {
    static async request(endpoint, options = {}) {
        try {
            const response = await fetch(endpoint, {
                headers: {
                    'Content-Type': 'application/json',
                    ...options.headers
                },
                ...options
            });
            
            return await response.json();
        } catch (error) {
            console.error('API Request error:', error);
            throw new Error('Error de conexión con el servidor');
        }
    }

    // Event endpoints
    static async getEvents(params = {}) {
        const queryString = new URLSearchParams(params).toString();
        return this.request(`/api/events?${queryString}`);
    }

    static async getUserEvents() {
        return this.request('/api/my-events');
    }

    static async createEvent(formData) {
        return this.request('/api/events', {
            method: 'POST',
            body: formData
        });
    }

    static async updateEvent(eventId, eventData) {
        return this.request(`/api/events/${eventId}`, {
            method: 'PUT',
            body: JSON.stringify(eventData)
        });
    }

    static async deleteEvent(eventId) {
        return this.request(`/api/events/${eventId}`, {
            method: 'DELETE'
        });
    }

    static async getEventDetails(eventId) {
        return this.request(`/api/events/${eventId}/details`);
    }

    // Review endpoints
    static async addReview(eventId, reviewData) {
        return this.request(`/api/events/${eventId}/reviews`, {
            method: 'POST',
            body: JSON.stringify(reviewData)
        });
    }
}