// Módulo de gestión de eventos
class EventsManager {
    constructor() {
        this.currentPage = 1;
        this.eventsPerPage = 10;
        this.currentEvents = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadEvents();
    }

    setupEventListeners() {
        // Filtros
        const categoryFilter = document.getElementById('categoryFilter');
        const searchFilter = document.getElementById('searchFilter');
        
        if (categoryFilter) {
            categoryFilter.addEventListener('change', () => this.loadEvents());
        }
        
        if (searchFilter) {
            searchFilter.addEventListener('input', 
                Utils.debounce(() => this.loadEvents(), 300)
            );
        }

        // Paginación
        document.getElementById('prevPage')?.addEventListener('click', () => this.previousPage());
        document.getElementById('nextPage')?.addEventListener('click', () => this.nextPage());
    }

    async loadEvents(page = 1) {
        this.currentPage = page;
        
        const category = document.getElementById('categoryFilter').value;
        const search = document.getElementById('searchFilter').value;
        
        try {
            this.showLoading();
            
            const data = await ApiService.getEvents({
                page: this.currentPage,
                limit: this.eventsPerPage,
                category,
                search
            });

            if (data.success && data.events?.length > 0) {
                this.displayEvents(data.events);
                this.setupPagination(data.page, data.events.length, data.hasMore);
            } else {
                this.showNoEvents(data.message);
            }
        } catch (error) {
            this.showError(error.message);
        }
    }

    displayEvents(events) {
        const eventsHTML = events.map(event => this.createEventCard(event)).join('');
        document.getElementById('eventsContainer').innerHTML = eventsHTML;
    }

    createEventCard(event) {
        const { date: formattedDate, time: formattedTime } = Utils.formatEventDate(event.date, event.time);
        const averageRating = event.averageRating || 0;
        const reviewCount = event.reviewCount || 0;

        return `
            <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 mb-6 border border-gray-100">
                <div class="md:flex">
                    ${this.getEventImage(event)}
                    <div class="p-6 ${event.imageUrl ? 'md:w-2/3' : 'w-full'}">
                        ${this.getEventHeader(event)}
                        <p class="text-gray-600 mb-4">${event.description}</p>
                        ${averageRating > 0 ? this.getRatingSection(averageRating, reviewCount) : ''}
                        ${this.getEventDetails(event, formattedDate, formattedTime)}
                        ${this.getEventFooter(event)}
                    </div>
                </div>
            </div>
        `;
    }

    getEventImage(event) {
        if (event.imageUrl) {
            return `
                <div class="md:w-1/3">
                    <img src="${event.imageUrl}" alt="${event.title}" class="w-full h-48 md:h-full object-cover">
                </div>
            `;
        }
        
        return `
            <div class="md:w-1/3 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <i class="fa-solid fa-calendar-day text-4xl text-gray-400"></i>
            </div>
        `;
    }

    getEventHeader(event) {
        return `
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-xl font-bold text-gray-900">${event.title}</h3>
                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">${event.category}</span>
            </div>
        `;
    }

    getRatingSection(averageRating, reviewCount) {
        return `
            <div class="flex items-center mb-4">
                <div class="flex text-amber-500">
                    ${Utils.generateStarRating(averageRating)}
                </div>
                <span class="ml-2 text-sm text-gray-600">${averageRating} (${reviewCount} reseña${reviewCount !== 1 ? 's' : ''})</span>
            </div>
        `;
    }

    getEventDetails(event, formattedDate, formattedTime) {
        return `
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-600 mb-4">
                <div class="flex items-center">
                    <i class="fa-solid fa-location-dot mr-2 text-blue-600"></i>
                    <span class="truncate">${event.location}</span>
                </div>
                <div class="flex items-center">
                    <i class="fa-solid fa-calendar mr-2 text-blue-600"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="flex items-center">
                    <i class="fa-solid fa-clock mr-2 text-blue-600"></i>
                    <span>${formattedTime}</span>
                </div>
                <div class="flex items-center">
                    <i class="fa-solid fa-tag mr-2 text-blue-600"></i>
                    <span class="font-medium">${event.price}</span>
                </div>
            </div>
        `;
    }

