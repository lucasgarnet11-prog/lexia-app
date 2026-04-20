-- ================================================
-- BASE DE DATOS PARA LEXIA
-- Aplicación de gestión legal para abogados argentinos
-- ================================================

-- ================================================
-- TABLA: perfiles
-- Almacena información de usuarios registrados
-- ================================================
CREATE TABLE IF NOT EXISTS perfiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    matricula TEXT, -- Matrícula profesional del abogado
    trial_end TIMESTAMP WITH TIME ZONE NOT NULL, -- Fin del período de prueba
    suscripto BOOLEAN DEFAULT FALSE, -- Si tiene suscripción activa
    subscription_date TIMESTAMP WITH TIME ZONE, -- Fecha de inicio de suscripción
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- TABLA: expedientes
-- Gestión de expedientes judiciales
-- ================================================
CREATE TABLE IF NOT EXISTS expedientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    numero TEXT, -- Número de expediente (ej: 1234/2024)
    caratula TEXT NOT NULL, -- Carátula del expediente
    tipo TEXT NOT NULL, -- laboral, civil, comercial, familia, penal, administrativo
    juzgado TEXT, -- Juzgado donde tramita
    cliente_id UUID, -- Referencia al cliente (sin FK estricta por ahora)
    estado TEXT DEFAULT 'activo', -- activo, archivado, finalizado
    fecha_inicio DATE, -- Fecha de inicio del expediente
    descripcion TEXT, -- Descripción del caso
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- TABLA: clientes
-- Gestión de clientes del estudio
-- ================================================
CREATE TABLE IF NOT EXISTS clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    nombre TEXT NOT NULL,
    dni TEXT,
    email TEXT,
    telefono TEXT,
    domicilio TEXT,
    notas TEXT, -- Notas adicionales sobre el cliente
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- TABLA: audiencias
-- Calendario de audiencias y eventos judiciales
-- ================================================
CREATE TABLE IF NOT EXISTS audiencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    lugar TEXT, -- Ubicación de la audiencia
    tipo TEXT, -- audiencia, vencimiento, notificación, etc.
    notas TEXT,
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- TABLA: documentos
-- Documentos generados por IA (escritos, contratos, etc.)
-- ================================================
CREATE TABLE IF NOT EXISTS documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL, -- escrito, contrato, carta_documento, estrategia
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    metadata JSONB, -- Información adicional en formato JSON
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- TABLA: archivos
-- Almacenamiento de referencias a archivos (PDFs, etc.)
-- ================================================
CREATE TABLE IF NOT EXISTS archivos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL, -- pdf, docx, jpg, etc.
    ruta TEXT NOT NULL, -- Ruta en Supabase Storage
    tamano INTEGER, -- Tamaño en bytes
    analizado BOOLEAN DEFAULT FALSE, -- Si ya fue analizado por IA
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- Cada usuario solo puede ver sus propios datos
-- ================================================
ALTER TABLE perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE expedientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE clientes ENABLE ROW LEVEL SECURITY;
ALTER TABLE audiencias ENABLE ROW LEVEL SECURITY;
ALTER TABLE documentos ENABLE ROW LEVEL SECURITY;
ALTER TABLE archivos ENABLE ROW LEVEL SECURITY;

-- ================================================
-- POLÍTICAS DE SEGURIDAD - PERFILES
-- ================================================
-- Los usuarios pueden ver su propio perfil
CREATE POLICY "usuarios_pueden_ver_propio_perfil"
    ON perfiles FOR SELECT
    USING (auth.uid() = id);

-- Los usuarios pueden actualizar su propio perfil
CREATE POLICY "usuarios_pueden_actualizar_propio_perfil"
    ON perfiles FOR UPDATE
    USING (auth.uid() = id);

-- Los usuarios pueden insertar su propio perfil (para registro)
CREATE POLICY "usuarios_pueden_insertar_propio_perfil"
    ON perfiles FOR INSERT
    WITH CHECK (auth.uid() = id);

-- ================================================
-- POLÍTICAS DE SEGURIDAD - EXPEDIENTES
-- ================================================
CREATE POLICY "usuarios_pueden_ver_sus_expedientes"
    ON expedientes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_crear_expedientes"
    ON expedientes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_actualizar_sus_expedientes"
    ON expedientes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_eliminar_sus_expedientes"
    ON expedientes FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- POLÍTICAS DE SEGURIDAD - CLIENTES
-- ================================================
CREATE POLICY "usuarios_pueden_ver_sus_clientes"
    ON clientes FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_crear_clientes"
    ON clientes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_actualizar_sus_clientes"
    ON clientes FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_eliminar_sus_clientes"
    ON clientes FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- POLÍTICAS DE SEGURIDAD - AUDIENCIAS
