// Script principal de la aplicación
// Esta es una versión base - deberás expandirla según tus necesidades

let currentUser = null;
let userProfile = null;

// Inicializar la aplicación
async function initApp(user) {
    currentUser = user;
    
    // Cargar perfil de usuario
    userProfile = await Profile.get(user.id);
    
    if (!userProfile) {
        console.error('Error cargando perfil');
        return;
    }

    // Actualizar UI con datos del usuario
    updateUserInfo();
    
    // Verificar trial y mostrar banner si aplica
    await checkTrialStatus();
    
    // Cargar estadísticas del dashboard
    await loadDashboardStats();
    
    // Configurar navegación
    setupNavigation();
    
    // Configurar event listeners
    setupEventListeners();
    
    // Configurar gestión de expedientes y clientes
    setupExpedientesClientes();
    setupSeccionesCargar();
}

// Actualizar información del usuario en la UI
function updateUserInfo() {
    const userName = document.getElementById('userName');
    const userInitials = document.getElementById('userInitials');
    const userPlan = document.getElementById('userPlan');

    if (userName) userName.textContent = userProfile.nombre;
    if (userPlan) {
        userPlan.textContent = userProfile.suscripto ? 'Plan Profesional' : 'Prueba gratuita';
    }
    
    if (userInitials && userProfile.nombre) {
        const initials = userProfile.nombre
            .split(' ')
            .map(n => n[0])
            .join('')
            .toUpperCase()
            .substring(0, 2);
        userInitials.textContent = initials;
    }
}

// Verificar estado de trial
async function checkTrialStatus() {
    const trialBanner = document.getElementById('trialBanner');
    const daysLeftSpan = document.getElementById('daysLeft');
    
    if (!trialBanner || !daysLeftSpan) return;

    if (userProfile.suscripto) {
        trialBanner.style.display = 'none';
        return;
    }

    const daysLeft = await Profile.getDaysLeft(currentUser.id);
    
    if (daysLeft <= 0) {
        // Trial vencido - mostrar modal de suscripción
        showSubscriptionModal();
        // Bloquear funcionalidades
        blockFeatures();
    } else {
        trialBanner.style.display = 'flex';
        daysLeftSpan.textContent = `${daysLeft} día${daysLeft !== 1 ? 's' : ''}`;
    }
}

// Cargar estadísticas del dashboard
async function loadDashboardStats() {
    if (!currentUser) return;

    // Cargar expedientes
    const expedientes = await Expedientes.getAll(currentUser.id);
    const statExpedientes = document.getElementById('statExpedientes');
    if (statExpedientes) {
        statExpedientes.textContent = expedientes.length;
    }

    // Cargar clientes
    const clientes = await Clientes.getAll(currentUser.id);
    const statClientes = document.getElementById('statClientes');
    if (statClientes) {
        statClientes.textContent = clientes.length;
    }

    // Cargar audiencias próximas
    const audiencias = await Audiencias.getUpcoming(currentUser.id, 5);
    const statAudiencias = document.getElementById('statAudiencias');
    if (statAudiencias) {
        statAudiencias.textContent = audiencias.length;
    }

    // Por ahora, el stat de escritos es estático
    // Podrías agregar una tabla de documentos para trackear esto
}

// Configurar navegación entre secciones
function setupNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    const sections = document.querySelectorAll('.content-section');

    navItems.forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            
            const targetSection = item.getAttribute('data-section');
            
            // Remover clase active de todos
            navItems.forEach(nav => nav.classList.remove('active'));
            sections.forEach(section => section.classList.remove('active'));
            
            // Agregar clase active al seleccionado
            item.classList.add('active');
            const targetElement = document.getElementById(targetSection + 'Section');
            if (targetElement) {
                targetElement.classList.add('active');
            }
        });
    });

    // También configurar botones de acción rápida
    const actionCards = document.querySelectorAll('.action-card');
    actionCards.forEach(card => {
        card.addEventListener('click', () => {
            const targetSection = card.getAttribute('data-section');
            if (targetSection) {
                const navItem = document.querySelector(`.nav-item[data-section="${targetSection}"]`);
                if (navItem) {
                    navItem.click();
                }
            }
        });
    });
}

