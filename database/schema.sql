-- Crea la base si el script se ejecuta manualmente fuera de Docker.
CREATE DATABASE IF NOT EXISTS microservicio_incidencias
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE microservicio_incidencias;

-- Almacena una sola vez los datos de cada usuario.
CREATE TABLE IF NOT EXISTS usuarios (
    id_usuario INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(120) NOT NULL UNIQUE,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- La restricción UNIQUE evita repetir el mismo edificio y salón.
CREATE TABLE IF NOT EXISTS ubicaciones (
    id_ubicacion INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    edificio VARCHAR(50) NOT NULL,
    salon VARCHAR(50) NOT NULL,
    creado_en TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_ubicacion UNIQUE (edificio, salon)
) ENGINE=InnoDB;

-- Catálogo controlado de estados permitidos.
CREATE TABLE IF NOT EXISTS estatus (
    id_estatus INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(30) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- Relaciona usuario, ubicación y estatus mediante llaves foráneas.
CREATE TABLE IF NOT EXISTS incidencias (
    id_incidencia INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    folio VARCHAR(30) NOT NULL UNIQUE,
    id_usuario INT UNSIGNED NOT NULL,
    id_ubicacion INT UNSIGNED NOT NULL,
    id_estatus INT UNSIGNED NOT NULL,
    tipo VARCHAR(100) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    fecha DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_incidencia_usuario
        FOREIGN KEY (id_usuario) REFERENCES usuarios(id_usuario),
    CONSTRAINT fk_incidencia_ubicacion
        FOREIGN KEY (id_ubicacion) REFERENCES ubicaciones(id_ubicacion),
    CONSTRAINT fk_incidencia_estatus
        FOREIGN KEY (id_estatus) REFERENCES estatus(id_estatus)
) ENGINE=InnoDB;

-- Inserta el catálogo inicial sin duplicarlo cuando se repite el script.
INSERT IGNORE INTO estatus (nombre) VALUES
    ('PENDIENTE'),
    ('EN_PROCESO'),
    ('ATENDIDA'),
    ('CANCELADA');

-- Consulta educativa para observar el JSON transformado en relaciones.
SELECT
    i.id_incidencia,
    i.folio,
    u.nombre AS usuario,
    u.correo,
    ub.edificio,
    ub.salon,
    e.nombre AS estatus,
    i.tipo,
    i.descripcion,
    i.fecha
FROM incidencias AS i
INNER JOIN usuarios AS u ON u.id_usuario = i.id_usuario
INNER JOIN ubicaciones AS ub ON ub.id_ubicacion = i.id_ubicacion
INNER JOIN estatus AS e ON e.id_estatus = i.id_estatus
ORDER BY i.id_incidencia DESC;
