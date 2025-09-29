// Gestión de modales
class ModalManager {
    static showModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('hidden');
        }
    }

    static hideModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('hidden');
        }
    }

    static setupEventDetailsModal() {
        // Cerrar modal al hacer click fuera
        const modal = document.getElementById('eventDetailsModal');
        if (modal) {
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    this.hideModal('eventDetailsModal');
                }
            });
        }
    }
}