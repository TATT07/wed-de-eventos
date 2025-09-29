// Módulo del Dashboard
class DashboardManager {
    constructor() {
        this.currentEvents = [];
        this.init();
    }

    init() {
        this.setupEventListeners();
        this.loadUserEvents();
    }

    setupEventListeners() {
        // Menú móvil
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (menuBtn) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) {
            logoutBtn.addEventListener('click', this.handleLogout.bind(this));
        }

        // Formularios
        const createEventForm = document.getElementById('createEventForm');
        if (createEventForm) {
            createEventForm.addEventListener('submit', (e) => this.handleCreateEvent(e));
        }

        const editEventForm = document.getElementById('editEventForm');
        if (editEventForm) {
            editEventForm.addEventListener('submit', (e) => this.handleUpdateEvent(e));
        }

        // File input
        this.setupFileInput();
    }

    async handleLogout() {
        const result = await Utils.confirmDialog(
            '¿Cerrar sesión?', 
            '¿Estás seguro de que quieres salir?', 
            'Sí, cerrar sesión'
        );
        
        if (result.isConfirmed) {
            window.location.href = '/logout';
        }
    }

    async handleCreateEvent(e) {
        e.preventDefault();
        await this.createEvent();
    }

    async handleUpdateEvent(e) {
        e.preventDefault();
        await this.updateEvent();
    }

    setupFileInput() {
        const imageInput = document.getElementById('imageInput');
        const fileNameDisplay = document.getElementById('fileName');
        
        if (imageInput && fileNameDisplay) {
            imageInput.addEventListener('change', (e) => this.handleFileSelect(e, fileNameDisplay));
        }
    }

    handleFileSelect(event, fileNameDisplay) {
        const file = event.target.files[0];
        
        if (!file) {
            fileNameDisplay.classList.add('hidden');
            return;
        }

        // Validar tipo de archivo
        if (!file.type.startsWith('image/')) {
            Utils.showAlert('error', 'Tipo de archivo no válido', 'Por favor selecciona una imagen (JPG, PNG, GIF)');
            event.target.value = '';
            fileNameDisplay.classList.add('hidden');
            return;
        }

        // Validar tamaño (5MB máximo)
        if (file.size > 5 * 1024 * 1024) {
            Utils.showAlert('error', 'Archivo muy grande', 'La imagen debe ser menor a 5MB');
            event.target.value = '';
            fileNameDisplay.classList.add('hidden');
            return;
        }

        fileNameDisplay.textContent = `Archivo seleccionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
        fileNameDisplay.classList.remove('hidden');
    }

    showSection(sectionId) {
        // Ocultar todas las secciones
        document.querySelectorAll('.section').forEach(section => {
            section.classList.add('hidden');
            section.classList.remove('active');
        });
        
        // Mostrar la sección seleccionada
        const targetSection = document.getElementById(sectionId);
        if (targetSection) {
            targetSection.classList.remove('hidden');
            targetSection.classList.add('active');
        }
        
        // Cargar eventos si es la sección de mis eventos
        if (sectionId === 'mis-eventos') {
            this.loadUserEvents();
        }
        
        // Ocultar menú móvil
        const mobileMenu = document.getElementById('mobileMenu');
        if (mobileMenu) {
            mobileMenu.classList.add('hidden');
        }
    }

    async loadUserEvents() {
        try {
            this.showEventsLoading();
            
            const data = await ApiService.getUserEvents();
            
            if (data.success) {
                this.currentEvents = data.events || [];
                this.displayUserEvents();
            } else {
                this.showEventsError(data.message);
            }
        } catch (error) {
            this.showEventsError('Error de conexión al cargar los eventos');
        }
    }

    displayUserEvents() {
        const eventsList = document.getElementById('eventsList');
        
        if (this.currentEvents.length > 0) {
            eventsList.innerHTML = `
                <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    ${this.currentEvents.map(event => this.createEventCard(event)).join('')}
                </div>
            `;
        } else {
            this.showNoEvents();
        }
    }

    createEventCard(event) {
        const { date: formattedDate, time: formattedTime } = Utils.formatEventDate(event.date, event.time);

        return `
            <div class="event-card bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100 hover-lift">
                ${this.getEventImage(event)}
                <div class="p-6">
                    ${this.getEventHeader(event)}
                    <p class="text-gray-600 text-sm mb-4 line-clamp-2">${event.description}</p>
                    ${this.getEventDetails(event, formattedDate, formattedTime)}
                    ${this.getEventActions(event)}
                </div>
            </div>
        `;
    }

    getEventImage(event) {
        if (event.imageUrl) {
            return `<img src="${event.imageUrl}" alt="${event.title}" class="w-full h-48 object-cover event-image">`;
        }
        
        return `
            <div class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <i class="fa-solid fa-calendar-day text-4xl text-gray-400"></i>
            </div>
        `;
    }

    getEventHeader(event) {
        return `
            <div class="flex justify-between items-start mb-3">
                <h3 class="font-bold text-gray-900 text-lg leading-tight">${event.title}</h3>
                <span class="category-badge">${event.category}</span>
            </div>
        `;
    }

    getEventDetails(event, formattedDate, formattedTime) {
        return `
            <div class="space-y-2 text-sm text-gray-600 mb-6">
                <div class="flex items-center">
                    <i class="fa-solid fa-location-dot mr-3 text-primary-500"></i>
                    <span class="truncate">${event.location}</span>
                </div>
                <div class="flex items-center">
                    <i class="fa-solid fa-calendar mr-3 text-primary-500"></i>
                    <span>${formattedDate}</span>
                </div>
                <div class="flex items-center">
                    <i class="fa-solid fa-clock mr-3 text-primary-500"></i>
                    <span>${formattedTime}</span>
                </div>
                <div class="flex items-center">
                    <i class="fa-solid fa-tag mr-3 text-primary-500"></i>
                    <span class="font-medium">${event.price}</span>
                </div>
            </div>
        `;
    }

    getEventActions(event) {
        return `
            <div class="flex space-x-3">
                <button onclick="dashboardManager.editEvent('${event.id}')" 
                        class="flex-1 bg-amber-500 text-white py-2 rounded-xl hover:bg-amber-600 transition duration-300 text-sm font-semibold">
                    <i class="fa-solid fa-pen mr-1"></i>Editar
                </button>
                <button onclick="dashboardManager.deleteEvent('${event.id}', '${event.title}')" 
                        class="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition duration-300 text-sm font-semibold">
                    <i class="fa-solid fa-trash mr-1"></i>Eliminar
                </button>
            </div>
        `;
    }

    showEventsLoading() {
        document.getElementById('eventsList').innerHTML = `
            <div class="text-center py-12">
                <div class="loader mx-auto mb-4"></div>
                <p class="text-gray-600">Cargando tus eventos...</p>
            </div>
        `;
    }

    showNoEvents() {
        document.getElementById('eventsList').innerHTML = `
            <div class="text-center py-12">
                <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-4"></i>
                <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay eventos creados</h3>
                <p class="text-gray-600 mb-4">Comienza creando tu primer evento</p>
                <button onclick="dashboardManager.showSection('crear-evento')" 
                        class="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition duration-300">
                    <i class="fa-solid fa-plus mr-2"></i>Crear Primer Evento
                </button>
            </div>
        `;
    }

    showEventsError(message) {
        document.getElementById('eventsList').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fa-solid fa-exclamation-triangle text-2xl mb-2"></i>
                <p>${message}</p>
            </div>
        `;
    }

    async createEvent() {
        const form = document.getElementById('createEventForm');
        const submitBtn = form.querySelector('button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            this.setButtonLoading(submitBtn, 'Creando Evento...');
            
            const formData = new FormData(form);
            const data = await ApiService.createEvent(formData);
            
            if (data.success) {
                await Utils.showAlert('success', '¡Éxito!', data.message || 'Evento creado correctamente');
                form.reset();
                this.resetFileInput();
                this.showSection('mis-eventos');
            } else {
                await Utils.showAlert('error', 'Error', data.message || 'Error al crear el evento');
            }
        } catch (error) {
            await Utils.showAlert('error', 'Error de conexión', 'No se pudo conectar con el servidor. Intenta nuevamente.');
        } finally {
            this.resetButton(submitBtn, originalText);
        }
    }

    editEvent(eventId) {
        const event = this.currentEvents.find(e => e.id === eventId);
        if (!event) {
            Utils.showAlert('error', 'Error', 'No se encontró el evento');
            return;
        }
        
        // Llenar el modal con los datos del evento
        document.getElementById('editEventId').value = event.id;
        document.getElementById('editTitle').value = event.title;
        document.getElementById('editDescription').value = event.description;
        document.getElementById('editLocation').value = event.location;
        document.getElementById('editDate').value = event.date;
        document.getElementById('editTime').value = event.time;
        document.getElementById('editOrganizer').value = event.organizer;
        
        ModalManager.showModal('editEventModal');
    }

    closeEditModal() {
        ModalManager.hideModal('editEventModal');
    }

    async updateEvent() {
        const eventId = document.getElementById('editEventId').value;
        const eventData = {
            title: document.getElementById('editTitle').value,
            description: document.getElementById('editDescription').value,
            location: document.getElementById('editLocation').value,
            date: document.getElementById('editDate').value,
            time: document.getElementById('editTime').value,
            organizer: document.getElementById('editOrganizer').value,
            status: 'active'
        };
        
        const submitBtn = document.querySelector('#editEventForm button[type="submit"]');
        const originalText = submitBtn.innerHTML;
        
        try {
            this.setButtonLoading(submitBtn, 'Guardando...');
            
            const data = await ApiService.updateEvent(eventId, eventData);
            
            if (data.success) {
                await Utils.showAlert('success', '¡Éxito!', 'Evento actualizado correctamente');
                this.closeEditModal();
                setTimeout(() => this.loadUserEvents(), 1000);
            } else {
                await Utils.showAlert('error', 'Error', data.message || 'Error al actualizar el evento');
            }
        } catch (error) {
            await Utils.showAlert('error', 'Error', 'Error de conexión al actualizar el evento');
        } finally {
            this.resetButton(submitBtn, originalText);
        }
    }

    async deleteEvent(eventId, eventTitle) {
        const result = await Swal.fire({
            title: '¿Eliminar evento?',
            html: `¿Estás seguro de que quieres eliminar el evento:<br><strong>"${eventTitle}"</strong>?<br><br>Esta acción no se puede deshacer.`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonColor: '#d33',
            cancelButtonColor: '#6B7280',
            confirmButtonText: 'Sí, eliminar',
            cancelButtonText: 'Cancelar',
            reverseButtons: true
        });
        
        if (result.isConfirmed) {
            try {
                const data = await ApiService.deleteEvent(eventId);
                
                if (data.success) {
                    await Utils.showAlert('success', '¡Eliminado!', 'Evento eliminado correctamente');
                    this.loadUserEvents();
                } else {
                    await Utils.showAlert('error', 'Error', data.message || 'Error al eliminar el evento');
                }
            } catch (error) {
                await Utils.showAlert('error', 'Error', 'Error de conexión al eliminar el evento');
            }
        }
    }

    setButtonLoading(button, text) {
        button.disabled = true;
        button.innerHTML = `<i class="fa-solid fa-spinner fa-spin mr-2"></i>${text}`;
    }

    resetButton(button, originalText) {
        button.disabled = false;
        button.innerHTML = originalText;
    }

    resetFileInput() {
        const fileNameDisplay = document.getElementById('fileName');
        if (fileNameDisplay) {
            fileNameDisplay.classList.add('hidden');
        }
    }
}

// Instancia global
const dashboardManager = new DashboardManager();