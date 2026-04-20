-- ================================================
-- BASE DE DATOS PARA LEXIA - VERSION SEGURA
-- Elimina y recrea todo de forma segura
-- ================================================

-- ================================================
-- ELIMINAR POLÍTICAS EXISTENTES (si las hay)
-- ================================================
DROP POLICY IF EXISTS "usuarios_pueden_ver_propio_perfil" ON perfiles;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_propio_perfil" ON perfiles;
DROP POLICY IF EXISTS "usuarios_pueden_insertar_propio_perfil" ON perfiles;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_expedientes" ON expedientes;
DROP POLICY IF EXISTS "usuarios_pueden_crear_expedientes" ON expedientes;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_expedientes" ON expedientes;
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_expedientes" ON expedientes;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_clientes" ON clientes;
DROP POLICY IF EXISTS "usuarios_pueden_crear_clientes" ON clientes;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_clientes" ON clientes;
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_clientes" ON clientes;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_audiencias" ON audiencias;
DROP POLICY IF EXISTS "usuarios_pueden_crear_audiencias" ON audiencias;
DROP POLICY IF EXISTS "usuarios_pueden_actualizar_sus_audiencias" ON audiencias;
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_audiencias" ON audiencias;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_documentos" ON documentos;
DROP POLICY IF EXISTS "usuarios_pueden_crear_documentos" ON documentos;
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_documentos" ON documentos;
DROP POLICY IF EXISTS "usuarios_pueden_ver_sus_archivos" ON archivos;
DROP POLICY IF EXISTS "usuarios_pueden_crear_archivos" ON archivos;
DROP POLICY IF EXISTS "usuarios_pueden_eliminar_sus_archivos" ON archivos;

-- ================================================
-- ELIMINAR TABLAS EXISTENTES (si las hay)
-- ================================================
DROP TABLE IF EXISTS archivos CASCADE;
DROP TABLE IF EXISTS documentos CASCADE;
DROP TABLE IF EXISTS audiencias CASCADE;
DROP TABLE IF EXISTS expedientes CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS perfiles CASCADE;

-- ================================================
-- CREAR TABLAS
-- ================================================

-- Tabla de perfiles
CREATE TABLE perfiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    nombre TEXT NOT NULL,
    matricula TEXT,
    trial_end TIMESTAMP WITH TIME ZONE NOT NULL,
    suscripto BOOLEAN DEFAULT FALSE,
    subscription_date TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de expedientes
CREATE TABLE expedientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    numero TEXT,
    caratula TEXT NOT NULL,
    tipo TEXT NOT NULL,
    juzgado TEXT,
    cliente_id UUID,
    estado TEXT DEFAULT 'activo',
    fecha_inicio DATE,
    descripcion TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de clientes
CREATE TABLE clientes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    nombre TEXT NOT NULL,
    dni TEXT,
    email TEXT,
    telefono TEXT,
    domicilio TEXT,
    notas TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de audiencias
CREATE TABLE audiencias (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    titulo TEXT NOT NULL,
    fecha TIMESTAMP WITH TIME ZONE NOT NULL,
    lugar TEXT,
    tipo TEXT,
    notas TEXT,
    recordatorio_enviado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de documentos
CREATE TABLE documentos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE SET NULL,
    tipo TEXT NOT NULL,
    titulo TEXT NOT NULL,
    contenido TEXT NOT NULL,
    metadata JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla de archivos
CREATE TABLE archivos (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES perfiles(id) ON DELETE CASCADE NOT NULL,
    expediente_id UUID REFERENCES expedientes(id) ON DELETE CASCADE,
    nombre TEXT NOT NULL,
    tipo TEXT NOT NULL,
    ruta TEXT NOT NULL,
    tamano INTEGER,
    analizado BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ================================================
-- HABILITAR ROW LEVEL SECURITY
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
CREATE POLICY "usuarios_pueden_ver_propio_perfil"
    ON perfiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "usuarios_pueden_actualizar_propio_perfil"
    ON perfiles FOR UPDATE
    USING (auth.uid() = id);

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
-- FUNCIÓN PARA ACTUALIZAR updated_at
-- ================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ================================================
-- TRIGGERS
-- ================================================
DROP TRIGGER IF EXISTS update_expedientes_updated_at ON expedientes;
CREATE TRIGGER update_expedientes_updated_at
    BEFORE UPDATE ON expedientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_clientes_updated_at ON clientes;
CREATE TRIGGER update_clientes_updated_at
    BEFORE UPDATE ON clientes
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ================================================
-- VERIFICACIÓN
-- ================================================
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
