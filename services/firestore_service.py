import json
import requests
from typing import Dict, Any, List, Optional
from datetime import datetime
from config.firebase_config import firebase_config

class FirestoreService:
    def __init__(self):
        self.config = firebase_config

    def _make_firestore_request(self, method: str, url: str, id_token: str = None, 
                              data: Dict[str, Any] = None, timeout: int = 30) -> requests.Response:
        """Realizar petición a Firestore"""
        headers = {"Content-Type": "application/json"}
        if id_token:
            headers["Authorization"] = f"Bearer {id_token}"

        return requests.request(method, url, headers=headers, json=data, timeout=timeout)

    def create_event_dict(self, event_data: Dict[str, Any], id_token: str) -> Dict[str, Any]:
        """Crear nuevo evento desde diccionario"""
        url = f"{self.config.firestore_url}/events"
        
        # Convertir diccionario a formato Firestore
        firestore_data = self._dict_to_firestore_format(event_data)
        
        print("=== DEBUG: Creando evento en Firestore ===")
        print("URL:", url)
        print("Datos a guardar:", json.dumps(firestore_data, indent=2))
        print("User ID:", event_data.get('creatorId'))
        
        try:
            response = self._make_firestore_request("POST", url, id_token, firestore_data)
            
            print("=== DEBUG: Respuesta de Firestore ===")
            print("Status Code:", response.status_code)
            print("Response:", response.text)
            
            if response.status_code == 200:
                result = response.json()
                event_id = result["name"].split("/")[-1]
                print("✅ Evento creado exitosamente. ID:", event_id)
                return {"success": True, "eventId": event_id, "data": result}
            else:
                error_msg = f"Error {response.status_code}: {response.text}"
                print("❌ Error creando evento:", error_msg)
                return {"success": False, "error": error_msg}
                
        except Exception as e:
            error_msg = f"Excepción: {str(e)}"
            print("❌ Excepción creando evento:", error_msg)
            import traceback
            print("Traceback:", traceback.format_exc())
            return {"success": False, "error": error_msg}

    def _dict_to_firestore_format(self, data: Dict[str, Any]) -> Dict[str, Any]:
        """Convertir diccionario a formato Firestore"""
        fields = {}
        
        for key, value in data.items():
            if isinstance(value, str):
                fields[key] = {"stringValue": value}
            elif isinstance(value, int):
                fields[key] = {"integerValue": str(value)}
            elif isinstance(value, bool):
                fields[key] = {"booleanValue": value}
            elif value is None:
                fields[key] = {"nullValue": None}
        
        # Añadir timestamp de creación
        fields["createdAt"] = {"timestampValue": datetime.utcnow().isoformat() + "Z"}
        
        return {"fields": fields}

    def _firestore_to_dict(self, document: Dict[str, Any]) -> Dict[str, Any]:
        """Convertir documento Firestore a diccionario"""
        fields = document.get("fields", {})
        result = {}
        
        for key, field_data in fields.items():
            if "stringValue" in field_data:
                result[key] = field_data["stringValue"]
            elif "integerValue" in field_data:
                result[key] = int(field_data["integerValue"])
            elif "booleanValue" in field_data:
                result[key] = field_data["booleanValue"]
            elif "doubleValue" in field_data:
                result[key] = float(field_data["doubleValue"])
        
        # Añadir ID del documento
        doc_name = document.get("name", "")
        result["id"] = doc_name.split("/")[-1] if "/" in doc_name else ""
        
        return result

    def get_events(self, page: int = 1, limit: int = 10, 
                  category: Optional[str] = None, search: Optional[str] = None) -> Dict[str, Any]:
        """Obtener eventos públicos"""
        url = f"{self.config.firestore_url}:runQuery"
        
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
                "orderBy": [{"field": {"fieldPath": "createdAt"}, "direction": "DESCENDING"}],
                "limit": limit
            }
        }
        
        try:
            response = self._make_firestore_request("POST", url, data=query)
            
            if response.status_code == 200:
                events = []
                results = response.json()
                
                for item in results:
                    if "document" in item:
                        event_dict = self._firestore_to_dict(item["document"])
                        events.append(event_dict)
                
                print(f"=== DEBUG: Encontrados {len(events)} eventos públicos ===")
                return {"success": True, "events": events, "page": page}
            else:
                return {"success": False, "error": f"Error {response.status_code}: {response.text}"}
                
        except Exception as e:
            return {"success": False, "error": str(e)}

    def get_user_events(self, user_id: str, id_token: str) -> Dict[str, Any]:
        """Obtener eventos del usuario"""
        url = f"{self.config.firestore_url}:runQuery"
        
        query = {
            "structuredQuery": {
                "from": [{"collectionId": "events"}],
                "where": {
                    "fieldFilter": {
                        "field": {"fieldPath": "creatorId"},
                        "op": "EQUAL",
                        "value": {"stringValue": user_id}
                    }
                },
                "orderBy": [{"field": {"fieldPath": "createdAt"}, "direction": "DESCENDING"}]
            }
        }
        
        print("=== DEBUG: Obteniendo eventos del usuario ===")
        print("User ID:", user_id)
        print("Query:", json.dumps(query, indent=2))
        
        try:
            response = self._make_firestore_request("POST", url, id_token, query)
            
            print("=== DEBUG: Respuesta eventos usuario ===")
            print("Status:", response.status_code)
            print("Response completa:", response.text)
            
            if response.status_code == 200:
                events = []
                results = response.json()
                
                print("=== DEBUG: Analizando resultados ===")
                print("Número de elementos en results:", len(results))
                
                for i, item in enumerate(results):
                    print(f"=== DEBUG: Item {i} ===")
                    print("Contenido del item:", json.dumps(item, indent=2))
                    
                    if "document" in item:
                        print("✅ Documento encontrado en item", i)
                        event_dict = self._firestore_to_dict(item["document"])
                        events.append(event_dict)
                    else:
                        print("❌ No hay documento en item", i)
                        print("Keys del item:", list(item.keys()) if item else "Item vacío")
                
                print("=== DEBUG: Eventos encontrados ===")
                print("Número de eventos:", len(events))
                for event in events:
                    print(f"Evento: {event.get('title')} - Creador: {event.get('creatorId')}")
                
                return {"success": True, "events": events}
            else:
                error_msg = f"Error {response.status_code}: {response.text}"
                print("=== DEBUG: Error en get_user_events ===")
                print(error_msg)
                return {"success": False, "error": error_msg}
        except Exception as e:
            error_msg = f"Excepción: {str(e)}"
            print("=== DEBUG: Excepción en get_user_events ===")
            print(error_msg)
            import traceback
            print("Traceback:", traceback.format_exc())
            return {"success": False, "error": error_msg}

    def update_event(self, event_id: str, event_data: Dict[str, Any], id_token: str) -> Dict[str, Any]:
        """Actualizar evento existente"""
        url = f"{self.config.firestore_url}/events/{event_id}"
        
        update_data = {"fields": {}}
        for key, value in event_data.items():
            if isinstance(value, str):
                update_data["fields"][key] = {"stringValue": value}
            elif isinstance(value, int):
                update_data["fields"][key] = {"integerValue": str(value)}
        
        update_data["fields"]["updatedAt"] = {"timestampValue": datetime.utcnow().isoformat() + "Z"}
        
        try:
            response = self._make_firestore_request("PATCH", url, id_token, update_data)
            return {"success": response.status_code == 200, "status": response.status_code}
        except Exception as e:
            return {"success": False, "error": str(e)}

    def delete_event(self, event_id: str, id_token: str) -> Dict[str, Any]:
        """Eliminar evento"""
        url = f"{self.config.firestore_url}/events/{event_id}"
        
        try:
            response = self._make_firestore_request("DELETE", url, id_token)
            return {"success": response.status_code == 200}
        except Exception as e:
            return {"success": False, "error": str(e)}