// Configurar event listeners generales
function setupEventListeners() {
    // Botón de logout
    const btnLogout = document.getElementById('btnLogout');
    if (btnLogout) {
        btnLogout.addEventListener('click', handleLogout);
    }

    // Botón de suscripción
    const btnSubscribe = document.getElementById('btnSubscribe');
    if (btnSubscribe) {
        btnSubscribe.addEventListener('click', showSubscriptionModal);
    }

    // Modal de suscripción
    const btnProcesarPago = document.getElementById('btnProcesarPago');
    if (btnProcesarPago) {
        btnProcesarPago.addEventListener('click', handlePagoMercadoPago);
    }

    // Cerrar modales
    const modalOverlay = document.getElementById('modalOverlay');
    const modalCloses = document.querySelectorAll('.modal-close');
    
    if (modalOverlay) {
        modalOverlay.addEventListener('click', closeAllModals);
    }
    
    modalCloses.forEach(btn => {
        btn.addEventListener('click', closeAllModals);
    });

    // Tabs de calculadora
    const calcTabs = document.querySelectorAll('.calc-tab');
    const calcForms = document.querySelectorAll('.calculator-form');
    
    calcTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const calcType = tab.getAttribute('data-calc');
            
            calcTabs.forEach(t => t.classList.remove('active'));
            calcForms.forEach(f => f.classList.remove('active'));
            
            tab.classList.add('active');
            const targetForm = document.getElementById(`calc${calcType.charAt(0).toUpperCase() + calcType.slice(1)}`);
            if (targetForm) {
                targetForm.classList.add('active');
            }
        });
    });

    // Botones de calculadoras
    setupCalculators();

    // Upload de PDFs
    setupPDFUpload();
}

// Configurar calculadoras
function setupCalculators() {
    // Calculadora de indemnización
    const btnCalcularIndemnizacion = document.getElementById('btnCalcularIndemnizacion');
    if (btnCalcularIndemnizacion) {
        btnCalcularIndemnizacion.addEventListener('click', calcularIndemnizacion);
    }

    // Calculadora de alimentos
    const btnCalcularAlimentos = document.getElementById('btnCalcularAlimentos');
    if (btnCalcularAlimentos) {
        btnCalcularAlimentos.addEventListener('click', calcularAlimentos);
    }

    // Calculadora de accidente
    const btnCalcularAccidente = document.getElementById('btnCalcularAccidente');
    if (btnCalcularAccidente) {
        btnCalcularAccidente.addEventListener('click', calcularAccidente);
    }
}

