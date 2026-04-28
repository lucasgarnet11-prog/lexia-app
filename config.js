// Configuración global de la aplicación LexIA

// ✅ CREDENCIALES DE SUPABASE - YA CONFIGURADAS
const CONFIG = {
    // Supabase - CREDENCIALES REALES
    SUPABASE_URL: 'https://ewbvvdaxyfwowbirtomr.supabase.co',
    SUPABASE_ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3YnZ2ZGF4eWZ3b3diaXJ0b21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTU2MzIsImV4cCI6MjA1MDEzMTYzMn0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3YnZ2ZGF4eWZ3b3diaXJ0b21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTU2MzIsImV4cCI6MjA1MDEzMTYzMn0.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3YnZ2ZGF4eWZ3b3diaXJ0b21yIiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQ1NTU2MzIsImV4cCI6MjA1MDEzMTYzMn0',
    
    // Claude API (Anthropic) - AGREGAR CUANDO TENGAS LA CLAVE
    CLAUDE_API_KEY: 'TU_API_KEY_DE_CLAUDE', // Obtener en: https://console.anthropic.com
    
    // Mercado Pago - AGREGAR CUANDO TENGAS LAS CLAVES
    MERCADOPAGO_PUBLIC_KEY: 'TU_PUBLIC_KEY_DE_MERCADOPAGO',
    MERCADOPAGO_ACCESS_TOKEN: 'TU_ACCESS_TOKEN_DE_MERCADOPAGO',
    
    // Configuración de la aplicación
    TRIAL_DAYS: 7, // Días de prueba gratuita
    MONTHLY_PRICE: 9900, // Precio en pesos argentinos
    
    // URLs
    APP_URL: window.location.origin,
    API_ENDPOINT: window.location.origin + '/api'
};

// Legislación argentina pre-cargada para los prompts de IA
const LEGISLACION_ARGENTINA = {
    ccycn: {
        nombre: 'Código Civil y Comercial de la Nación',
        ley: 'Ley 26.994',
        vigencia: '1 de agosto de 2015',
        descripcion: 'Regula las relaciones civiles y comerciales en Argentina'
    },
    lct: {
        nombre: 'Ley de Contrato de Trabajo',
        ley: 'Ley 20.744',
        descripcion: 'Regula las relaciones laborales en Argentina',
        temas: ['Contrato de trabajo', 'Jornada laboral', 'Descansos', 'Remuneración', 'Despido', 'Indemnizaciones']
    },
    lrt: {
        nombre: 'Ley de Riesgos del Trabajo',
        ley: 'Ley 24.557',
        descripcion: 'Regula la prevención y reparación de riesgos del trabajo'
    },
    alimentos: {
        nombre: 'Régimen de cuota alimentaria',
        base_legal: 'CCyCN Art. 658-676',
        descripcion: 'Obligación alimentaria entre parientes'
    }
};

// Mensajes de error comunes
const MENSAJES = {
    error: {
        red: 'Error de conexión. Verifica tu internet.',
        auth: 'Error de autenticación. Inicia sesión nuevamente.',
        permisos: 'No tienes permisos para realizar esta acción.',
        generico: 'Ocurrió un error. Intenta nuevamente.',
        trial_vencido: 'Tu período de prueba ha finalizado. Suscríbete para continuar.',
        campos_vacios: 'Por favor completa todos los campos requeridos.'
    },
    exito: {
        guardado: 'Guardado exitosamente.',
        eliminado: 'Eliminado exitosamente.',
        actualizado: 'Actualizado exitosamente.',
        enviado: 'Enviado exitosamente.',
        generado: 'Generado exitosamente.'
    },
    confirmacion: {
        eliminar: '¿Estás seguro de eliminar este elemento?',
        salir: '¿Deseas salir? Los cambios no guardados se perderán.'
    }
};

// Tipos de escritos judiciales disponibles
const TIPOS_ESCRITOS = {
    demanda: {
        nombre: 'Demanda',
        descripcion: 'Escrito inicial que da inicio a un proceso judicial',
        estructura: ['Encabezamiento', 'Objeto', 'Hechos', 'Derecho', 'Prueba', 'Petitorio']
    },
    contestacion: {
        nombre: 'Contestación de Demanda',
        descripcion: 'Respuesta del demandado a la demanda iniciada',
        estructura: ['Encabezamiento', 'Contestación', 'Defensas', 'Prueba', 'Petitorio']
    },
    recurso_apelacion: {
        nombre: 'Recurso de Apelación',
        descripcion: 'Recurso contra resoluciones judiciales',
        estructura: ['Encabezamiento', 'Objeto', 'Agravios', 'Derecho', 'Petitorio']
    },
    recurso_revocatoria: {
        nombre: 'Recurso de Revocatoria',
        descripcion: 'Recurso ante el mismo juez que dictó la resolución',
        estructura: ['Encabezamiento', 'Objeto', 'Fundamentos', 'Petitorio']
    },
    alegato: {
        nombre: 'Alegato',
        descripcion: 'Exposición final sobre los hechos y pruebas',
        estructura: ['Encabezamiento', 'Hechos probados', 'Valoración de prueba', 'Derecho aplicable', 'Petitorio']
    },
    memorial: {
        nombre: 'Memorial',
        descripcion: 'Escrito de fundamentación de recursos',
        estructura: ['Encabezamiento', 'Antecedentes', 'Agravios', 'Fundamentos de derecho', 'Petitorio']
    },
    escrito_prueba: {
        nombre: 'Ofrecimiento de Prueba',
        descripcion: 'Presentación de medios probatorios',
        estructura: ['Encabezamiento', 'Objeto', 'Hechos a probar', 'Pruebas ofrecidas', 'Petitorio']
    },
    incidente: {
        nombre: 'Incidente',
        descripcion: 'Cuestión accesoria al proceso principal',
        estructura: ['Encabezamiento', 'Objeto', 'Fundamentos', 'Petitorio']
    }
};

