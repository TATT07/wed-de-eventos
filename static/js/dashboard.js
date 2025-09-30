// Función para mostrar alertas
function showAlert(icon, title, text) {
    return Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonColor: '#3B82F6'
    });
}

// Variables globales
let currentEvents = [];

// Gestión del menú móvil
document.addEventListener('DOMContentLoaded', function() {
    initializeDashboard();
});

function initializeDashboard() {
    const menuBtn = document.getElementById('menuBtn');
    const mobileMenu = document.getElementById('mobileMenu');
    
    if (menuBtn) {
        menuBtn.addEventListener('click', function() {
            mobileMenu.classList.toggle('hidden');
        });
    }

    // Cargar eventos al iniciar
    loadUserEvents();
    
    // Manejar logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            Swal.fire({
                title: '¿Cerrar sesión?',
                text: "¿Estás seguro de que quieres salir?",
                icon: 'question',
                showCancelButton: true,
                confirmButtonColor: '#3B82F6',
                cancelButtonColor: '#6B7280',
                confirmButtonText: 'Sí, cerrar sesión',
                cancelButtonText: 'Cancelar'
            }).then((result) => {
                if (result.isConfirmed) {
                    window.location.href = '/logout';
                }
            });
        });
    }

    // Manejar formulario de crear evento
    const createEventForm = document.getElementById('createEventForm');
    if (createEventForm) {
        createEventForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await createEvent();
        });
    }

    // Manejar formulario de editar evento
    const editEventForm = document.getElementById('editEventForm');
    if (editEventForm) {
        editEventForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            await updateEvent();
        });
    }

    // Configurar file input
    setupFileInput();
}

// Mostrar/ocultar secciones
function showSection(sectionId) {
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
        loadUserEvents();
    }
    
    // Ocultar menú móvil
    const mobileMenu = document.getElementById('mobileMenu');
    if (mobileMenu) {
        mobileMenu.classList.add('hidden');
    }
}

