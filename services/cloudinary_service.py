import cloudinary.uploader
from datetime import datetime
from typing import Dict, Any

class CloudinaryService:
    def upload_image(self, image_file, event_id: str) -> Dict[str, Any]:
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