    getEventFooter(event) {
        return `
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                <span class="text-sm text-gray-500">Organizado por: ${event.organizer}</span>
                <button onclick="eventsManager.showEventDetails('${event.id}')" 
                        class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition duration-300 text-sm font-semibold">
                    <i class="fa-solid fa-eye mr-1"></i>Ver Detalles
                </button>
            </div>
        `;
    }

    setupPagination(page, eventsCount, hasMore = false) {
        document.getElementById('pageInfo').textContent = `Página ${page}`;
        
        const prevBtn = document.getElementById('prevPage');
        const nextBtn = document.getElementById('nextPage');
        
        prevBtn.disabled = page <= 1;
        nextBtn.disabled = !hasMore;
        
        document.getElementById('pagination').classList.remove('hidden');
    }

    previousPage() {
        if (this.currentPage > 1) {
            this.loadEvents(this.currentPage - 1);
        }
    }

    nextPage() {
        this.loadEvents(this.currentPage + 1);
    }

    showLoading() {
        document.getElementById('eventsContainer').innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
                <p class="text-gray-600">Cargando eventos...</p>
            </div>
        `;
    }

    showNoEvents(message = 'No se encontraron eventos') {
        document.getElementById('eventsContainer').innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
                <p class="text-gray-600">${message}</p>
            </div>
        `;
        document.getElementById('pagination').classList.add('hidden');
    }

    showError(message) {
        document.getElementById('eventsContainer').innerHTML = `
            <div class="text-center py-12 text-red-600">
                <i class="fa-solid fa-exclamation-triangle text-3xl mb-4"></i>
                <h3 class="text-lg font-semibold mb-2">Error al cargar eventos</h3>
                <p>${message}</p>
            </div>
        `;
    }

    async showEventDetails(eventId) {
        try {
            const data = await ApiService.getEventDetails(eventId);
            
            if (data.success) {
                const eventDetails = new EventDetails(data.event, data.reviews);
                eventDetails.display();
            } else {
                Utils.showAlert('error', 'Error', 'No se pudieron cargar los detalles del evento');
            }
        } catch (error) {
            Utils.showAlert('error', 'Error', error.message);
        }
    }
}

// Clase para manejar detalles de eventos
class EventDetails {
    constructor(event, reviews) {
        this.event = event;
        this.reviews = reviews;
    }

    display() {
        const { date: formattedDate, time: formattedTime } = Utils.formatEventDate(this.event.date, this.event.time);
        const averageRating = this.event.averageRating || 0;
        const reviewCount = this.event.reviewCount || 0;

        document.getElementById('modalEventTitle').textContent = this.event.title;
        document.getElementById('modalEventContent').innerHTML = this.generateContent(formattedDate, formattedTime, averageRating, reviewCount);
        ModalManager.showModal('eventDetailsModal');
    }

    generateContent(formattedDate, formattedTime, averageRating, reviewCount) {
        return `
            <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div class="lg:col-span-2">
                    ${this.getEventImage()}
                    ${this.getDescription()}
                    ${this.getReviewsSection(reviewCount)}
                </div>
                <div class="lg:col-span-1">
                    ${this.getEventInfo(formattedDate, formattedTime)}
                    ${averageRating > 0 ? this.getRatingBox(averageRating, reviewCount) : ''}
                    ${this.getReviewForm()}
                </div>
            </div>
        `;
    }

    getEventImage() {
        if (this.event.imageUrl) {
            return `<img src="${this.event.imageUrl}" alt="${this.event.title}" class="w-full h-64 object-cover rounded-lg mb-4">`;
        }
        
        return `
            <div class="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                <i class="fa-solid fa-calendar-day text-6xl text-gray-400"></i>
            </div>
        `;
    }