// Calculadora de indemnización por despido
function calcularIndemnizacion() {
    const fechaIngreso = new Date(document.getElementById('fechaIngreso').value);
    const fechaEgreso = new Date(document.getElementById('fechaEgreso').value);
    const remuneracion = parseFloat(document.getElementById('remuneracion').value);
    const tipoDespido = document.getElementById('tipoDespido').value;

    if (!fechaIngreso || !fechaEgreso || !remuneracion) {
        showToast(MENSAJES.error.campos_vacios, 'error');
        return;
    }

    // Calcular antigüedad en años
    const diffTime = Math.abs(fechaEgreso - fechaIngreso);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const antiguedadAnios = diffDays / 365;

    // Indemnización según LCT Art. 245
    let indemnizacion = remuneracion * antiguedadAnios;

    // Si es despido sin causa, puede haber incrementos
    if (tipoDespido === 'sin_causa') {
        // Agregar preaviso (1 mes)
        indemnizacion += remuneracion;
        
        // Integración mes de despido (proporcional)
        indemnizacion += remuneracion / 2;
    }

    const resultDiv = document.getElementById('resultIndemnizacion');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h3>Resultado del Cálculo</h3>
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); margin: 16px 0;">
                <p><strong>Antigüedad:</strong> ${antiguedadAnios.toFixed(2)} años</p>
                <p><strong>Indemnización por antigüedad:</strong> $${(remuneracion * antiguedadAnios).toFixed(2)}</p>
                ${tipoDespido === 'sin_causa' ? `
                    <p><strong>Preaviso:</strong> $${remuneracion.toFixed(2)}</p>
                    <p><strong>Integración mes despido:</strong> $${(remuneracion / 2).toFixed(2)}</p>
                ` : ''}
                <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border);">
                <p style="font-size: 20px;"><strong>Total aproximado:</strong> <span style="color: var(--primary);">$${indemnizacion.toFixed(2)}</span></p>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px;">
                ${DISCLAIMER_LEGAL}
            </p>
        `;
    }
}

// Calculadora de cuota alimentaria
function calcularAlimentos() {
    const ingresosAlimentante = parseFloat(document.getElementById('ingresosAlimentante').value);
    const cantidadHijos = parseInt(document.getElementById('cantidadHijos').value);
    const gastosHijo = parseFloat(document.getElementById('gastosHijo').value);

    if (!ingresosAlimentante || !cantidadHijos || !gastosHijo) {
        showToast(MENSAJES.error.campos_vacios, 'error');
        return;
    }

    // Porcentajes sugeridos según cantidad de hijos
    let porcentaje = 0.20; // 1 hijo
    if (cantidadHijos === 2) porcentaje = 0.30;
    if (cantidadHijos >= 3) porcentaje = 0.40;

    const cuotaSugerida = ingresosAlimentante * porcentaje;

    const resultDiv = document.getElementById('resultAlimentos');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h3>Resultado del Cálculo</h3>
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); margin: 16px 0;">
                <p><strong>Ingresos del alimentante:</strong> $${ingresosAlimentante.toFixed(2)}</p>
                <p><strong>Cantidad de hijos:</strong> ${cantidadHijos}</p>
                <p><strong>Gastos estimados por hijo:</strong> $${gastosHijo.toFixed(2)}</p>
                <p><strong>Porcentaje sugerido:</strong> ${(porcentaje * 100)}%</p>
                <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border);">
                <p style="font-size: 20px;"><strong>Cuota sugerida:</strong> <span style="color: var(--primary);">$${cuotaSugerida.toFixed(2)}</span></p>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px;">
                Base legal: CCyCN Art. 658-676. Esta es una estimación orientativa. La cuota definitiva será fijada por el juez considerando las necesidades del menor y la capacidad económica del alimentante.
            </p>
        `;
    }
}

// Calculadora de accidente laboral
function calcularAccidente() {
    const ingresoBase = parseFloat(document.getElementById('ingresoBase').value);
    const incapacidad = parseFloat(document.getElementById('incapacidad').value);
    const edadTrabajador = parseInt(document.getElementById('edadTrabajador').value);

    if (!ingresoBase || !incapacidad || !edadTrabajador) {
        showToast(MENSAJES.error.campos_vacios, 'error');
        return;
    }

    // Coeficiente según edad (simplificado)
    let coeficienteEdad = 1.0;
    if (edadTrabajador < 40) coeficienteEdad = 1.1;
    if (edadTrabajador < 30) coeficienteEdad = 1.2;

    // Fórmula LRT: 53 x IBL x % incapacidad x coeficiente
    const indemnizacion = 53 * ingresoBase * (incapacidad / 100) * coeficienteEdad;

    const resultDiv = document.getElementById('resultAccidente');
    if (resultDiv) {
        resultDiv.style.display = 'block';
        resultDiv.innerHTML = `
            <h3>Resultado del Cálculo</h3>
            <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); margin: 16px 0;">
                <p><strong>Ingreso Base:</strong> $${ingresoBase.toFixed(2)}</p>
                <p><strong>Incapacidad:</strong> ${incapacidad}%</p>
                <p><strong>Edad:</strong> ${edadTrabajador} años</p>
                <p><strong>Coeficiente por edad:</strong> ${coeficienteEdad}</p>
                <hr style="margin: 16px 0; border: none; border-top: 1px solid var(--border);">
                <p style="font-size: 20px;"><strong>Indemnización estimada:</strong> <span style="color: var(--primary);">$${indemnizacion.toFixed(2)}</span></p>
            </div>
            <p style="color: var(--text-secondary); font-size: 14px;">
                Base legal: Ley 24.557 (LRT). Esta es una estimación según la fórmula básica de la ley. El monto real puede variar según jurisprudencia y circunstancias del caso.
            </p>
        `;
    }
}

