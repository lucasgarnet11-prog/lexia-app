// Funciones extendidas para la aplicación LexIA
// Gestión avanzada de expedientes, clientes y documentos

// Gestión de expedientes con modales
const ExpedientesUI = {
    // Cargar y mostrar lista de expedientes
    async cargarLista() {
        const container = document.getElementById('expedientesList');
        if (!container) return;

        showLoading(true);
        const expedientes = await Expedientes.getAll(currentUser.id);
        showLoading(false);

        if (expedientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">📂</span>
                    <p>No tienes expedientes aún</p>
                    <p class="empty-subtitle">Crea tu primer expediente para comenzar</p>
                </div>
            `;
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-secondary); text-align: left;">
                        <th style="padding: 16px; font-weight: 600;">Carátula</th>
                        <th style="padding: 16px; font-weight: 600;">Tipo</th>
                        <th style="padding: 16px; font-weight: 600;">Juzgado</th>
                        <th style="padding: 16px; font-weight: 600;">Estado</th>
                        <th style="padding: 16px; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        expedientes.forEach(exp => {
            const estadoColor = exp.estado === 'activo' ? 'var(--success)' : 'var(--text-tertiary)';
            html += `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 16px;">
                        <strong>${exp.caratula || 'Sin carátula'}</strong>
                        ${exp.numero ? `<br><small style="color: var(--text-tertiary);">Nº ${exp.numero}</small>` : ''}
                    </td>
                    <td style="padding: 16px;">${exp.tipo || 'No especificado'}</td>
                    <td style="padding: 16px;">${exp.juzgado || '-'}</td>
                    <td style="padding: 16px;">
                        <span style="color: ${estadoColor}; font-weight: 600;">● ${exp.estado || 'activo'}</span>
                    </td>
                    <td style="padding: 16px;">
                        <button class="btn-icon" onclick="ExpedientesUI.ver('${exp.id}')" title="Ver detalles">
                            👁️
                        </button>
                        <button class="btn-icon" onclick="ExpedientesUI.editar('${exp.id}')" title="Editar">
                            ✏️
                        </button>
                        <button class="btn-icon" onclick="ExpedientesUI.eliminar('${exp.id}')" title="Eliminar">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `
                </tbody>
            </table>
        `;

        container.innerHTML = html;
    },

    // Mostrar modal para nuevo expediente
    mostrarModalNuevo() {
        const modal = this.crearModal('Nuevo Expediente', `
            <form id="formNuevoExpediente">
                <div class="form-group">
                    <label>Carátula *</label>
                    <input type="text" id="expCaratula" required placeholder="Ej: García Juan c/ Empresa SA s/ Despido">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Número de expediente</label>
                        <input type="text" id="expNumero" placeholder="Ej: 1234/2024">
                    </div>
                    <div class="form-group">
                        <label>Tipo *</label>
                        <select id="expTipo" required>
                            <option value="">Seleccionar...</option>
                            <option value="laboral">Laboral</option>
                            <option value="civil">Civil</option>
                            <option value="comercial">Comercial</option>
                            <option value="familia">Familia</option>
                            <option value="penal">Penal</option>
                            <option value="administrativo">Administrativo</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Juzgado</label>
                    <input type="text" id="expJuzgado" placeholder="Ej: Juzgado Civil y Comercial N° 5">
                </div>
                <div class="form-group">
                    <label>Fecha de inicio</label>
                    <input type="date" id="expFechaInicio">
                </div>
                <div class="form-group">
                    <label>Descripción</label>
                    <textarea id="expDescripcion" rows="3" placeholder="Breve descripción del caso..."></textarea>
                </div>
                <button type="submit" class="btn-primary btn-block">Crear expediente</button>
            </form>
        `);

        document.getElementById('formNuevoExpediente').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.guardarNuevo();
        });
    },

    async guardarNuevo() {
        const expediente = {
            caratula: document.getElementById('expCaratula').value,
            numero: document.getElementById('expNumero').value,
            tipo: document.getElementById('expTipo').value,
            juzgado: document.getElementById('expJuzgado').value,
            fecha_inicio: document.getElementById('expFechaInicio').value,
            descripcion: document.getElementById('expDescripcion').value,
            estado: 'activo'
        };

        showLoading(true);
        const result = await Expedientes.create(currentUser.id, expediente);
        showLoading(false);

        if (result.success) {
            showToast('Expediente creado exitosamente', 'success');
            this.cerrarModal();
            this.cargarLista();
            loadDashboardStats();
        } else {
            showToast('Error al crear expediente', 'error');
        }
    },

    async ver(id) {
        const exp = await Expedientes.getById(id);
        if (!exp) {
            showToast('Expediente no encontrado', 'error');
            return;
        }

        this.crearModal('Detalles del Expediente', `
            <div style="padding: 8px;">
                <h3 style="margin-bottom: 20px;">${exp.caratula}</h3>
                <div style="display: grid; gap: 16px;">
                    <div>
                        <strong>Número:</strong> ${exp.numero || 'No asignado'}
                    </div>
                    <div>
                        <strong>Tipo:</strong> ${exp.tipo}
                    </div>
                    <div>
                        <strong>Juzgado:</strong> ${exp.juzgado || 'No especificado'}
                    </div>
                    <div>
                        <strong>Estado:</strong> ${exp.estado}
                    </div>
                    <div>
                        <strong>Fecha de inicio:</strong> ${exp.fecha_inicio ? new Date(exp.fecha_inicio).toLocaleDateString('es-AR') : 'No especificada'}
                    </div>
                    ${exp.descripcion ? `
                        <div>
                            <strong>Descripción:</strong><br>
                            ${exp.descripcion}
                        </div>
                    ` : ''}
                </div>
            </div>
        `);
    },

    async eliminar(id) {
        if (!confirm('¿Estás seguro de eliminar este expediente? Esta acción no se puede deshacer.')) {
            return;
        }

        showLoading(true);
        const result = await Expedientes.delete(id);
        showLoading(false);

        if (result.success) {
            showToast('Expediente eliminado', 'success');
            this.cargarLista();
            loadDashboardStats();
        } else {
            showToast('Error al eliminar', 'error');
        }
    },

    crearModal(titulo, contenido) {
        const modalHTML = `
            <div id="modalCustom" class="modal active">
                <div class="modal-content">
                    <div class="modal-header">
                        <h2>${titulo}</h2>
                        <button class="modal-close" onclick="ExpedientesUI.cerrarModal()">&times;</button>
                    </div>
                    <div class="modal-body">
                        ${contenido}
                    </div>
                </div>
            </div>
        `;

        // Remover modal anterior si existe
        const oldModal = document.getElementById('modalCustom');
        if (oldModal) oldModal.remove();

        document.body.insertAdjacentHTML('beforeend', modalHTML);
        document.getElementById('modalOverlay').classList.add('active');
    },

    cerrarModal() {
        const modal = document.getElementById('modalCustom');
        if (modal) modal.remove();
        document.getElementById('modalOverlay').classList.remove('active');
    }
};

