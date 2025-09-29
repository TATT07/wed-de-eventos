from datetime import datetime
from typing import Dict, Any

class Event:
    def __init__(self, event_data: Dict[str, Any] = None):
        self.id = event_data.get('id', '') if event_data else ''
        self.title = event_data.get('title', '')
        self.description = event_data.get('description', '')
        self.location = event_data.get('location', '')
        self.date = event_data.get('date', '')
        self.time = event_data.get('time', '')
        self.organizer = event_data.get('organizer', '')
        self.creator_id = event_data.get('creatorId', '')
        self.creator_email = event_data.get('creatorEmail', '')
        self.image_url = event_data.get('imageUrl', '')
        self.price = event_data.get('price', 'Gratis')
        self.category = event_data.get('category', 'General')
        self.max_attendees = event_data.get('maxAttendees', 100)
        self.status = event_data.get('status', 'active')
        self.created_at = event_data.get('createdAt', '')

    def to_firestore_format(self) -> Dict[str, Any]:
        """Convertir a formato Firestore"""
        return {
            "fields": {
                "title": {"stringValue": self.title},
                "description": {"stringValue": self.description},
                "location": {"stringValue": self.location},
                "date": {"stringValue": self.date},
                "time": {"stringValue": self.time},
                "organizer": {"stringValue": self.organizer},
                "creatorId": {"stringValue": self.creator_id},
                "creatorEmail": {"stringValue": self.creator_email},
                "imageUrl": {"stringValue": self.image_url},
                "price": {"stringValue": self.price},
                "category": {"stringValue": self.category},
                "maxAttendees": {"integerValue": str(self.max_attendees)},
                "status": {"stringValue": self.status},
                "createdAt": {"timestampValue": datetime.utcnow().isoformat() + "Z"}
            }
        }

    @classmethod
    def from_firestore_document(cls, doc: Dict[str, Any]) -> 'Event':
        """Crear Event desde documento Firestore"""
        fields = doc.get("fields", {})
        
        # EXTRAER ID CORRECTAMENTE
        doc_name = doc.get("name", "")
        event_id = doc_name.split("/")[-1] if "/" in doc_name else ""
        
        event_data = {
            "id": event_id,
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
        
        print(f"=== DEBUG: Evento parseado - ID: {event_id}, Título: {event_data['title']} ===")
        
        return cls(event_data)