    getDescription() {
        return `
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p class="text-gray-700">${this.event.description}</p>
            </div>
        `;
    }

    getReviewsSection(reviewCount) {
        return `
            <div class="mt-6">
                <h3 class="font-semibold text-gray-900 mb-4">Reseñas (${reviewCount})</h3>
                ${this.reviews.length > 0 ? 
                    this.reviews.map(review => this.getReviewItem(review)).join('') : 
                    '<p class="text-gray-500 text-center py-4">Aún no hay reseñas para este evento.</p>'
                }
            </div>
        `;
    }

    getReviewItem(review) {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-gray-900">${review.userEmail}</span>
                    <div class="flex text-amber-500 text-sm">
                        ${Utils.generateStarRating(review.rating)}
                    </div>
                </div>
                <p class="text-gray-600 text-sm">${review.comment}</p>
                <span class="text-xs text-gray-400 mt-2 block">
                    ${new Date(review.createdAt).toLocaleDateString('es-ES')}
                </span>
            </div>
        `;
    }

    getEventInfo(formattedDate, formattedTime) {
        return `
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 class="font-semibold text-gray-900 mb-3">Información del Evento</h3>
                <div class="space-y-3">
                    <div class="flex items-center">
                        <i class="fa-solid fa-location-dot mr-3 text-blue-600"></i>
                        <span class="text-gray-700">${this.event.location}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fa-solid fa-calendar mr-3 text-blue-600"></i>
                        <span class="text-gray-700">${formattedDate}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fa-solid fa-clock mr-3 text-blue-600"></i>
                        <span class="text-gray-700">${formattedTime}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fa-solid fa-tag mr-3 text-blue-600"></i>
                        <span class="text-gray-700 font-medium">${this.event.price}</span>
                    </div>
                    <div class="flex items-center">
                        <i class="fa-solid fa-users mr-3 text-blue-600"></i>
                        <span class="text-gray-700">Máximo ${this.event.maxAttendees} personas</span>
                    </div>
                </div>
            </div>
        `;
    }

    getRatingBox(averageRating, reviewCount) {
        return `
            <div class="bg-amber-50 p-4 rounded-lg mb-4">
                <h3 class="font-semibold text-gray-900 mb-2">Calificación</h3>
                <div class="flex items-center justify-center mb-2">
                    <div class="flex text-amber-500 text-2xl">
                        ${Utils.generateStarRating(averageRating)}
                    </div>
                </div>
                <p class="text-center text-gray-700">${averageRating} de 5 estrellas</p>
                <p class="text-center text-sm text-gray-500">Basado en ${reviewCount} reseña${reviewCount !== 1 ? 's' : ''}</p>
            </div>
        `;
    }

    getReviewForm() {
        return `
            <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Agregar Reseña</h3>
                <form onsubmit="reviewsManager.addReview(event, '${this.event.id}')">
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                        <div class="flex space-x-1" id="starRating">
                            ${[1,2,3,4,5].map(i => `
                                <i class="fa-regular fa-star text-2xl text-amber-500 cursor-pointer hover:text-amber-400" 
                                    data-rating="${i}" 
                                    onmouseover="reviewsManager.highlightStars(${i})" 
                                    onmouseout="reviewsManager.resetStars()" 
                                    onclick="reviewsManager.setRating(${i})"></i>
                            `).join('')}
                        </div>
                        <input type="hidden" id="selectedRating" value="0">
                    </div>
                    <div class="mb-3">
                        <label class="block text-sm font-medium text-gray-700 mb-2">Comentario</label>
                        <textarea id="reviewComment" rows="3" class="w-full border border-gray-300 rounded-md px-3 py-2 text-sm" placeholder="Comparte tu experiencia..."></textarea>
                    </div>
                    <button type="submit" class="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 transition duration-300">
                        <i class="fa-solid fa-pen mr-1"></i>Enviar Reseña
                    </button>
                </form>
            </div>
        `;
    }
}

// Instancia global
const eventsManager = new EventsManager();