// Gestión de clientes con modales
const ClientesUI = {
    async cargarLista() {
        const container = document.getElementById('clientesList');
        if (!container) return;

        showLoading(true);
        const clientes = await Clientes.getAll(currentUser.id);
        showLoading(false);

        if (clientes.length === 0) {
            container.innerHTML = `
                <div class="empty-state">
                    <span class="empty-icon">👥</span>
                    <p>No tienes clientes registrados</p>
                    <p class="empty-subtitle">Agrega tu primer cliente</p>
                </div>
            `;
            return;
        }

        let html = `
            <table style="width: 100%; border-collapse: collapse;">
                <thead>
                    <tr style="background: var(--bg-secondary); text-align: left;">
                        <th style="padding: 16px; font-weight: 600;">Nombre</th>
                        <th style="padding: 16px; font-weight: 600;">DNI</th>
                        <th style="padding: 16px; font-weight: 600;">Contacto</th>
                        <th style="padding: 16px; font-weight: 600;">Acciones</th>
                    </tr>
                </thead>
                <tbody>
        `;

        clientes.forEach(cliente => {
            html += `
                <tr style="border-bottom: 1px solid var(--border);">
                    <td style="padding: 16px;">
                        <strong>${cliente.nombre}</strong>
                    </td>
                    <td style="padding: 16px;">${cliente.dni || '-'}</td>
                    <td style="padding: 16px;">
                        ${cliente.email ? `📧 ${cliente.email}<br>` : ''}
                        ${cliente.telefono ? `📱 ${cliente.telefono}` : ''}
                    </td>
                    <td style="padding: 16px;">
                        <button class="btn-icon" onclick="ClientesUI.ver('${cliente.id}')" title="Ver detalles">
                            👁️
                        </button>
                        <button class="btn-icon" onclick="ClientesUI.eliminar('${cliente.id}')" title="Eliminar">
                            🗑️
                        </button>
                    </td>
                </tr>
            `;
        });

        html += `</tbody></table>`;
        container.innerHTML = html;
    },

    mostrarModalNuevo() {
        const modal = this.crearModal('Nuevo Cliente', `
            <form id="formNuevoCliente">
                <div class="form-group">
                    <label>Nombre completo *</label>
                    <input type="text" id="clienteNombre" required placeholder="Juan Pérez">
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>DNI</label>
                        <input type="text" id="clienteDNI" placeholder="12345678">
                    </div>
                    <div class="form-group">
                        <label>Teléfono</label>
                        <input type="tel" id="clienteTelefono" placeholder="+54 9 11 1234-5678">
                    </div>
                </div>
                <div class="form-group">
                    <label>Email</label>
                    <input type="email" id="clienteEmail" placeholder="cliente@email.com">
                </div>
                <div class="form-group">
                    <label>Domicilio</label>
                    <input type="text" id="clienteDomicilio" placeholder="Calle 123, Ciudad, Provincia">
                </div>
                <button type="submit" class="btn-primary btn-block">Agregar cliente</button>
            </form>
        `);

        document.getElementById('formNuevoCliente').addEventListener('submit', async (e) => {
            e.preventDefault();
            await this.guardarNuevo();
        });
    },

    async guardarNuevo() {
        const cliente = {
            nombre: document.getElementById('clienteNombre').value,
            dni: document.getElementById('clienteDNI').value,
            telefono: document.getElementById('clienteTelefono').value,
            email: document.getElementById('clienteEmail').value,
            domicilio: document.getElementById('clienteDomicilio').value
        };

        showLoading(true);
        const result = await Clientes.create(currentUser.id, cliente);
        showLoading(false);

        if (result.success) {
            showToast('Cliente agregado exitosamente', 'success');
            this.cerrarModal();
            this.cargarLista();
            loadDashboardStats();
        } else {
            showToast('Error al agregar cliente', 'error');
        }
    },

    async ver(id) {
        const cliente = await Clientes.getAll(currentUser.id).then(clientes => 
            clientes.find(c => c.id === id)
        );

        if (!cliente) {
            showToast('Cliente no encontrado', 'error');
            return;
        }

        this.crearModal('Detalles del Cliente', `
            <div style="padding: 8px;">
                <h3 style="margin-bottom: 20px;">${cliente.nombre}</h3>
                <div style="display: grid; gap: 16px;">
                    ${cliente.dni ? `<div><strong>DNI:</strong> ${cliente.dni}</div>` : ''}
                    ${cliente.email ? `<div><strong>Email:</strong> ${cliente.email}</div>` : ''}
                    ${cliente.telefono ? `<div><strong>Teléfono:</strong> ${cliente.telefono}</div>` : ''}
                    ${cliente.domicilio ? `<div><strong>Domicilio:</strong> ${cliente.domicilio}</div>` : ''}
                </div>
            </div>
        `);
    },

    async eliminar(id) {
        if (!confirm('¿Eliminar este cliente?')) return;

        showLoading(true);
        const result = await Clientes.delete(id);
        showLoading(false);

        if (result.success) {
            showToast('Cliente eliminado', 'success');
            this.cargarLista();
            loadDashboardStats();
        } else {
            showToast('Error al eliminar', 'error');
        }
    },

    crearModal(titulo, contenido) {
        return ExpedientesUI.crearModal(titulo, contenido);
    },

    cerrarModal() {
        ExpedientesUI.cerrarModal();
    }
};

// Funciones para integrar con los botones
function setupExpedientesClientes() {
    const btnNuevoExpediente = document.getElementById('btnNuevoExpediente');
    if (btnNuevoExpediente) {
        btnNuevoExpediente.addEventListener('click', () => {
            ExpedientesUI.mostrarModalNuevo();
        });
    }

    const btnNuevoCliente = document.getElementById('btnNuevoCliente');
    if (btnNuevoCliente) {
        btnNuevoCliente.addEventListener('click', () => {
            ClientesUI.mostrarModalNuevo();
        });
    }
}

// Cargar expedientes y clientes cuando se accede a sus secciones
function setupSeccionesCargar() {
    const navItems = document.querySelectorAll('.nav-item');
    
    navItems.forEach(item => {
        item.addEventListener('click', async () => {
            const section = item.getAttribute('data-section');
            
            if (section === 'expedientes') {
                await ExpedientesUI.cargarLista();
            } else if (section === 'clientes') {
                await ClientesUI.cargarLista();
            }
        });
    });
}
