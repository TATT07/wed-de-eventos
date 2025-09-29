from typing import Dict, Any
from services.auth_service import AuthService
from services.firestore_service import FirestoreService
from services.cloudinary_service import CloudinaryService

class FirebaseManager:
    """Fachada principal que coordina todos los servicios"""
    
    def __init__(self):
        self.auth = AuthService()
        self.firestore = FirestoreService()
        self.cloudinary = CloudinaryService()
    
    # Métodos de autenticación
    def register_user(self, email: str, password: str):
        return self.auth.register_user(email, password)
    
    def login_user(self, email: str, password: str):
        return self.auth.login_user(email, password)
    
    # Métodos de eventos
    def create_event(self, event_data: Dict[str, Any], id_token: str) -> Dict[str, Any]:
        """Crear evento - event_data es un diccionario"""
        return self.firestore.create_event_dict(event_data, id_token)
    
    def get_events(self, page: int = 1, limit: int = 10, category: str = None, search: str = None):
        return self.firestore.get_events(page, limit, category, search)
    
    def get_user_events(self, user_id: str, id_token: str):
        return self.firestore.get_user_events(user_id, id_token)
    
    def update_event(self, event_id: str, event_data: dict, id_token: str):
        return self.firestore.update_event(event_id, event_data, id_token)
    
    def delete_event(self, event_id: str, id_token: str):
        return self.firestore.delete_event(event_id, id_token)
    
    # Métodos de Cloudinary
    def upload_image(self, image_file, event_id: str):
        return self.cloudinary.upload_image(image_file, event_id)

# Instancia global
firebase_manager = FirebaseManager()