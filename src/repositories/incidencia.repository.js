/**
 * Repositorio: concentra exclusivamente el lenguaje SQL.
 * Recibe una conexión en las operaciones de escritura para participar en
 * la misma transacción coordinada por el servicio.
 */

async function buscarOCrearUsuario(conexion, usuario) {
  /*
   * Si el correo ya existe, LAST_INSERT_ID devuelve su id.
   * Si no existe, INSERT crea el usuario y también devuelve el nuevo id.
   */
  const sql = `
    INSERT INTO usuarios (nombre, correo)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      id_usuario = LAST_INSERT_ID(id_usuario),
      nombre = VALUES(nombre)
  `;
  const [resultado] = await conexion.execute(sql, [usuario.nombre, usuario.correo]);
  return resultado.insertId;
}

async function buscarOCrearUbicacion(conexion, ubicacion) {
  const sql = `
    INSERT INTO ubicaciones (edificio, salon)
    VALUES (?, ?)
    ON DUPLICATE KEY UPDATE
      id_ubicacion = LAST_INSERT_ID(id_ubicacion)
  `;
  const [resultado] = await conexion.execute(sql, [ubicacion.edificio, ubicacion.salon]);
  return resultado.insertId;
}

async function buscarEstatus(conexion, nombre) {
  const [filas] = await conexion.execute(
    'SELECT id_estatus FROM estatus WHERE nombre = ?',
    [nombre]
  );
  return filas[0]?.id_estatus;
}

async function insertarIncidencia(conexion, datos, relaciones) {
  const sql = `
    INSERT INTO incidencias
      (folio, id_usuario, id_ubicacion, id_estatus, tipo, descripcion)
    VALUES (?, ?, ?, ?, ?, ?)
  `;
  const valores = [
    datos.folio,
    relaciones.idUsuario,
    relaciones.idUbicacion,
    relaciones.idEstatus,
    datos.tipo,
    datos.descripcion
  ];
  const [resultado] = await conexion.execute(sql, valores);
  return resultado.insertId;
}

// JOIN convierte nuevamente las tablas relacionadas en una respuesta legible.
const CONSULTA_COMPLETA = `
  SELECT
    i.id_incidencia AS id,
    i.folio,
    u.id_usuario,
    u.nombre AS usuario_nombre,
    u.correo AS usuario_correo,
    ub.id_ubicacion,
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
`;

async function listar(pool) {
  const [filas] = await pool.query(`${CONSULTA_COMPLETA} ORDER BY i.id_incidencia DESC`);
  return filas;
}

async function obtenerPorId(pool, id) {
  const [filas] = await pool.execute(
    `${CONSULTA_COMPLETA} WHERE i.id_incidencia = ?`,
    [id]
  );
  return filas[0];
}

async function actualizarEstatus(conexion, id, idEstatus) {
  const [resultado] = await conexion.execute(
    'UPDATE incidencias SET id_estatus = ? WHERE id_incidencia = ?',
    [idEstatus, id]
  );
  return resultado.affectedRows;
}

module.exports = {
  buscarOCrearUsuario,
  buscarOCrearUbicacion,
  buscarEstatus,
  insertarIncidencia,
  listar,
  obtenerPorId,
  actualizarEstatus
};
