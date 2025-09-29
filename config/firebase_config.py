import cloudinary

class FirebaseConfig:
    def __init__(self):
        self.api_key = "AIzaSyAcjMB3_MzXxH52SshiY0Bcb4Gt8WbdmJo"
        self.project_id = "gestordeeventos-d7107"
        self.auth_url = "https://identitytoolkit.googleapis.com/v1/accounts"
        self.firestore_url = f"https://firestore.googleapis.com/v1/projects/{self.project_id}/databases/(default)/documents"

    def setup_cloudinary(self):
        """Configurar Cloudinary"""
        cloudinary.config(
            cloud_name="ddmeyq4fr",
            api_key="525393814454343",
            api_secret="SkQRmFUxYgsPs8_Euht6m9CO1GQ",
            secure=True
        )

# Instancia global de configuración
firebase_config = FirebaseConfig()
firebase_config.setup_cloudinary()