-- ================================================
CREATE POLICY "usuarios_pueden_ver_sus_audiencias"
    ON audiencias FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_crear_audiencias"
    ON audiencias FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_actualizar_sus_audiencias"
    ON audiencias FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_eliminar_sus_audiencias"
    ON audiencias FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- POLÍTICAS DE SEGURIDAD - DOCUMENTOS
-- ================================================
CREATE POLICY "usuarios_pueden_ver_sus_documentos"
    ON documentos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_crear_documentos"
    ON documentos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_eliminar_sus_documentos"
    ON documentos FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- POLÍTICAS DE SEGURIDAD - ARCHIVOS
-- ================================================
CREATE POLICY "usuarios_pueden_ver_sus_archivos"
    ON archivos FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_crear_archivos"
    ON archivos FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "usuarios_pueden_eliminar_sus_archivos"
    ON archivos FOR DELETE
    USING (auth.uid() = user_id);

-- ================================================
-- ÍNDICES PARA MEJORAR RENDIMIENTO
-- ================================================
CREATE INDEX IF NOT EXISTS idx_expedientes_user_id ON expedientes(user_id);
CREATE INDEX IF NOT EXISTS idx_expedientes_estado ON expedientes(estado);
CREATE INDEX IF NOT EXISTS idx_clientes_user_id ON clientes(user_id);
CREATE INDEX IF NOT EXISTS idx_audiencias_user_id ON audiencias(user_id);
CREATE INDEX IF NOT EXISTS idx_audiencias_fecha ON audiencias(fecha);
CREATE INDEX IF NOT EXISTS idx_documentos_user_id ON documentos(user_id);
CREATE INDEX IF NOT EXISTS idx_archivos_user_id ON archivos(user_id);

-- ================================================
-- FUNCIONES ÚTILES
-- ================================================

-- Función para actualizar automáticamente updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para expedientes
CREATE TRIGGER update_expedientes_updated_at
    BEFORE UPDATE ON expedientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Trigger para clientes
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- STORAGE BUCKET PARA ARCHIVOS
-- ================================================
-- Ejecutar esto manualmente en Supabase Dashboard > Storage
-- O usando el siguiente SQL:

-- Crear bucket para archivos de usuarios
INSERT INTO storage.buckets (id, name, public)
VALUES ('user-files', 'user-files', false)
ON CONFLICT DO NOTHING;

-- Política de storage: los usuarios pueden ver sus archivos
CREATE POLICY "Los usuarios pueden ver sus archivos"
ON storage.objects FOR SELECT
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política de storage: los usuarios pueden subir archivos
CREATE POLICY "Los usuarios pueden subir archivos"
ON storage.objects FOR INSERT
WITH CHECK (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Política de storage: los usuarios pueden eliminar sus archivos
CREATE POLICY "Los usuarios pueden eliminar sus archivos"
ON storage.objects FOR DELETE
USING (bucket_id = 'user-files' AND auth.uid()::text = (storage.foldername(name))[1]);

-- ================================================
-- DATOS DE PRUEBA (OPCIONAL - SOLO DESARROLLO)
-- ================================================
-- Descomentar solo si quieres datos de prueba

/*
-- Insertar un perfil de prueba (después de crear el usuario en Auth)
INSERT INTO perfiles (id, email, nombre, matricula, trial_end, suscripto)
VALUES (
    'UUID-DEL-USUARIO', -- Reemplazar con UUID real del usuario
    'test@lexia.com.ar',
    'Abogado de Prueba',
    'T° 123 F° 456',
    NOW() + INTERVAL '7 days',
    false
);
*/

-- ================================================
-- VERIFICACIÓN
-- ================================================
-- Verifica que todo se haya creado correctamente
SELECT 
    'perfiles' as tabla,
    COUNT(*) as registros
FROM perfiles
UNION ALL
SELECT 'expedientes', COUNT(*) FROM expedientes
UNION ALL
SELECT 'clientes', COUNT(*) FROM clientes
UNION ALL
SELECT 'audiencias', COUNT(*) FROM audiencias
UNION ALL
SELECT 'documentos', COUNT(*) FROM documentos
UNION ALL
SELECT 'archivos', COUNT(*) FROM archivos;

-- ================================================
-- FIN DEL SCRIPT
-- ================================================

-- NOTAS IMPORTANTES:
-- 1. Este script es idempotente (puede ejecutarse múltiples veces)
-- 2. Las políticas RLS garantizan que cada usuario solo vea sus datos
-- 3. Los índices mejoran el rendimiento de consultas frecuentes
-- 4. El trigger updated_at mantiene fechas de modificación actualizadas
-- 5. Storage policies permiten subir y gestionar archivos de forma segura
