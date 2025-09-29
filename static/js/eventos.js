
let currentPage = 1;
const eventsPerPage = 10;

// Cargar eventos al iniciar
document.addEventListener('DOMContentLoaded', function() {
    loadEvents();
    
    // Menú móvil
    document.getElementById('menuBtn').addEventListener('click', function() {
    document.getElementById('mobileMenu').classList.toggle('hidden');
    });
});

// Cargar eventos desde la API
async function loadEvents(page = 1) {
    const category = document.getElementById('categoryFilter').value;
    const search = document.getElementById('searchFilter').value;
    
    try {
    document.getElementById('eventsContainer').innerHTML = `
        <div class="text-center py-12">
        <i class="fa-solid fa-spinner fa-spin text-3xl text-gray-400 mb-4"></i>
        <p class="text-gray-600">Cargando eventos...</p>
        </div>
    `;

    const response = await fetch(`/api/events?page=${page}&limit=${eventsPerPage}&category=${category}&search=${search}`);
    const data = await response.json();

    console.log('Datos recibidos de eventos:', data);

    if (data.success && data.events && data.events.length > 0) {
        displayEvents(data.events);
        setupPagination(data.page, data.events.length, data.hasMore);
    } else {
        document.getElementById('eventsContainer').innerHTML = `
        <div class="text-center py-12">
            <i class="fa-solid fa-calendar-xmark text-4xl text-gray-300 mb-4"></i>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">No se encontraron eventos</h3>
            <p class="text-gray-600">${data.message || 'Intenta con otros filtros de búsqueda'}</p>
        </div>
        `;
        document.getElementById('pagination').classList.add('hidden');
    }
    } catch (error) {
    console.error('Error cargando eventos:', error);
    document.getElementById('eventsContainer').innerHTML = `
        <div class="text-center py-12 text-red-600">
        <i class="fa-solid fa-exclamation-triangle text-3xl mb-4"></i>
        <h3 class="text-lg font-semibold mb-2">Error al cargar eventos</h3>
        <p>Intenta recargar la página</p>
        <p class="text-sm mt-2">${error.message}</p>
        </div>
    `;
    }
}

// Mostrar eventos en la página
function displayEvents(events) {
    console.log('Mostrando eventos:', events);
    
    const eventsHTML = events.map(event => {
    // Formatear fecha
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

    // Calificación promedio
    const averageRating = event.averageRating || 0;
    const reviewCount = event.reviewCount || 0;

    return `
        <div class="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-lg transition duration-300 mb-6 border border-gray-100">
        <div class="md:flex">
            ${event.imageUrl ? `
            <div class="md:w-1/3">
                <img src="${event.imageUrl}" alt="${event.title}" class="w-full h-48 md:h-full object-cover">
            </div>
            ` : `
            <div class="md:w-1/3 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                <i class="fa-solid fa-calendar-day text-4xl text-gray-400"></i>
            </div>
            `}
            <div class="p-6 md:${event.imageUrl ? 'w-2/3' : 'w-full'}">
            <div class="flex justify-between items-start mb-3">
                <h3 class="text-xl font-bold text-gray-900">${event.title}</h3>
                <span class="bg-blue-100 text-blue-800 text-xs font-medium px-3 py-1 rounded-full">${event.category}</span>
            </div>
            
            <p class="text-gray-600 mb-4">${event.description}</p>
            
            <!-- Calificación -->
            ${averageRating > 0 ? `
                <div class="flex items-center mb-4">
                <div class="flex text-amber-500">
                    ${generateStarRating(averageRating)}
                </div>
                <span class="ml-2 text-sm text-gray-600">${averageRating} (${reviewCount} reseña${reviewCount !== 1 ? 's' : ''})</span>
                </div>
            ` : ''}
            
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
            
            <div class="flex justify-between items-center pt-4 border-t border-gray-200">
                <span class="text-sm text-gray-500">Organizado por: ${event.organizer}</span>
                <button onclick="showEventDetails('${event.id}')" class="bg-blue-600 text-white px-4 py-2 rounded-xl hover:bg-blue-700 transition duration-300 text-sm font-semibold">
                <i class="fa-solid fa-eye mr-1"></i>Ver Detalles
                </button>
            </div>
            </div>
        </div>
        </div>
    `;
    }).join('');

    document.getElementById('eventsContainer').innerHTML = eventsHTML;
}

