// Aplicación principal - Coordina todos los módulos
class App {
    constructor() {
        this.modules = {};
        this.init();
    }

    init() {
        // Inicializar módulos basado en la página actual
        this.detectPageAndInit();
        
        // Configuración global
        this.setupGlobalHandlers();
    }

    detectPageAndInit() {
        const path = window.location.pathname;
        
        // Página de autenticación
        if (path.includes('/login') || path.includes('/register')) {
            this.modules.auth = new AuthManager();
        }
        
        // Página de eventos
        else if (path === '/' || path === '/events') {
            this.modules.events = new EventsManager();
        }
        
        // Dashboard
        else if (path.includes('/dashboard')) {
            this.modules.dashboard = new DashboardManager();
        }
        
        // Inicializar modales globales
        ModalManager.setupEventDetailsModal();
    }

    setupGlobalHandlers() {
        // Menú móvil global
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', () => {
                mobileMenu.classList.toggle('hidden');
            });
        }

        // Cerrar modales al hacer click fuera
        this.setupModalCloseHandlers();
    }

    setupModalCloseHandlers() {
        // Cerrar modales al hacer click fuera
        document.addEventListener('click', (e) => {
            const modals = document.querySelectorAll('.modal');
            modals.forEach(modal => {
                if (e.target === modal) {
                    modal.classList.add('hidden');
                }
            });
        });

        // Cerrar modales con Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                const modals = document.querySelectorAll('.modal:not(.hidden)');
                modals.forEach(modal => {
                    modal.classList.add('hidden');
                });
            }
        });
    }
}

// Inicializar la aplicación cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', () => {
    window.app = new App();
});

// Funciones globales para compatibilidad con HTML onclick
function closeEventDetails() {
    ModalManager.hideModal('eventDetailsModal');
}

function closeEditModal() {
    ModalManager.hideModal('editEventModal');
}