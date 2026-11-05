-- usuarios
CREATE TABLE usuarios (
    uid SERIAL PRIMARY KEY,
    nombre text NOT NULL,
    password_hash text NOT NULL,
    correo text
);

-- tareas
CREATE TABLE tareas (
    uid INTEGER NOT NULL REFERENCES usuarios(uid),
    titulo text NOT NULL,
    descripcion text,
    estado text NOT NULL DEFAULT 'por hacer'
    CHECK (LOWER(estado) IN ('por hacer', 'en progreso', 'completada')),
    prioridad text
    CHECK (LOWER(prioridad) IN ('baja', 'media', 'alta') OR prioridad = NULL)
);