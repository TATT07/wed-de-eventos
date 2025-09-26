// Elementos del DOM
const listEl = document.getElementById('events-list');
const tpl = document.getElementById('card-template');
const highlightTpl = document.getElementById('highlight-template');
const carouselEl = document.getElementById('carousel');

const modal = document.getElementById('modal');
const btnNew = document.getElementById('btn-new');
const btnCancel = document.getElementById('btn-cancel');
const btnCancelForm = document.getElementById('btn-cancel-form');
const formCreate = document.getElementById('form-create');

const detailModal = document.getElementById('detail-modal');
const detailClose = document.getElementById('detail-close');
const commentForm = document.getElementById('comment-form');

const btnPrev = document.getElementById('prev');
const btnNext = document.getElementById('next');

let currentEventId = null;

// Datos de prueba con más variedad
let events = [
  { 
    id: 1, 
    title: "Concierto Silvestre Dangond", 
    date: "2025-10-20T20:00", 
    location: "Estadio General Santander", 
    description: "Gran concierto vallenato en Cúcuta con los mejores exponentes del género. Una noche llena de música, folclor y tradición que no te puedes perder.", 
    organizer: "Eventos Cúcuta", 
    highlight: true, 
    image: "https://picsum.photos/id/237/400/200", 
    comments: [
      { author: "María González", rating: 5, text: "¡Increíble concierto! La mejor experiencia musical del año." },
      { author: "Carlos Ruiz", rating: 4, text: "Excelente organización y gran ambiente." }
    ]
  },
  { 
    id: 2, 
    title: "Feria del Libro", 
    date: "2025-11-05T10:00", 
    location: "Biblioteca Pública Julio Pérez", 
    description: "Encuentro literario con autores invitados, talleres de escritura, presentaciones de libros y actividades culturales para toda la familia.", 
    organizer: "Cultura Cúcuta", 
    highlight: true, 
    image: "https://picsum.photos/id/238/400/200", 
    comments: [
      { author: "Ana Martínez", rating: 5, text: "Una experiencia cultural enriquecedora. Los talleres fueron excelentes." }
    ]
  },
  { 
    id: 3, 
    title: "Festival Gastronómico", 
    date: "2025-12-01T12:00", 
    location: "Parque Santander", 
    description: "Sabores típicos y comida internacional en el corazón de Cúcuta. Degustación, concursos culinarios y actividades familiares.", 
    organizer: "Alcaldía de Cúcuta", 
    highlight: false, 
    image: "https://picsum.photos/id/239/400/200", 
    comments: []
  },
  { 
    id: 4, 
    title: "Noche de Salsa", 
    date: "2025-10-15T21:00", 
    location: "Club Social Cúcuta", 
    description: "Una noche llena de ritmo y sabor caribeño con las mejores orquestas de salsa de la región.", 
    organizer: "Club Social", 
    highlight: false, 
    image: "https://picsum.photos/id/240/400/200", 
    comments: []
  },
  { 
    id: 5, 
    title: "Expo Tecnología 2025", 
    date: "2025-11-20T09:00", 
    location: "Centro de Convenciones", 
    description: "La feria tecnológica más importante del departamento. Innovación, emprendimiento y las últimas tendencias tech.", 
    organizer: "TechCúcuta", 
    highlight: false, 
    image: "https://picsum.photos/id/241/400/200", 
    comments: []
  }
];

// Funciones de utilidad
function formatDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric', 
    hour: '2-digit', 
    minute: '2-digit' 
  };
  return date.toLocaleDateString('es-ES', options);
}

function formatShortDate(dateString) {
  const date = new Date(dateString);
  const options = { 
    month: 'short', 
    day: 'numeric'
  };
  return date.toLocaleDateString('es-ES', options);
}

function showNotification(message, type = 'success') {
  // Crear notificación temporal
  const notification = document.createElement('div');
  notification.className = `fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg transition-all duration-300 transform translate-x-full ${
    type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
  }`;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  // Mostrar notificación
  setTimeout(() => {
    notification.classList.remove('translate-x-full');
  }, 100);
  
  // Ocultar después de 3 segundos
  setTimeout(() => {
    notification.classList.add('translate-x-full');
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 300);
  }, 3000);
}

// Actualizar estadísticas
function updateStats() {
  const totalEvents = events.length;
  const thisWeekEvents = events.filter(e => {
    const eventDate = new Date(e.date);
    const now = new Date();
    const weekFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
    return eventDate >= now && eventDate <= weekFromNow;
  }).length;
  
  const totalAttendees = events.reduce((sum, event) => sum + event.comments.length * 50, 0); // Estimación
  
  // Actualizar las tarjetas de estadísticas (si existen)
  const statsCards = document.querySelectorAll('main section:first-child .text-3xl');
  if (statsCards.length >= 3) {
    statsCards[0].textContent = totalEvents;
    statsCards[1].textContent = thisWeekEvents;
    statsCards[2].textContent = totalAttendees > 1000 ? `${(totalAttendees/1000).toFixed(1)}k` : totalAttendees;
  }
}