// Tipos de contratos disponibles
const TIPOS_CONTRATOS = {
    compraventa: {
        nombre: 'Contrato de Compraventa',
        base_legal: 'CCyCN Art. 1123-1157',
        elementos: ['Identificación de partes', 'Objeto', 'Precio', 'Forma de pago', 'Tradición']
    },
    locacion: {
        nombre: 'Contrato de Locación',
        base_legal: 'CCyCN Art. 1187-1227',
        elementos: ['Identificación de partes', 'Inmueble', 'Plazo', 'Precio', 'Destino', 'Garantías']
    },
    trabajo: {
        nombre: 'Contrato de Trabajo',
        base_legal: 'LCT Ley 20.744',
        elementos: ['Identificación de partes', 'Categoría', 'Remuneración', 'Jornada', 'Lugar de trabajo']
    },
    servicios: {
        nombre: 'Contrato de Prestación de Servicios',
        base_legal: 'CCyCN Art. 1251-1279',
        elementos: ['Identificación de partes', 'Servicios', 'Plazo', 'Precio', 'Forma de pago']
    },
    mutuo: {
        nombre: 'Contrato de Mutuo',
        base_legal: 'CCyCN Art. 1525-1534',
        elementos: ['Identificación de partes', 'Monto', 'Intereses', 'Plazo', 'Forma de devolución']
    },
    comodato: {
        nombre: 'Contrato de Comodato',
        base_legal: 'CCyCN Art. 1533-1541',
        elementos: ['Identificación de partes', 'Bien', 'Plazo', 'Uso permitido']
    },
    donacion: {
        nombre: 'Contrato de Donación',
        base_legal: 'CCyCN Art. 1542-1573',
        elementos: ['Identificación de partes', 'Bien donado', 'Cargo', 'Aceptación']
    },
    sociedad: {
        nombre: 'Contrato de Sociedad',
        base_legal: 'Ley 19.550',
        elementos: ['Identificación de socios', 'Tipo social', 'Capital', 'Objeto', 'Administración']
    },
    mandato: {
        nombre: 'Contrato de Mandato',
        base_legal: 'CCyCN Art. 1319-1334',
        elementos: ['Identificación de partes', 'Actos a realizar', 'Facultades', 'Retribución']
    }
};

// Configuración de calculadoras
const CALCULADORAS = {
    indemnizacion: {
        nombre: 'Indemnización por Despido',
        base_legal: 'LCT Art. 245',
        formula: 'Mejor remuneración mensual × Años de antigüedad'
    },
    alimentos: {
        nombre: 'Cuota Alimentaria',
        base_legal: 'CCyCN Art. 658-676',
        porcentaje_sugerido: {
            1_hijo: 0.20,
            2_hijos: 0.30,
            3_o_mas: 0.40
        }
    },
    accidente: {
        nombre: 'Indemnización por Accidente de Trabajo',
        base_legal: 'Ley 24.557',
        formula: '53 × IBL × % incapacidad × coeficiente edad'
    }
};

// Disclaimer legal
const DISCLAIMER_LEGAL = `
⚠️ AVISO LEGAL IMPORTANTE

Este documento ha sido generado mediante inteligencia artificial como un BORRADOR de trabajo.

DEBE SER REVISADO, ADAPTADO Y VALIDADO por un abogado profesional matriculado antes de su 
presentación judicial o uso oficial.

La aplicación LexIA no reemplaza el criterio jurídico profesional. El usuario es el único 
responsable del uso y aplicación de los contenidos generados.

Esta herramienta es de asistencia y no garantiza resultados específicos en casos legales.
`;

// Exportar configuración
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        CONFIG,
        LEGISLACION_ARGENTINA,
        MENSAJES,
        TIPOS_ESCRITOS,
        TIPOS_CONTRATOS,
        CALCULADORAS,
        DISCLAIMER_LEGAL
    };
}
