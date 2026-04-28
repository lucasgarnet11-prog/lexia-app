// Cliente de Supabase y funciones de base de datos

// Inicializar cliente de Supabase
let supabaseClient = null;

function initSupabase() {
    if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
        console.error('Supabase no configurado correctamente');
        return null;
    }
    
    // Cargar librería de Supabase desde CDN
    const script = document.createElement('script');
    script.src = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';
    script.onload = () => {
        supabaseClient = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
        console.log('Supabase inicializado');
    };
    document.head.appendChild(script);
}

// Funciones de autenticación
const Auth = {
    // Registro de nuevo usuario
    async register(email, password, nombre, matricula = null) {
        try {
            // 1. Crear usuario en Supabase Auth
            const { data: authData, error: authError } = await supabaseClient.auth.signUp({
                email: email,
                password: password
            });

            if (authError) throw authError;

            // 2. Calcular fecha de fin de prueba
            const trialEnd = new Date();
            trialEnd.setDate(trialEnd.getDate() + CONFIG.TRIAL_DAYS);

            // 3. Crear perfil de usuario
            const { data: profileData, error: profileError } = await supabaseClient
                .from('perfiles')
                .insert([{
                    id: authData.user.id,
                    email: email,
                    nombre: nombre,
                    matricula: matricula,
                    trial_end: trialEnd.toISOString(),
                    suscripto: false,
                    created_at: new Date().toISOString()
                }]);

            if (profileError) throw profileError;

            return { success: true, user: authData.user };
        } catch (error) {
            console.error('Error en registro:', error);
            return { success: false, error: error.message };
        }
    },

    // Inicio de sesión
    async login(email, password) {
        try {
            const { data, error } = await supabaseClient.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) throw error;

            return { success: true, user: data.user };
        } catch (error) {
            console.error('Error en login:', error);
            return { success: false, error: error.message };
        }
    },

    // Cerrar sesión
    async logout() {
        try {
            const { error } = await supabaseClient.auth.signOut();
            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error en logout:', error);
            return { success: false, error: error.message };
        }
    },

    // Recuperar contraseña
    async resetPassword(email) {
        try {
            const { error } = await supabaseClient.auth.resetPasswordForEmail(email, {
                redirectTo: `${CONFIG.APP_URL}/app.html`
            });

            if (error) throw error;

            return { success: true };
        } catch (error) {
            console.error('Error en reset password:', error);
            return { success: false, error: error.message };
        }
    },

    // Obtener usuario actual
    async getCurrentUser() {
        try {
            const { data: { user }, error } = await supabaseClient.auth.getUser();
            if (error) throw error;
            return user;
        } catch (error) {
            console.error('Error obteniendo usuario:', error);
            return null;
        }
    },

    // Verificar sesión
    async checkSession() {
        try {
            const { data: { session }, error } = await supabaseClient.auth.getSession();
            if (error) throw error;
            return session;
        } catch (error) {
            console.error('Error verificando sesión:', error);
            return null;
        }
    }
};

// Funciones de perfil de usuario
const Profile = {
    // Obtener perfil completo
    async get(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('perfiles')
                .select('*')
                .eq('id', userId)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo perfil:', error);
            return null;
        }
    },

    // Actualizar perfil
    async update(userId, updates) {
        try {
            const { data, error } = await supabaseClient
                .from('perfiles')
                .update(updates)
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error actualizando perfil:', error);
            return { success: false, error: error.message };
        }
    },

    // Verificar si está en período de prueba
    async isTrialActive(userId) {
        try {
            const profile = await this.get(userId);
            if (!profile) return false;

            // Si ya está suscripto, siempre tiene acceso
            if (profile.suscripto) return true;

            // Verificar si la prueba sigue vigente
            const trialEnd = new Date(profile.trial_end);
            const now = new Date();
            return now < trialEnd;
        } catch (error) {
            console.error('Error verificando trial:', error);
            return false;
        }
    },

    // Obtener días restantes de prueba
    async getDaysLeft(userId) {
        try {
            const profile = await this.get(userId);
            if (!profile) return 0;

            if (profile.suscripto) return Infinity;

            const trialEnd = new Date(profile.trial_end);
            const now = new Date();
            const diffTime = trialEnd - now;
            const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
            
            return diffDays > 0 ? diffDays : 0;
        } catch (error) {
            console.error('Error calculando días:', error);
            return 0;
        }
    },

    // Activar suscripción
    async activateSubscription(userId) {
        try {
            const { error } = await supabaseClient
                .from('perfiles')
                .update({ 
                    suscripto: true,
                    subscription_date: new Date().toISOString()
                })
                .eq('id', userId);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error activando suscripción:', error);
            return { success: false, error: error.message };
        }
    }
};

