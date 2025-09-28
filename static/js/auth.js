// Función para mostrar alertas con SweetAlert
function showAlert(icon, title, text, confirmButtonText = 'Aceptar') {
    return Swal.fire({
        icon: icon,
        title: title,
        text: text,
        confirmButtonText: confirmButtonText,
        confirmButtonColor: '#3B82F6'
    });
}

// Función para validar email
function isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

// Manejo del formulario de registro
document.addEventListener('DOMContentLoaded', function() {
    const registerForm = document.getElementById('registerForm');
    const loginForm = document.getElementById('loginForm');
    
    if (registerForm) {
        registerForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            const confirmPassword = document.getElementById('confirm_password').value;
            
            // Validaciones del cliente
            if (!isValidEmail(email)) {
                await showAlert('error', 'Error', 'Por favor ingresa un email válido');
                return;
            }
            
            if (password.length < 6) {
                await showAlert('error', 'Error', 'La contraseña debe tener al menos 6 caracteres');
                return;
            }
            
            if (password !== confirmPassword) {
                await showAlert('error', 'Error', 'Las contraseñas no coinciden');
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Registrando...';
            
            try {
                const response = await fetch('/register', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password,
                        confirm_password: confirmPassword
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    await showAlert('success', '¡Éxito!', data.message);
                    window.location.href = '/login';
                } else {
                    await showAlert('error', 'Error', data.message);
                }
            } catch (error) {
                await showAlert('error', 'Error', 'Error de conexión. Intenta nuevamente.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
    
    if (loginForm) {
        loginForm.addEventListener('submit', async function(e) {
            e.preventDefault();
            
            const email = document.getElementById('email').value.trim();
            const password = document.getElementById('password').value;
            
            // Validaciones del cliente
            if (!isValidEmail(email)) {
                await showAlert('error', 'Error', 'Por favor ingresa un email válido');
                return;
            }
            
            const submitBtn = document.getElementById('submitBtn');
            const originalText = submitBtn.innerHTML;
            
            submitBtn.disabled = true;
            submitBtn.innerHTML = 'Iniciando sesión...';
            
            try {
                const response = await fetch('/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        email: email,
                        password: password
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    await showAlert('success', '¡Bienvenido!', data.message);
                    window.location.href = '/dashboard';
                } else {
                    await showAlert('error', 'Error', data.message);
                }
            } catch (error) {
                await showAlert('error', 'Error', 'Error de conexión. Intenta nuevamente.');
            } finally {
                submitBtn.disabled = false;
                submitBtn.innerHTML = originalText;
            }
        });
    }
});