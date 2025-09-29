// Módulo de autenticación
class AuthManager {
    constructor() {
        this.API_BASE = '';
        this.init();
    }

    init() {
        this.setupLoginForm();
        this.setupRegisterForm();
    }

    setupLoginForm() {
        const loginForm = document.getElementById('loginForm');
        if (loginForm) {
            loginForm.addEventListener('submit', (e) => this.handleLogin(e));
        }
    }

    setupRegisterForm() {
        const registerForm = document.getElementById('registerForm');
        if (registerForm) {
            registerForm.addEventListener('submit', (e) => this.handleRegister(e));
        }
    }

    async handleLogin(e) {
        e.preventDefault();
        
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();

        if (!this.validateRequiredFields({ email, password })) {
            Utils.showAlert('error', 'Error', 'Por favor completa todos los campos');
            return;
        }

        try {
            this.setButtonLoading(button, true);
            
            const response = await fetch(`${this.API_BASE}/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password })
            });

            const result = await response.json();

            if (result.success) {
                await Utils.showAlert('success', 'Éxito', result.message);
                setTimeout(() => {
                    window.location.href = '/dashboard';
                }, 1500);
            } else {
                await Utils.showAlert('error', 'Error', result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            await Utils.showAlert('error', 'Error', 'Error de conexión. Intenta nuevamente.');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    async handleRegister(e) {
        e.preventDefault();
        
        const form = e.target;
        const button = form.querySelector('button[type="submit"]');
        const email = document.getElementById('email').value.trim();
        const password = document.getElementById('password').value.trim();
        const confirmPassword = document.getElementById('confirm_password').value.trim();

        if (!this.validateRequiredFields({ email, password, confirmPassword })) {
            await Utils.showAlert('error', 'Error', 'Por favor completa todos los campos');
            return;
        }

        if (!this.validatePassword(password, confirmPassword)) {
            return;
        }

        try {
            this.setButtonLoading(button, true);
            
            const response = await fetch(`${this.API_BASE}/register`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    email, 
                    password, 
                    confirm_password: confirmPassword 
                })
            });

            const result = await response.json();

            if (result.success) {
                await Utils.showAlert('success', 'Éxito', result.message);
                setTimeout(() => {
                    window.location.href = '/login';
                }, 2000);
            } else {
                await Utils.showAlert('error', 'Error', result.message);
            }
        } catch (error) {
            console.error('Error:', error);
            await Utils.showAlert('error', 'Error', 'Error de conexión. Intenta nuevamente.');
        } finally {
            this.setButtonLoading(button, false);
        }
    }

    validateRequiredFields(fields) {
        return Object.values(fields).every(value => value.trim() !== '');
    }

    validatePassword(password, confirmPassword) {
        if (password !== confirmPassword) {
            Utils.showAlert('error', 'Error', 'Las contraseñas no coinciden');
            return false;
        }

        if (password.length < 6) {
            Utils.showAlert('error', 'Error', 'La contraseña debe tener al menos 6 caracteres');
            return false;
        }

        return true;
    }

    setButtonLoading(button, isLoading) {
        if (isLoading) {
            button.disabled = true;
            button.innerHTML = '<i class="fa-solid fa-spinner fa-spin mr-2"></i> Procesando...';
            button.classList.add('opacity-50');
        } else {
            button.disabled = false;
            this.resetButtonText(button);
            button.classList.remove('opacity-50');
        }
    }

    resetButtonText(button) {
        if (button.closest('#loginForm')) {
            button.innerHTML = 'Iniciar Sesión';
        } else if (button.closest('#registerForm')) {
            button.innerHTML = 'Registrarse';
        }
    }
}

// Instancia global
const authManager = new AuthManager();