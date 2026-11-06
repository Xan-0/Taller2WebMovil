-- usuarios (order by uid)
-- se considera la posibilidad de incluir correo y/o alguna configuracion
CREATE TABLE usuarios (
    uid SERIAL PRIMARY KEY,
    nombre text NOT NULL,
    password_hash text NOT NULL,
);


-- tareas diarias (order by fecha, fin_minutos = inicio_minutos + duracion_minutos)
-- se considera la posibilidad de incluir categorias para las tareas
CREATE TABLE tareas (
    uid INTEGER NOT NULL REFERENCES usuarios(uid),
    titulo text NOT NULL,
    descripcion text,
    fecha text NOT NULL DEFAULT now()::date::text,
    inicio_minutos integer NOT NULL DEFAULT 0,
    duracion_minutos text NOT NULL DEFAULT 90,

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
    CHECK (LOWER(prioridad) IN ('baja', 'media', 'alta') OR prioridad = NULL)
);