// --- Modal crear ---
btnNew.addEventListener('click', () => {
  modal.classList.remove('hidden');
  modal.classList.add('flex');
});

btnCancel.addEventListener('click', () => {
  modal.classList.add('hidden');
  modal.classList.remove('flex');
});

if (btnCancelForm) {
  btnCancelForm.addEventListener('click', () => {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  });
}

// Cerrar modal al hacer click fuera
modal.addEventListener('click', (e) => {
  if (e.target === modal) {
    modal.classList.add('hidden');
    modal.classList.remove('flex');
  }
});

formCreate.addEventListener('submit', (e) => {
  e.preventDefault();
  
  // Mostrar estado de carga
  const submitBtn = formCreate.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Creando...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    const fd = new FormData(formCreate);
    const payload = Object.fromEntries(fd.entries());
    payload.id = events.length + 1;
    payload.highlight = false;
    payload.image = `https://picsum.photos/400/200?random=${Math.floor(Math.random()*1000)}`;
    payload.comments = [];
    
    events.push(payload);
    modal.classList.add('hidden');
    modal.classList.remove('flex');
    formCreate.reset();
    
    // Restaurar botón
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    
    load();
    showNotification('¡Evento creado exitosamente!');
  }, 1000);
});

// --- Cargar eventos ---
function load() {
  // Limpiar contenedores
  listEl.innerHTML = '';
  carouselEl.innerHTML = '';

  const highlighted = events.filter(e => e.highlight);
  const normal = events.filter(e => !e.highlight);

  // Cargar eventos destacados
  highlighted.forEach((ev, index) => {
    const node = highlightTpl.content.cloneNode(true);
    const card = node.querySelector('.highlight-card');
    
    // Agregar animación escalonada
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in-up');
    
    node.querySelector('img').src = ev.image;
    node.querySelector('.title').textContent = ev.title;
    node.querySelector('.date').textContent = formatShortDate(ev.date);
    node.querySelector('.location').textContent = ev.location;
    
    // Event listener para toda la tarjeta
    card.addEventListener('click', () => openDetail(ev.id));
    
    carouselEl.appendChild(node);
  });

  // Cargar eventos normales
  normal.forEach((ev, index) => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.event-card');
    
    // Agregar animación escalonada
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in-up');
    
    node.querySelector('.title').textContent = ev.title;
    node.querySelector('.description').textContent = ev.description;
    node.querySelector('.date').textContent = formatDate(ev.date);
    node.querySelector('.location').textContent = ev.location;
    node.querySelector('.organizer').textContent = ev.organizer;
    node.querySelector('.image').src = ev.image;
    node.querySelector('.btn-view').addEventListener('click', () => openDetail(ev.id));
    
    listEl.appendChild(node);
  });
  
  updateStats();
}

