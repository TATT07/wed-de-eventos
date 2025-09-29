// Configuración común
const API_BASE = '';

// Utilidades
function showMessage(message, type = 'error') {
    // Remover mensajes existentes
    const existingMessages = document.querySelectorAll('.flash-message');
    existingMessages.forEach(msg => msg.remove());

    const messageDiv = document.createElement('div');
    messageDiv.className = `flash-message fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg ${
        type === 'success' ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
    }`;
    messageDiv.textContent = message;
    
    document.body.appendChild(messageDiv);
    
    // Auto-remover después de 5 segundos
    setTimeout(() => {
        messageDiv.style.transition = 'opacity 0.5s';
        messageDiv.style.opacity = '0';
        setTimeout(() => messageDiv.remove(), 500);
    }, 5000);
}

function setLoading(button, isLoading) {
    if (isLoading) {
        button.disabled = true;
        button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...';
        button.classList.add('opacity-50');
    } else {
        button.disabled = false;
        if (button.id === 'loginButton' || button.type === 'submit' && button.closest('#loginForm')) {
            button.innerHTML = 'Iniciar Sesión';
        } else if (button.id === 'registerButton' || button.type === 'submit' && button.closest('#registerForm')) {
            button.innerHTML = 'Registrarse';
        }
        button.classList.remove('opacity-50');
    }
}

// Login
if (document.getElementById('loginForm')) {
    document.getElementById('loginForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const button = this.querySelector('button[type="submit"]');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!email || !password) {
            showMessage('Por favor completa todos los campos');
            return;
        }

        setLoading(button, true);

        try {
            const response = await fetch(`${API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                showMessage(result.message, 'success');
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                showMessage(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(button, false);
        }
    });
}

// Register
if (document.getElementById('registerForm')) {
    document.getElementById('registerForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const button = this.querySelector('button[type="submit"]');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm_password').value.trim();

        if (!email || !password || !confirmPassword) {
            showMessage('Por favor completa todos los campos');
            return;
        }

        if (password !== confirmPassword) {
            showMessage('Las contraseñas no coinciden');
            return;
        }

        if (password.length < 6) {
            showMessage('La contraseña debe tener al menos 6 caracteres');
            return;
        }

        setLoading(button, true);

        try {
            const response = await fetch(`${API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password, confirm_password: confirmPassword })
            });

            const result = await response.json();

            if (result.success) {
                showMessage(result.message, 'success');
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                showMessage(result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            showMessage('Error de conexión. Intenta nuevamente.');
        } finally {
            setLoading(button, false);
        }
    });
}