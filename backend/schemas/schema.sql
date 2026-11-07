-- usuarios (order by uid)
-- se considera la posibilidad de incluir correo y/o alguna configuracion
CREATE TABLE usuarios (
    uid SERIAL PRIMARY KEY,
    nombre text UNIQUE NOT NULL,
    password_hash text NOT NULL /*,
    correo text UNIQUE,
    configuracion JSONB DEFAULT '{}'::jsonb */
);


-- tareas diarias (order by fecha, inicio_minutos)
-- se considera la posibilidad de incluir categorias para las tareas
CREATE TABLE tareas (
    id SERIAL PRIMARY KEY,
    uid INTEGER NOT NULL REFERENCES usuarios(uid),
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
    
    prioridad text
    CHECK (LOWER(prioridad) IN ('baja', 'media', 'alta') OR prioridad IS NULL) /*,

    categoria text DEFAULT 'general'
    CHECK (LOWER(categoria) IN ('general', 'trabajo', 'estudio') OR categoria IS NULL)
    */
);