def translate_error_message(error):
    """Traducir mensajes de error de Firebase a español"""
    error_translations = {
        'INVALID_LOGIN_CREDENTIALS': 'Credenciales inválidas',
        'TOO_MANY_ATTEMPTS_TRY_LATER': 'Demasiados intentos. Intenta más tarde',
        'EMAIL_NOT_FOUND': 'Email no registrado',
        'INVALID_PASSWORD': 'Contraseña incorrecta',
        'EMAIL_EXISTS': 'El email ya está registrado',
        'WEAK_PASSWORD': 'La contraseña es demasiado débil. Debe tener al menos 6 caracteres',
        'INVALID_EMAIL': 'Email inválido',
        'MISSING_PASSWORD': 'La contraseña es requerida',
        'MISSING_EMAIL': 'El email es requerido',
        'USER_DISABLED': 'Esta cuenta ha sido deshabilitada'
    }
    
    for key, translation in error_translations.items():
        if key in error:
            return translation
    
    return error