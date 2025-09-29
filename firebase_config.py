import requests
import json
import cloudinary
import cloudinary.uploader
import cloudinary.api
from datetime import datetime

# Configuración de Cloudinary
cloudinary.config(
    cloud_name="ddmeyq4fr",
    api_key="525393814454343", 
    api_secret="SkQRmFUxYgsPs8_Euht6m9CO1GQ",
    secure=True
)

class FirebaseManager:
    def __init__(self):
        self.api_key = "AIzaSyAcjMB3_MzXxH52SshiY0Bcb4Gt8WbdmJo"
        self.project_id = "gestordeeventos-d7107"
        
        self.auth_url = "https://identitytoolkit.googleapis.com/v1/accounts"
        self.firestore_url = f"https://firestore.googleapis.com/v1/projects/{self.project_id}/databases/(default)/documents"
    
    # ===== AUTHENTICATION =====
    def _make_auth_request(self, endpoint, data):
        url = f"{self.auth_url}:{endpoint}?key={self.api_key}"
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
    
    def register_user(self, email, password):
        data = {"email": email, "password": password, "returnSecureToken": True}
        return self._make_auth_request("signUp", data)
    
    def login_user(self, email, password):
        data = {"email": email, "password": password, "returnSecureToken": True}
        return self._make_auth_request("signInWithPassword", data)
    
    # ===== FIRESTORE (EVENTOS) - CORREGIDO =====
    def create_event(self, event_data, id_token):
        """Crear evento en Firestore - Versión corregida"""
        url = f"{self.firestore_url}/events"
        headers = {
            "Authorization": f"Bearer {id_token}",
            "Content-Type": "application/json"
        }
        
        # Asegurarse de que todos los campos tengan valores
        event_data.setdefault('imageUrl', '')
        event_data.setdefault('price', 'Gratis')
        event_data.setdefault('category', 'General')
        event_data.setdefault('maxAttendees', '100')
        event_data.setdefault('status', 'active')
        
        # Formato CORRECTO para Firestore
        firestore_data = {
            "fields": {
                "title": {"stringValue": event_data["title"]},
                "description": {"stringValue": event_data["description"]},
                "location": {"stringValue": event_data["location"]},
                "date": {"stringValue": event_data["date"]},
                "time": {"stringValue": event_data["time"]},
                "organizer": {"stringValue": event_data["organizer"]},
                "creatorId": {"stringValue": event_data["creatorId"]},
                "creatorEmail": {"stringValue": event_data["creatorEmail"]},
                "imageUrl": {"stringValue": event_data["imageUrl"]},
                "price": {"stringValue": event_data["price"]},
                "category": {"stringValue": event_data["category"]},
                "maxAttendees": {"integerValue": str(event_data.get("maxAttendees", 100))},
                "status": {"stringValue": "active"},
                "createdAt": {"timestampValue": datetime.utcnow().isoformat() + "Z"}
            }
        }
        
        print("=== DEBUG: Creando evento en Firestore ===")
        print("Datos a guardar:", json.dumps(firestore_data, indent=2))
        
        try:
            response = requests.post(url, headers=headers, json=firestore_data, timeout=30)
            
            print("=== DEBUG: Respuesta de Firestore ===")
            print("Status Code:", response.status_code)
            print("Response:", response.text)
            
            if response.status_code == 200:
                result = response.json()
                event_id = result["name"].split("/")[-1]
                return {"success": True, "eventId": event_id, "data": result}
            else:
                error_msg = f"Error {response.status_code}: {response.text}"
                return {"success": False, "error": error_msg}
                
        except Exception as e:
            error_msg = f"Excepción: {str(e)}"
            return {"success": False, "error": error_msg}
    
    def get_events(self, page=1, limit=10, category=None, search=None):
        """Obtener eventos públicos - Versión corregida"""
        url = f"{self.firestore_url}:runQuery"
        
        # Consulta base simplificada SIN orderBy que causa problemas
        query = {
            "structuredQuery": {
                "from": [{"collectionId": "events"}],
                "where": {
                    "fieldFilter": {
                        "field": {"fieldPath": "status"},
                        "op": "EQUAL",
                        "value": {"stringValue": "active"}
                    }
                },
                "limit": limit
            }
        }
        
        try:
            response = requests.post(url, json=query, timeout=30)
            
            print("=== DEBUG: Consulta eventos públicos ===")
            print("Status:", response.status_code)
            print("Response:", response.text)
            
            if response.status_code == 200:
                events = []
                results = response.json()
                
                for item in results:
                    if "document" in item:
                        doc = item["document"]
                        event_data = self._parse_firestore_document(doc)
                        # Solo agregar eventos activos
                        if event_data.get('status') == 'active':
                            events.append(event_data)
                
                print(f"=== DEBUG: Eventos públicos encontrados: {len(events)} ===")
                
                # Ordenar manualmente por fecha de creación
                events.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
                
                # Paginación manual
                start_index = (page - 1) * limit
                end_index = start_index + limit
                paginated_events = events[start_index:end_index]
                
                return {
                    "success": True, 
                    "events": paginated_events, 
                    "page": page, 
                    "total": len(events),
                    "hasMore": end_index < len(events)
                }
            else:
                return {"success": False, "error": f"Error {response.status_code}: {response.text}"}
                
        except Exception as e:
            print("=== DEBUG: Error en get_events ===")
            print(str(e))
            return {"success": False, "error": str(e)}
    
    def get_user_events(self, user_id, id_token):
        """Obtener eventos del usuario específico - Versión simplificada"""
        url = f"{self.firestore_url}:runQuery"
        headers = {"Authorization": f"Bearer {id_token}"}
        
        # Consulta SIMPLIFICADA sin orderBy complejo
        query = {
            "structuredQuery": {
                "from": [{"collectionId": "events"}],
                "where": {
                    "fieldFilter": {
                        "field": {"fieldPath": "creatorId"},
                        "op": "EQUAL",
                        "value": {"stringValue": user_id}
                    }
                }
                # Removemos orderBy temporalmente para evitar errores de índice
            }
        }
        
        print("=== DEBUG: Obteniendo eventos del usuario (consulta simplificada) ===")
        print("User ID:", user_id)
        
        try:
            response = requests.post(url, headers=headers, json=query, timeout=30)
            
            print("=== DEBUG: Respuesta eventos usuario ===")
            print("Status:", response.status_code)
            
            if response.status_code == 200:
                events = []
                results = response.json()
                
                for item in results:
                    if "document" in item:
                        doc = item["document"]
                        event_data = self._parse_firestore_document(doc)
                        # Solo agregar eventos activos
                        if event_data.get('status') == 'active':
                            events.append(event_data)
                
                # Ordenar manualmente en Python por fecha de creación
                events.sort(key=lambda x: x.get('createdAt', ''), reverse=True)
                
                print("=== DEBUG: Eventos encontrados ===")
                print("Número de eventos:", len(events))
                for event in events:
                    print(f"Evento: {event['title']} - Creador: {event['creatorId']} - Status: {event.get('status', 'unknown')}")
                
                return {"success": True, "events": events}
            else:
                print("Error:", response.text)
                return {"success": False, "error": response.text}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def update_event(self, event_id, event_data, id_token):
        """Actualizar evento - Solo el creador puede modificar"""
        url = f"{self.firestore_url}/events/{event_id}"
        headers = {
            "Authorization": f"Bearer {id_token}",
            "Content-Type": "application/json"
        }
        
        print("=== DEBUG: Actualizando evento ===")
        print("Event ID:", event_id)
        print("Datos a actualizar:", event_data)
        
        update_data = {"fields": {}}
        for key, value in event_data.items():
            if isinstance(value, str):
                update_data["fields"][key] = {"stringValue": value}
            elif isinstance(value, int):
                update_data["fields"][key] = {"integerValue": str(value)}
        
        update_data["fields"]["updatedAt"] = {"timestampValue": datetime.utcnow().isoformat() + "Z"}
        
        print("=== DEBUG: Datos de actualización ===")
        print(json.dumps(update_data, indent=2))
        
        try:
            response = requests.patch(url, headers=headers, json=update_data, timeout=30)
            
            print("=== DEBUG: Respuesta de actualización ===")
            print("Status:", response.status_code)
            print("Response:", response.text)
            
            if response.status_code == 200:
                return {"success": True, "message": "Evento actualizado correctamente"}
            else:
                return {
                    "success": False, 
                    "error": f"Error {response.status_code}: {response.text}",
                    "status": response.status_code
                }
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    def delete_event(self, event_id, id_token):
        """Eliminar evento - Solo el creador puede eliminar"""
        url = f"{self.firestore_url}/events/{event_id}"
        headers = {"Authorization": f"Bearer {id_token}"}
        
        try:
            response = requests.delete(url, headers=headers)
            return {"success": response.status_code == 200}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ===== CLOUDINARY =====
    def upload_image(self, image_file, event_id):
        """Subir imagen a Cloudinary"""
        try:
            result = cloudinary.uploader.upload(
                image_file,
                folder="eventosya",
                public_id=f"event-{event_id}-{int(datetime.utcnow().timestamp())}",
                overwrite=True,
                resource_type="image"
            )
            return {"success": True, "imageUrl": result['secure_url']}
        except Exception as e:
            return {"success": False, "error": str(e)}
    
    # ===== HELPERS =====
    def _parse_firestore_document(self, doc):
        """Parsear documento de Firestore a diccionario Python"""
        fields = doc.get("fields", {})
        
        event_data = {
            "id": doc["name"].split("/")[-1],
            "title": fields.get("title", {}).get("stringValue", "Sin título"),
            "description": fields.get("description", {}).get("stringValue", "Sin descripción"),
            "location": fields.get("location", {}).get("stringValue", "Ubicación no especificada"),
            "date": fields.get("date", {}).get("stringValue", ""),
            "time": fields.get("time", {}).get("stringValue", ""),
            "organizer": fields.get("organizer", {}).get("stringValue", "Organizador no especificado"),
            "creatorId": fields.get("creatorId", {}).get("stringValue", ""),
            "creatorEmail": fields.get("creatorEmail", {}).get("stringValue", ""),
            "imageUrl": fields.get("imageUrl", {}).get("stringValue", ""),
            "price": fields.get("price", {}).get("stringValue", "Gratis"),
            "category": fields.get("category", {}).get("stringValue", "General"),
            "maxAttendees": int(fields.get("maxAttendees", {}).get("integerValue", 100)),
            "status": fields.get("status", {}).get("stringValue", "active"),
            "createdAt": fields.get("createdAt", {}).get("timestampValue", "")
        }
        
        return event_data

# Instancia global
firebase_manager = FirebaseManager()