// --- Detalle ---
function openDetail(id) {
  const ev = events.find(e => e.id == id);
  if (!ev) return;
  
  currentEventId = id;
  
  // Llenar información del evento
  document.getElementById('detail-title').textContent = ev.title;
  document.getElementById('detail-desc').textContent = ev.description;
  document.getElementById('detail-date').textContent = formatDate(ev.date);
  document.getElementById('detail-location').textContent = ev.location;
  document.getElementById('detail-organizer').textContent = ev.organizer;
  document.getElementById('detail-image').src = ev.image;

  // Cargar comentarios
  const commentsEl = document.getElementById('comments');
  commentsEl.innerHTML = '';
  
  if (ev.comments.length === 0) {
    commentsEl.innerHTML = '<p class="text-gray-500 text-center py-4">Aún no hay comentarios. ¡Sé el primero en comentar!</p>';
  } else {
    ev.comments.forEach((c, index) => {
      const commentDiv = document.createElement('div');
      commentDiv.className = 'bg-white rounded-xl p-4 shadow-sm border border-gray-100 fade-in-up';
      commentDiv.style.animationDelay = `${index * 0.1}s`;
      
      // Crear estrellas para el rating
      const stars = Array.from({length: 5}, (_, i) => 
        `<i class="fas fa-star ${i < c.rating ? 'text-yellow-400' : 'text-gray-300'}"></i>`
      ).join('');
      
      commentDiv.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <strong class="text-gray-800">${c.author}</strong>
          <div class="flex items-center space-x-1">${stars}</div>
        </div>
        <p class="text-gray-600">${c.text}</p>
      `;
      
      commentsEl.appendChild(commentDiv);
    });
  }

  // Inicializar mapa
  if (typeof google !== 'undefined') {
    const mapOptions = {
      center: { lat: 7.8939, lng: -72.5078 },
      zoom: 13,
      styles: [
        {
          "featureType": "all",
          "elementType": "geometry.fill",
          "stylers": [{"weight": "2.00"}]
        },
        {
          "featureType": "all",
          "elementType": "geometry.stroke",
          "stylers": [{"color": "#9c9c9c"}]
        }
      ]
    };
    
    const map = new google.maps.Map(document.getElementById("map"), mapOptions);
    new google.maps.Marker({
      position: { lat: 7.8939, lng: -72.5078 },
      map,
      title: ev.location,
      animation: google.maps.Animation.DROP
    });
  }

  detailModal.classList.remove('hidden');
  detailModal.classList.add('flex');
}

detailClose.addEventListener('click', () => {
  detailModal.classList.add('hidden');
  detailModal.classList.remove('flex');
});

// Cerrar modal de detalle al hacer click fuera
detailModal.addEventListener('click', (e) => {
  if (e.target === detailModal) {
    detailModal.classList.add('hidden');
    detailModal.classList.remove('flex');
  }
});

// --- Comentarios ---
commentForm.addEventListener('submit', (e) => {
  e.preventDefault();
  
  const submitBtn = commentForm.querySelector('button[type="submit"]');
  const originalText = submitBtn.innerHTML;
  submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Enviando...';
  submitBtn.disabled = true;
  
  setTimeout(() => {
    const fd = new FormData(commentForm);
    const payload = Object.fromEntries(fd.entries());
    payload.rating = Number(payload.rating);
    
    // Validar rating
    if (payload.rating < 1 || payload.rating > 5) {
      showNotification('El puntaje debe estar entre 1 y 5', 'error');
      submitBtn.innerHTML = originalText;
      submitBtn.disabled = false;
      return;
    }
    
    events.find(e => e.id == currentEventId).comments.push(payload);
    commentForm.reset();
    
    submitBtn.innerHTML = originalText;
    submitBtn.disabled = false;
    
    openDetail(currentEventId);
    showNotification('¡Comentario agregado exitosamente!');
  }, 800);
});

// --- Carrusel ---
btnPrev.addEventListener('click', () => {
  carouselEl.scrollBy({ left: -350, behavior: 'smooth' });
});

btnNext.addEventListener('click', () => {
  carouselEl.scrollBy({ left: 350, behavior: 'smooth' });
});

// Navegación automática del carrusel (opcional)
let carouselInterval;

function startCarouselAutoplay() {
  carouselInterval = setInterval(() => {
    if (carouselEl.scrollLeft + carouselEl.clientWidth >= carouselEl.scrollWidth) {
      carouselEl.scrollTo({ left: 0, behavior: 'smooth' });
    } else {
      carouselEl.scrollBy({ left: 350, behavior: 'smooth' });
    }
  }, 5000);
}

function stopCarouselAutoplay() {
  clearInterval(carouselInterval);
}

// Pausar autoplay al hacer hover
carouselEl.addEventListener('mouseenter', stopCarouselAutoplay);
carouselEl.addEventListener('mouseleave', startCarouselAutoplay);

// Búsqueda en tiempo real
const searchInput = document.querySelector('input[placeholder="Buscar eventos..."]');
if (searchInput) {
  searchInput.addEventListener('input', (e) => {
    const searchTerm = e.target.value.toLowerCase();
    filterEvents(searchTerm);
  });
}

function filterEvents(searchTerm) {
  if (!searchTerm) {
    load();
    return;
  }
  
  const filteredEvents = events.filter(event => 
    event.title.toLowerCase().includes(searchTerm) ||
    event.description.toLowerCase().includes(searchTerm) ||
    event.location.toLowerCase().includes(searchTerm) ||
    event.organizer.toLowerCase().includes(searchTerm)
  );
  
  // Mostrar solo eventos filtrados
  listEl.innerHTML = '';
  
  if (filteredEvents.length === 0) {
    listEl.innerHTML = '<div class="col-span-full text-center py-8 text-gray-500">No se encontraron eventos que coincidan con tu búsqueda.</div>';
    return;
  }
  
  filteredEvents.forEach((ev, index) => {
    const node = tpl.content.cloneNode(true);
    const card = node.querySelector('.event-card');
    
    card.style.animationDelay = `${index * 0.1}s`;
    card.classList.add('fade-in-up');
    
    node.querySelector('.title').textContent = ev.title;
    node.querySelector('.description').textContent = ev.description;
    node.querySelector('.date').textContent = formatDate(ev.date);
    node.querySelector('.location').textContent = ev.location;
    node.querySelector('.organizer').textContent = ev.organizer;
    node.querySelector('.image').src = ev.image;
    node.querySelector('.btn-view').addEventListener('click', () => openDetail(ev.id));
    
    listEl.appendChild(node);
  });
}

// Inicializar aplicación
document.addEventListener('DOMContentLoaded', () => {
  load();
  startCarouselAutoplay();
});

// Manejo de errores para imágenes
document.addEventListener('error', (e) => {
  if (e.target.tagName === 'IMG') {
    e.target.src = `https://via.placeholder.com/400x200/667eea/ffffff?text=Imagen+no+disponible`;
  }
}, true);