/* =========================
   EVENTOS DE PRUEBA
   ========================= */
const events = [
  {
    id: 1,
    title: "Concierto de Silvestre Dangond",
    description: "El evento musical más esperado del año en la ciudad.",
    date: "2025-11-15T20:00:00",
    location: "Estadio General Santander, Cúcuta",
    image: "img/concierto1.jpg",
    highlight: true
  },
  {
    id: 2,
    title: "Feria Gastronómica",
    description: "Los mejores sabores típicos de la región.",
    date: "2025-10-10T10:00:00",
    location: "Parque 300 Años, Cúcuta",
    image: "img/feria.jpg",
    highlight: true
  },
  {
    id: 3,
    title: "Festival de Teatro",
    description: "Presentaciones culturales para toda la familia.",
    date: "2025-09-30T18:00:00",
    location: "Teatro Zulima, Cúcuta",
    image: "img/teatro.jpg",
    highlight: false
  },
  {
    id: 4,
    title: "Exposición de Arte Moderno",
    description: "Obras de artistas locales e internacionales.",
    date: "2025-12-01T09:00:00",
    location: "Museo de Arte Moderno, Cúcuta",
    image: "img/arte.jpg",
    highlight: false
  }
];

/* =========================
   CARRUSEL
   ========================= */
let currentSlide = 0;
const slidesContainer = document.getElementById("carousel-slides");

function renderCarousel() {
  slidesContainer.innerHTML = "";
  const destacados = events.filter(e => e.highlight);

  destacados.forEach((ev, idx) => {
    const slide = document.createElement("div");
    slide.className = "slide";
    if (idx === 0) slide.classList.add("active");
    slide.style.backgroundImage = `url(${ev.image})`;
    slide.innerHTML = `
      <div class="overlay">
        <h2>${ev.title}</h2>
        <p>${new Date(ev.date).toLocaleDateString()}</p>
        <p>${ev.location}</p>
      </div>
    `;
    slide.addEventListener("click", () => openDetail(ev));
    slidesContainer.appendChild(slide);
  });
}

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  slides.forEach(s => s.classList.remove("active"));
  currentSlide = (index + slides.length) % slides.length;
  slides[currentSlide].classList.add("active");
}

document.querySelector(".carousel .prev")?.addEventListener("click", () => showSlide(currentSlide - 1));
document.querySelector(".carousel .next")?.addEventListener("click", () => showSlide(currentSlide + 1));

/* =========================
   EVENTOS GRID
   ========================= */
const grid = document.getElementById("event-grid");

function renderGrid() {
  grid.innerHTML = "";
  events.forEach(ev => {
    const card = document.createElement("div");
    card.className = "card";
    card.innerHTML = `
      <img src="${ev.image}" alt="${ev.title}">
      <h3 class="title">${ev.title}</h3>
      <p>${ev.description}</p>
      <p><strong>📅</strong> ${new Date(ev.date).toLocaleString()}</p>
      <p><strong>📍</strong> ${ev.location}</p>
      <button class="btn-view">Ver detalle</button>
    `;
    card.querySelector(".btn-view").addEventListener("click", () => openDetail(ev));
    grid.appendChild(card);
  });
}

/* =========================
   DETALLE + MAPA
   ========================= */
function openDetail(ev) {
  const detail = document.createElement("div");
  detail.className = "detail-modal";
  detail.innerHTML = `
    <div class="detail-content">
      <button class="detail-close">✖</button>
      <h2>${ev.title}</h2>
      <p>${ev.description}</p>
      <p><strong>Fecha:</strong> ${new Date(ev.date).toLocaleString()}</p>
      <p><strong>Lugar:</strong> ${ev.location}</p>
      <div id="mapa-evento">
        <iframe
          width="100%"
          height="300"
          style="border:0;"
          loading="lazy"
          allowfullscreen
          src="https://www.google.com/maps?q=${encodeURIComponent(ev.location)}&output=embed">
        </iframe>
      </div>
      <div id="comentarios">
        <h3>Comentarios</h3>
        <p>(Aún sin conexión a backend)</p>
      </div>
    </div>
  `;
  document.body.appendChild(detail);

  detail.querySelector(".detail-close").addEventListener("click", () => {
    detail.remove();
  });
}

// Cambiar navbar al hacer scroll
window.addEventListener("scroll", () => {
  const navbar = document.querySelector(".navbar");
  if (window.scrollY > 50) {
    navbar.classList.add("scrolled");
  } else {
    navbar.classList.remove("scrolled");
  }
});


/* =========================
   INICIALIZAR
   ========================= */
renderCarousel();
renderGrid();