// Generar estrellas para la calificación
function generateStarRating(rating) {
    let stars = '';
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    
    for (let i = 0; i < fullStars; i++) {
    stars += '<i class="fa-solid fa-star"></i>';
    }
    
    if (hasHalfStar) {
    stars += '<i class="fa-solid fa-star-half-alt"></i>';
    }
    
    const emptyStars = 5 - fullStars - (hasHalfStar ? 1 : 0);
    for (let i = 0; i < emptyStars; i++) {
    stars += '<i class="fa-regular fa-star"></i>';
    }
    
    return stars;
}

// Configurar paginación mejorada
function setupPagination(page, eventsCount, hasMore = false) {
    currentPage = page;
    document.getElementById('pageInfo').textContent = `Página ${page}`;
    
    const prevBtn = document.getElementById('prevPage');
    const nextBtn = document.getElementById('nextPage');
    
    prevBtn.disabled = page <= 1;
    nextBtn.disabled = !hasMore;
    
    document.getElementById('pagination').classList.remove('hidden');
    
    // Event listeners para paginación
    prevBtn.onclick = () => page > 1 && loadEvents(page - 1);
    nextBtn.onclick = () => hasMore && loadEvents(page + 1);
}

// Mostrar detalles del evento
async function showEventDetails(eventId) {
    try {
    const response = await fetch(`/api/events/${eventId}/details`);
    const data = await response.json();
    
    if (data.success) {
        const event = data.event;
        const reviews = data.reviews;
        
        // Formatear fecha
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
        
        // Calificación promedio
        const averageRating = event.averageRating || 0;
        const reviewCount = event.reviewCount || 0;
        
        let modalContent = `
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div class="lg:col-span-2">
            ${event.imageUrl ? `
                <img src="${event.imageUrl}" alt="${event.title}" class="w-full h-64 object-cover rounded-lg mb-4">
            ` : `
                <div class="w-full h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center mb-4">
                <i class="fa-solid fa-calendar-day text-6xl text-gray-400"></i>
                </div>
            `}
            
            <div class="bg-gray-50 p-4 rounded-lg">
                <h3 class="font-semibold text-gray-900 mb-2">Descripción</h3>
                <p class="text-gray-700">${event.description}</p>
            </div>
            
            <!-- Reseñas -->
            <div class="mt-6">
                <h3 class="font-semibold text-gray-900 mb-4">Reseñas (${reviewCount})</h3>
                ${reviews.length > 0 ? reviews.map(review => `
                <div class="bg-white border border-gray-200 rounded-lg p-4 mb-3">
                    <div class="flex justify-between items-start mb-2">
                    <span class="font-medium text-gray-900">${review.userEmail}</span>
                    <div class="flex text-amber-500 text-sm">
                        ${generateStarRating(review.rating)}
                    </div>
                    </div>
                    <p class="text-gray-600 text-sm">${review.comment}</p>
                    <span class="text-xs text-gray-400 mt-2 block">
                    ${new Date(review.createdAt).toLocaleDateString('es-ES')}
                    </span>
                </div>
                `).join('') : `
                <p class="text-gray-500 text-center py-4">Aún no hay reseñas para este evento.</p>
                `}
            </div>
            </div>
            
            <div class="lg:col-span-1">
            <div class="bg-blue-50 p-4 rounded-lg mb-4">
                <h3 class="font-semibold text-gray-900 mb-3">Información del Evento</h3>
                
                <div class="space-y-3">
                <div class="flex items-center">
                    <i class="fa-solid fa-location-dot mr-3 text-blue-600"></i>
                    <span class="text-gray-700">${event.location}</span>
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
                    <span class="text-gray-700 font-medium">${event.price}</span>
                </div>
                <div class="flex items-center">
                    <i class="fa-solid fa-users mr-3 text-blue-600"></i>
                    <span class="text-gray-700">Máximo ${event.maxAttendees} personas</span>
                </div>
                </div>
            </div>
            
            <!-- Calificación promedio -->
            ${averageRating > 0 ? `
                <div class="bg-amber-50 p-4 rounded-lg mb-4">
                <h3 class="font-semibold text-gray-900 mb-2">Calificación</h3>
                <div class="flex items-center justify-center mb-2">
                    <div class="flex text-amber-500 text-2xl">
                    ${generateStarRating(averageRating)}
                    </div>
                </div>
                <p class="text-center text-gray-700">${averageRating} de 5 estrellas</p>
                <p class="text-center text-sm text-gray-500">Basado en ${reviewCount} reseña${reviewCount !== 1 ? 's' : ''}</p>
                </div>
            ` : ''}
            
            <!-- Formulario para agregar reseña -->
            <div class="bg-white border border-gray-200 rounded-lg p-4">
                <h3 class="font-semibold text-gray-900 mb-3">Agregar Reseña</h3>
                <form onsubmit="addReview(event, '${event.id}')">
                <div class="mb-3">
                    <label class="block text-sm font-medium text-gray-700 mb-2">Calificación</label>
                    <div class="flex space-x-1" id="starRating">
                    ${[1,2,3,4,5].map(i => `
                        <i class="fa-regular fa-star text-2xl text-amber-500 cursor-pointer hover:text-amber-400" 
                            data-rating="${i}" 
                            onmouseover="highlightStars(${i})" 
                            onmouseout="resetStars()" 
                            onclick="setRating(${i})"></i>
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
            </div>
        </div>
        `;
        
        document.getElementById('modalEventTitle').textContent = event.title;
        document.getElementById('modalEventContent').innerHTML = modalContent;
        document.getElementById('eventDetailsModal').classList.remove('hidden');
    } else {
        alert('Error al cargar los detalles del evento');
    }
    } catch (error) {
    console.error('Error cargando detalles:', error);
    alert('Error al cargar los detalles del evento');
    }
}

// Cerrar modal de detalles
function closeEventDetails() {
    document.getElementById('eventDetailsModal').classList.add('hidden');
}

// Funciones para el sistema de estrellas
let currentHoverRating = 0;
let currentSelectedRating = 0;

function highlightStars(rating) {
    currentHoverRating = rating;
    updateStarDisplay();
}

function resetStars() {
    currentHoverRating = 0;
    updateStarDisplay();
}

function setRating(rating) {
    currentSelectedRating = rating;
    document.getElementById('selectedRating').value = rating;
    updateStarDisplay();
}

function updateStarDisplay() {
    const stars = document.querySelectorAll('#starRating .fa-star');
    const displayRating = currentHoverRating || currentSelectedRating;
    
    stars.forEach((star, index) => {
    const starRating = parseInt(star.getAttribute('data-rating'));
    if (starRating <= displayRating) {
        star.classList.remove('fa-regular');
        star.classList.add('fa-solid');
    } else {
        star.classList.remove('fa-solid');
        star.classList.add('fa-regular');
    }
    });
}

// Agregar reseña
async function addReview(event, eventId) {
    event.preventDefault();
    
    const rating = parseInt(document.getElementById('selectedRating').value);
    const comment = document.getElementById('reviewComment').value.trim();
    
    if (rating === 0) {
    alert('Por favor selecciona una calificación');
    return;
    }
    
    if (!comment) {
    alert('Por favor escribe un comentario');
    return;
    }
    
    try {
    const response = await fetch(`/api/events/${eventId}/reviews`, {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({
        rating: rating,
        comment: comment
        })
    });
    
    const data = await response.json();
    
    if (data.success) {
        alert('¡Reseña agregada correctamente!');
        closeEventDetails();
        // Recargar los detalles del evento para mostrar la nueva reseña
        setTimeout(() => showEventDetails(eventId), 500);
    } else {
        alert(data.message || 'Error al agregar la reseña');
    }
    } catch (error) {
    console.error('Error agregando reseña:', error);
    alert('Error al agregar la reseña');
    }
}