// Setup upload de PDFs
function setupPDFUpload() {
    const uploadZone = document.getElementById('pdfUploadZone');
    const fileInput = document.getElementById('pdfFileInput');
    const btnSelectPDF = document.getElementById('btnSelectPDF');

    if (btnSelectPDF && fileInput) {
        btnSelectPDF.addEventListener('click', () => fileInput.click());
    }

    if (fileInput) {
        fileInput.addEventListener('change', handlePDFUpload);
    }

    if (uploadZone) {
        uploadZone.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--primary)';
        });

        uploadZone.addEventListener('dragleave', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border)';
        });

        uploadZone.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadZone.style.borderColor = 'var(--border)';
            
            const files = e.dataTransfer.files;
            if (files.length > 0 && files[0].type === 'application/pdf') {
                handlePDFFile(files[0]);
            } else {
                showToast('Por favor sube un archivo PDF', 'error');
            }
        });
    }
}

async function handlePDFUpload(e) {
    const file = e.target.files[0];
    if (file && file.type === 'application/pdf') {
        await handlePDFFile(file);
    } else {
        showToast('Por favor selecciona un archivo PDF', 'error');
    }
}

async function handlePDFFile(file) {
    showToast('Analizando PDF con IA...', 'info');
    showLoading(true);

    // Aquí implementarías la integración con Claude API
    // Para el prototipo, mostramos un mensaje
    
    setTimeout(() => {
        showLoading(false);
        const resultDiv = document.getElementById('analisisResult');
        if (resultDiv) {
            resultDiv.style.display = 'block';
            resultDiv.innerHTML = `
                <h3>Análisis del expediente</h3>
                <p><strong>Archivo:</strong> ${file.name}</p>
                <div style="background: var(--bg-secondary); padding: 20px; border-radius: var(--radius-md); margin: 16px 0;">
                    <p><em>Funcionalidad de análisis con IA próximamente disponible.</em></p>
                    <p>Para activar esta función, necesitas configurar tu API Key de Claude (Anthropic) en el archivo config.js</p>
                </div>
            `;
        }
    }, 2000);
}

// Mostrar modal de suscripción
function showSubscriptionModal() {
    const modal = document.getElementById('modalSuscripcion');
    const overlay = document.getElementById('modalOverlay');
    
    if (modal && overlay) {
        modal.classList.add('active');
        overlay.classList.add('active');
    }
}

// Cerrar modales
function closeAllModals() {
    const modals = document.querySelectorAll('.modal');
    const overlay = document.getElementById('modalOverlay');
    
    modals.forEach(modal => modal.classList.remove('active'));
    if (overlay) overlay.classList.remove('active');
}

// Manejar pago con Mercado Pago
function handlePagoMercadoPago() {
    showToast('Funcionalidad de pago próximamente disponible', 'warning');
    // Aquí implementarías la integración con Mercado Pago
    // Por ahora solo mostramos un mensaje
}

// Bloquear features cuando termina el trial
function blockFeatures() {
    // Desactivar botones y mostrar mensaje
    showToast('Tu período de prueba ha finalizado. Suscríbete para continuar.', 'warning');
}

// Logout
async function handleLogout() {
    const result = await Auth.logout();
    if (result.success) {
        window.location.reload();
    }
}
