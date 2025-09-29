import requests
from typing import Dict, Any
from config.firebase_config import firebase_config

class AuthService:
    def __init__(self):
        self.config = firebase_config

    def _make_auth_request(self, endpoint: str, data: Dict[str, Any]) -> Dict[str, Any]:
        """Realizar petición de autenticación"""
        url = f"{self.config.auth_url}:{endpoint}?key={self.config.api_key}"
        try:
            response = requests.post(url, json=data)
            result = response.json()
            if response.status_code == 200:
                return {"success": True, "data": result}
            else:
                error_message = result.get("error", {}).get("message", "Error desconocido")
                return {"success": False, "error": error_message}
        except Exception as e:
            return {"success": False, "error": f"Error de conexión: {str(e)}"}

    def register_user(self, email: str, password: str) -> Dict[str, Any]:
        """Registrar nuevo usuario"""
        data = {"email": email, "password": password, "returnSecureToken": True}
        return self._make_auth_request("signUp", data)

    def login_user(self, email: str, password: str) -> Dict[str, Any]:
        """Iniciar sesión de usuario"""
        data = {"email": email, "password": password, "returnSecureToken": True}
        return self._make_auth_request("signInWithPassword", data)