// Gestión de autenticación y formularios de login/registro

document.addEventListener('DOMContentLoaded', function() {
    // Elementos del DOM
    const authScreen = document.getElementById('authScreen');
    const mainApp = document.getElementById('mainApp');
    const loginForm = document.getElementById('loginForm');
    const registerForm = document.getElementById('registerForm');
    const resetPasswordForm = document.getElementById('resetPasswordForm');

    // Botones de navegación entre formularios
    const showRegisterBtn = document.getElementById('showRegister');
    const showLoginBtn = document.getElementById('showLogin');
    const showResetPasswordBtn = document.getElementById('showResetPassword');
    const backToLoginBtn = document.getElementById('backToLogin');

    // Verificar si hay una sesión activa
    checkAuthState();

    // Event listeners para navegación entre formularios
    if (showRegisterBtn) {
        showRegisterBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('register');
        });
    }

    if (showLoginBtn) {
        showLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('login');
        });
    }

    if (showResetPasswordBtn) {
        showResetPasswordBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('reset');
        });
    }

    if (backToLoginBtn) {
        backToLoginBtn.addEventListener('click', (e) => {
            e.preventDefault();
            showForm('login');
        });
    }

    // Formulario de login
    const loginFormElement = document.getElementById('loginFormElement');
    if (loginFormElement) {
        loginFormElement.addEventListener('submit', handleLogin);
    }

    // Formulario de registro
    const registerFormElement = document.getElementById('registerFormElement');
    if (registerFormElement) {
        registerFormElement.addEventListener('submit', handleRegister);
    }

    // Formulario de reset password
    const resetPasswordFormElement = document.getElementById('resetPasswordFormElement');
    if (resetPasswordFormElement) {
        resetPasswordFormElement.addEventListener('submit', handleResetPassword);
    }

    // Verificar parámetros de URL para auto-abrir registro
    const urlParams = new URLSearchParams(window.location.search);
    if (urlParams.get('action') === 'trial') {
        showForm('register');
    }

    // Funciones
    function showForm(formType) {
        loginForm.style.display = 'none';
        registerForm.style.display = 'none';
        resetPasswordForm.style.display = 'none';

        switch(formType) {
            case 'login':
                loginForm.style.display = 'block';
                break;
            case 'register':
                registerForm.style.display = 'block';
                break;
            case 'reset':
                resetPasswordForm.style.display = 'block';
                break;
        }
    }

    async function handleLogin(e) {
        e.preventDefault();
        
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            showToast(MENSAJES.error.campos_vacios, 'error');
            return;
        }

        showLoading(true);

        // Esperar a que Supabase esté inicializado
        await waitForSupabase();

        const result = await Auth.login(email, password);

        showLoading(false);

        if (result.success) {
            showToast('Inicio de sesión exitoso', 'success');
            window.location.reload();
        } else {
            showToast('Credenciales incorrectas', 'error');
        }
    }

    async function handleRegister(e) {
        e.preventDefault();

        const nombre = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const matricula = document.getElementById('registerMatricula').value;

        if (!nombre || !email || !password) {
            showToast(MENSAJES.error.campos_vacios, 'error');
            return;
        }

        if (password.length < 6) {
            showToast('La contraseña debe tener al menos 6 caracteres', 'error');
            return;
        }

        showLoading(true);

        // Esperar a que Supabase esté inicializado
        await waitForSupabase();

        const result = await Auth.register(email, password, nombre, matricula);

        showLoading(false);

        if (result.success) {
            showToast('Registro exitoso. Por favor verifica tu correo electrónico.', 'success');
            setTimeout(() => {
                showForm('login');
            }, 2000);
        } else {
            showToast('Error en el registro: ' + result.error, 'error');
        }
    }

    async function handleResetPassword(e) {
        e.preventDefault();

        const email = document.getElementById('resetEmail').value;

        if (!email) {
            showToast('Por favor ingresa tu correo electrónico', 'error');
            return;
        }

        showLoading(true);

        await waitForSupabase();

        const result = await Auth.resetPassword(email);

        showLoading(false);

        if (result.success) {
            showToast('Se han enviado las instrucciones a tu correo', 'success');
            setTimeout(() => {
                showForm('login');
            }, 2000);
        } else {
            showToast('Error al enviar instrucciones', 'error');
        }
    }

    async function checkAuthState() {
        await waitForSupabase();

        const session = await Auth.checkSession();

        if (session) {
            // Usuario autenticado
            authScreen.style.display = 'none';
            mainApp.style.display = 'flex';
            
            // Inicializar la aplicación
            if (typeof initApp === 'function') {
                initApp(session.user);
            }
        } else {
            // Usuario no autenticado
            authScreen.style.display = 'flex';
            mainApp.style.display = 'none';
        }
    }

    async function waitForSupabase() {
        // Esperar hasta que Supabase esté inicializado
        let attempts = 0;
        while (!supabaseClient && attempts < 50) {
            await new Promise(resolve => setTimeout(resolve, 100));
            attempts++;
        }
        
        if (!supabaseClient) {
            showToast('Error de conexión. Recarga la página.', 'error');
            throw new Error('Supabase no inicializado');
        }
    }
});

// Funciones de UI
function showLoading(show) {
    const spinner = document.getElementById('loadingSpinner');
    if (spinner) {
        spinner.style.display = show ? 'block' : 'none';
    }
}

function showToast(message, type = 'info') {
    const container = document.getElementById('toastContainer');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;

    container.appendChild(toast);

    setTimeout(() => {
        toast.style.opacity = '0';
        setTimeout(() => {
            container.removeChild(toast);
        }, 300);
    }, 3000);
}
