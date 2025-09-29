// Módulo de gestión de reseñas
class ReviewsManager {
    constructor() {
        this.currentHoverRating = 0;
        this.currentSelectedRating = 0;
    }

    highlightStars(rating) {
        this.currentHoverRating = rating;
        this.updateStarDisplay();
    }

    resetStars() {
        this.currentHoverRating = 0;
        this.updateStarDisplay();
    }

    setRating(rating) {
        this.currentSelectedRating = rating;
        document.getElementById('selected-rating').value = rating;
        this.updateStarDisplay();
    }

    updateStarDisplay() {
        const stars = document.querySelectorAll('.star-rating .star');
        const displayRating = this.currentHoverRating || this.currentSelectedRating;
        
        stars.forEach((star, index) => {
            if (index < displayRating) {
                star.classList.add('active');
            } else {
                star.classList.remove('active');
            }
        });
    }

    // Método para enviar la reseña
    submitReview(event) {
        event.preventDefault();
        
        const rating = this.currentSelectedRating;
        const comment = document.getElementById('review-comment').value;
        
        if (rating === 0) {
            alert('Por favor, selecciona una calificación');
            return;
        }
        
        // Aquí iría la lógica para enviar la reseña al servidor
        console.log('Reseña enviada:', { rating, comment });
        
        // Resetear el formulario
        this.resetForm();
    }

    resetForm() {
        this.currentSelectedRating = 0;
        this.currentHoverRating = 0;
        document.getElementById('review-comment').value = '';
        this.updateStarDisplay();
    }
}

// Inicializar el manager de reseñas
const reviewsManager = new ReviewsManager();

// Exportar para uso en otros módulos
export default reviewsManager;