// Cargar eventos del usuario
async function loadUserEvents() {
    try {
        const eventsList = document.getElementById('eventsList');
        eventsList.innerHTML = `
            <div class="text-center py-12">
                <div class="loader mx-auto mb-4"></div>
                <p class="text-gray-600">Cargando tus eventos...</p>
            </div>
        `;

        const response = await fetch('/api/my-events');
        const data = await response.json();
        
        console.log('Datos de eventos recibidos:', data);
        
        if (data.success) {
            currentEvents = data.events || [];
            
            if (currentEvents.length > 0) {
                eventsList.innerHTML = `
                    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        ${currentEvents.map(event => createEventCard(event)).join('')}
                    </div>
                `;
            } else {
                eventsList.innerHTML = `
                    <div class="text-center py-12">
                        <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-4"></i>
                        <h3 class="text-lg font-semibold text-gray-900 mb-2">No hay eventos creados</h3>
                        <p class="text-gray-600 mb-4">Comienza creando tu primer evento</p>
                        <button onclick="showSection('crear-evento')" class="bg-blue-600 text-white px-6 py-3 rounded-2xl font-semibold hover:bg-blue-700 transition duration-300">
                            <i class="fa-solid fa-plus mr-2"></i>Crear Primer Evento
                        </button>
                    </div>
                `;
            }
        } else {
            eventsList.innerHTML = `
                <div class="text-center py-8 text-red-600">
                    <i class="fa-solid fa-exclamation-triangle text-2xl mb-2"></i>
                    <p>Error al cargar los eventos: ${data.message || 'Error desconocido'}</p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error cargando eventos:', error);
        document.getElementById('eventsList').innerHTML = `
            <div class="text-center py-8 text-red-600">
                <i class="fa-solid fa-exclamation-triangle text-2xl mb-2"></i>
                <p>Error de conexión al cargar los eventos</p>
            </div>
        `;
    }
}

// Crear tarjeta de evento
function createEventCard(event) {
    const eventDate = new Date(event.date + 'T' + event.time);
    const formattedDate = eventDate.toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
    const formattedTime = eventDate.toLocaleTimeString('es-ES', {
        hour: '2-digit',
        minute: '2-digit'
    });

    return `
        <div class="event-card bg-white rounded-2xl shadow-soft overflow-hidden border border-gray-100 hover-lift">
            ${event.imageUrl ? `
                <img src="${event.imageUrl}" alt="${event.title}" class="w-full h-48 object-cover event-image">
            ` : `
                <div class="w-full h-48 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                    <i class="fa-solid fa-calendar-day text-4xl text-gray-400"></i>
                </div>
            `}
            <div class="p-6">
                <div class="flex justify-between items-start mb-3">
                    <h3 class="font-bold text-gray-900 text-lg leading-tight">${event.title}</h3>
                    <span class="category-badge">${event.category}</span>
                </div>
                <p class="text-gray-600 text-sm mb-4 line-clamp-2">${event.description}</p>
                
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
                
                <div class="flex space-x-3">
                    <button onclick="editEvent('${event.id}')" class="flex-1 bg-amber-500 text-white py-2 rounded-xl hover:bg-amber-600 transition duration-300 text-sm font-semibold">
                        <i class="fa-solid fa-pen mr-1"></i>Editar
                    </button>
                    <button onclick="deleteEvent('${event.id}', '${event.title}')" class="flex-1 bg-red-500 text-white py-2 rounded-xl hover:bg-red-600 transition duration-300 text-sm font-semibold">
                        <i class="fa-solid fa-trash mr-1"></i>Eliminar
                    </button>
                </div>
            </div>
        </div>
    `;
}

// Crear nuevo evento
async function createEvent() {
    const form = document.getElementById('createEventForm');
    const submitBtn = form.querySelector('button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Creando Evento...';
        
        const formData = new FormData(form);
        
        console.log('Enviando datos del evento...');
        
        const response = await fetch('/api/events', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        console.log('Respuesta del servidor:', data);
        
        if (data.success) {
            await showAlert('success', '¡Éxito!', data.message || 'Evento creado correctamente');
            form.reset();
            
            // Resetear nombre de archivo
            const fileNameDisplay = document.getElementById('fileName');
            if (fileNameDisplay) {
                fileNameDisplay.classList.add('hidden');
            }
            
            showSection('mis-eventos');
        } else {
            await showAlert('error', 'Error', data.message || 'Error al crear el evento');
        }
    } catch (error) {
        console.error('Error creando evento:', error);
        await showAlert('error', 'Error de conexión', 'No se pudo conectar con el servidor. Intenta nuevamente.');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Configurar file input
function setupFileInput() {
    const imageInput = document.getElementById('imageInput');
    const fileNameDisplay = document.getElementById('fileName');
    
    if (imageInput && fileNameDisplay) {
        imageInput.addEventListener('change', function(e) {
            if (this.files && this.files[0]) {
                const file = this.files[0];
                
                // Validar tipo de archivo
                if (!file.type.startsWith('image/')) {
                    showAlert('error', 'Tipo de archivo no válido', 'Por favor selecciona una imagen (JPG, PNG, GIF)');
                    this.value = '';
                    fileNameDisplay.classList.add('hidden');
                    return;
                }
                
                // Validar tamaño (5MB máximo)
                if (file.size > 5 * 1024 * 1024) {
                    showAlert('error', 'Archivo muy grande', 'La imagen debe ser menor a 5MB');
                    this.value = '';
                    fileNameDisplay.classList.add('hidden');
                    return;
                }
                
                fileNameDisplay.textContent = `Archivo seleccionado: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`;
                fileNameDisplay.classList.remove('hidden');
            } else {
                fileNameDisplay.classList.add('hidden');
            }
        });
    }
}




// Editar evento - VERSIÓN MEJORADA
function editEvent(eventId) {
    console.log("=== DEBUG: Editando evento ===");
    console.log("Event ID:", eventId);
    console.log("Eventos actuales:", currentEvents);
    
    const event = currentEvents.find(e => e.id === eventId);
    if (!event) {
        console.error("Evento no encontrado:", eventId);
        showAlert('error', 'Error', 'No se encontró el evento');
        return;
    }
    
    console.log("Evento encontrado:", event);
    
    // Llenar el modal con los datos del evento
    document.getElementById('editEventId').value = event.id;
    document.getElementById('editTitle').value = event.title;
    document.getElementById('editDescription').value = event.description;
    document.getElementById('editLocation').value = event.location;
    document.getElementById('editDate').value = event.date;
    document.getElementById('editTime').value = event.time;
    document.getElementById('editOrganizer').value = event.organizer;
    
    document.getElementById('editEventModal').classList.remove('hidden');
}



// Cerrar modal de edición
function closeEditModal() {
    document.getElementById('editEventModal').classList.add('hidden');
}

// Actualizar evento - VERSIÓN MEJORADA
async function updateEvent() {
    const eventId = document.getElementById('editEventId').value;
    const eventData = {
        title: document.getElementById('editTitle').value,
        description: document.getElementById('editDescription').value,
        location: document.getElementById('editLocation').value,
        date: document.getElementById('editDate').value,
        time: document.getElementById('editTime').value,
        organizer: document.getElementById('editOrganizer').value,
        status: 'active' // Asegurar que el estado sea activo
    };
    
    console.log("=== DEBUG: Enviando actualización ===");
    console.log("Event ID:", eventId);
    console.log("Datos:", eventData);
    
    const submitBtn = document.querySelector('#editEventForm button[type="submit"]');
    const originalText = submitBtn.innerHTML;
    
    try {
        submitBtn.disabled = true;
        submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i>Guardando...';
        
        const response = await fetch(`/api/events/${eventId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(eventData)
        });
        
        const data = await response.json();
        console.log('Respuesta de actualización:', data);
        
        if (data.success) {
            await showAlert('success', '¡Éxito!', 'Evento actualizado correctamente');
            closeEditModal();
            
            // Recargar eventos después de un breve delay
            setTimeout(() => {
                console.log("Recargando eventos después de actualización...");
                loadUserEvents();
            }, 1000);
        } else {
            await showAlert('error', 'Error', data.message || 'Error al actualizar el evento');
        }
    } catch (error) {
        console.error('Error actualizando evento:', error);
        await showAlert('error', 'Error', 'Error de conexión al actualizar el evento');
    } finally {
        submitBtn.disabled = false;
        submitBtn.innerHTML = originalText;
    }
}

// Eliminar evento
async function deleteEvent(eventId, eventTitle) {
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
            const response = await fetch(`/api/events/${eventId}`, {
                method: 'DELETE'
            });
            
            const data = await response.json();
            
            if (data.success) {
                await showAlert('success', '¡Eliminado!', 'Evento eliminado correctamente');
                loadUserEvents();
            } else {
                await showAlert('error', 'Error', data.message || 'Error al eliminar el evento');
            }
        } catch (error) {
            await showAlert('error', 'Error', 'Error de conexión al eliminar el evento');
        }
    }
}

// Función auxiliar para formatear fechas
function formatDate(dateString) {
    const options = { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric',
        weekday: 'long'
    };
    return new Date(dateString).toLocaleDateString('es-ES', options);
}