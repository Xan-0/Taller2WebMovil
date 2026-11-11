-- usuarios (order by uid)
CREATE TABLE usuarios (
    uid SERIAL PRIMARY KEY,
    nombre text UNIQUE NOT NULL,
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    configuracion JSONB NOT NULL DEFAULT
    ('
    {"agitar_para_escanear": true}
    ')::jsonb
);


-- tareas diarias (order by fecha, inicio_minutos)
CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    uid INTEGER NOT NULL REFERENCES usuarios(uid) ON DELETE CASCADE,
    titulo text NOT NULL,
    descripcion text,
    fecha text NOT NULL DEFAULT now()::date::text,
    inicio_minutos integer NOT NULL DEFAULT 0,
    duracion_minutos integer NOT NULL DEFAULT 90,

    CHECK (
        inicio_minutos >= 0
        AND
        duracion_minutos >= 1
        AND
        (inicio_minutos + duracion_minutos) < 1440
    ),

    estado text NOT NULL DEFAULT 'por hacer'
    CHECK (LOWER(estado) IN ('por hacer', 'en progreso', 'completada')),
    
    prioridad text DEFAULT 'media'
    CHECK (LOWER(prioridad) IN ('baja', 'media', 'alta') OR prioridad IS NULL),

    categoria text DEFAULT 'general'
    CHECK (LOWER(categoria) IN ('general', 'trabajo', 'estudio') OR categoria IS NULL)
);


-- eventos reales (order by fecha_inicio)
CREATE TABLE eventos (
    id SERIAL PRIMARY KEY,
    usuario_host INTEGER NOT NULL REFERENCES usuarios(uid) ON DELETE CASCADE,
    nombre text NOT NULL,
    descripcion text,
    distancia_maxima_metros NUMERIC(10,1) NOT NULL DEFAULT 200
    CHECK (distancia_maxima_metros >= 10)

    ubicacion_url text NOT NULL,
    latitud NUMERIC(10, 8) NOT NULL,    -- Para validar la distancia real por GPS
    longitud NUMERIC(11, 8) NOT NULL,   -- Para validar la distancia real por GPS
    
    fecha_inicio text NOT NULL DEFAULT now()::date::text,
    duracion_dias integer NOT NULL DEFAULT 1
    CHECK (duracion_dias >= 1)
);

-- para que un usuario asista a un evento (con control de duplicados)
CREATE TABLE asistencias (
    id_evento INTEGER NOT NULL REFERENCES eventos(id) ON DELETE CASCADE,
    uid INTEGER NOT NULL REFERENCES usuarios(uid) ON DELETE CASCADE,

    fecha_registro TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id_evento, uid) -- Evita que un usuario se inscriba dos veces al mismo evento
);