// Funciones CRUD para expedientes
const Expedientes = {
    async create(userId, expediente) {
        try {
            const { data, error } = await supabaseClient
                .from('expedientes')
                .insert([{
                    user_id: userId,
                    ...expediente,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creando expediente:', error);
            return { success: false, error: error.message };
        }
    },

    async getAll(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('expedientes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo expedientes:', error);
            return [];
        }
    },

    async getById(id) {
        try {
            const { data, error } = await supabaseClient
                .from('expedientes')
                .select('*')
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        } catch (error) {
            console.error('Error obteniendo expediente:', error);
            return null;
        }
    },

    async update(id, updates) {
        try {
            const { data, error } = await supabaseClient
                .from('expedientes')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error actualizando expediente:', error);
            return { success: false, error: error.message };
        }
    },

    async delete(id) {
        try {
            const { error } = await supabaseClient
                .from('expedientes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error eliminando expediente:', error);
            return { success: false, error: error.message };
        }
    }
};

// Funciones CRUD para clientes
const Clientes = {
    async create(userId, cliente) {
        try {
            const { data, error } = await supabaseClient
                .from('clientes')
                .insert([{
                    user_id: userId,
                    ...cliente,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creando cliente:', error);
            return { success: false, error: error.message };
        }
    },

    async getAll(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('clientes')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo clientes:', error);
            return [];
        }
    },

    async update(id, updates) {
        try {
            const { data, error } = await supabaseClient
                .from('clientes')
                .update(updates)
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error actualizando cliente:', error);
            return { success: false, error: error.message };
        }
    },

    async delete(id) {
        try {
            const { error } = await supabaseClient
                .from('clientes')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error eliminando cliente:', error);
            return { success: false, error: error.message };
        }
    }
};

// Funciones para audiencias
const Audiencias = {
    async create(userId, audiencia) {
        try {
            const { data, error } = await supabaseClient
                .from('audiencias')
                .insert([{
                    user_id: userId,
                    ...audiencia,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error creando audiencia:', error);
            return { success: false, error: error.message };
        }
    },

    async getAll(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('audiencias')
                .select('*')
                .eq('user_id', userId)
                .order('fecha', { ascending: true });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo audiencias:', error);
            return [];
        }
    },

    async getUpcoming(userId, limit = 5) {
        try {
            const now = new Date().toISOString();
            const { data, error } = await supabaseClient
                .from('audiencias')
                .select('*')
                .eq('user_id', userId)
                .gte('fecha', now)
                .order('fecha', { ascending: true })
                .limit(limit);

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo audiencias próximas:', error);
            return [];
        }
    },

    async delete(id) {
        try {
            const { error } = await supabaseClient
                .from('audiencias')
                .delete()
                .eq('id', id);

            if (error) throw error;
            return { success: true };
        } catch (error) {
            console.error('Error eliminando audiencia:', error);
            return { success: false, error: error.message };
        }
    }
};

// Funciones para documentos generados
const Documentos = {
    async save(userId, documento) {
        try {
            const { data, error } = await supabaseClient
                .from('documentos')
                .insert([{
                    user_id: userId,
                    ...documento,
                    created_at: new Date().toISOString()
                }])
                .select();

            if (error) throw error;
            return { success: true, data: data[0] };
        } catch (error) {
            console.error('Error guardando documento:', error);
            return { success: false, error: error.message };
        }
    },

    async getAll(userId) {
        try {
            const { data, error } = await supabaseClient
                .from('documentos')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        } catch (error) {
            console.error('Error obteniendo documentos:', error);
            return [];
        }
    }
};

// Inicializar Supabase cuando se cargue el documento
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSupabase);
} else {
    initSupabase();
}
