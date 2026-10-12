const pool = require('../config/database');
const repositorio = require('../repositories/incidencia.repository');
const ErrorApi = require('../utils/error-api');
const { validarCreacion, validarCambioEstatus } = require('../validators/incidencia.validator');

/** Convierte las columnas planas del JOIN en el JSON anidado de la API. */
function transformarSalida(fila) {
  return {
    id: fila.id,
    folio: fila.folio,
    usuario: {
      id: fila.id_usuario,
      nombre: fila.usuario_nombre,
      correo: fila.usuario_correo
    },
    ubicacion: {
      id: fila.id_ubicacion,
      edificio: fila.edificio,
      salon: fila.salon
    },
    tipo: fila.tipo,
    descripcion: fila.descripcion,
    estatus: fila.estatus,
    fecha: fila.fecha
  };
}

/**
 * Caso de uso principal: transforma un JSON en cuatro registros relacionados.
 * La transacción garantiza que se guarde todo o no se guarde nada.
 */
async function crear(cuerpo) {
  const datos = validarCreacion(cuerpo);
  const conexion = await pool.getConnection();

  try {
    // PASO 1: comienza la unidad de trabajo atómica.
    await conexion.beginTransaction();

    // PASO 2: busca o crea las entidades anidadas del JSON.
    const idUsuario = await repositorio.buscarOCrearUsuario(conexion, datos.usuario);
    const idUbicacion = await repositorio.buscarOCrearUbicacion(conexion, datos.ubicacion);
    const idEstatus = await repositorio.buscarEstatus(conexion, datos.estatus);

    if (!idEstatus) {
      throw new ErrorApi(422, `El estatus ${datos.estatus} no existe en el catálogo.`);
    }

    // PASO 3: la incidencia guarda las llaves foráneas obtenidas.
    const id = await repositorio.insertarIncidencia(conexion, datos, {
      idUsuario,
      idUbicacion,
      idEstatus
    });

    // PASO 4: confirma juntas las operaciones anteriores.
    await conexion.commit();
    return { id, folio: datos.folio, estatus: datos.estatus };
  } catch (error) {
    // Si falla cualquier paso, MariaDB revierte toda la transformación.
    await conexion.rollback();
    throw error;
  } finally {
    // Devuelve la conexión al pool incluso cuando se produjo un error.
    conexion.release();
  }
}

/** Consulta todas las incidencias y reconstruye objetos JSON anidados. */
async function listar() {
  const filas = await repositorio.listar(pool);
  return filas.map(transformarSalida);
}

/** Consulta una incidencia o produce un error HTTP 404. */
async function obtener(id) {
  const fila = await repositorio.obtenerPorId(pool, id);
  if (!fila) throw new ErrorApi(404, 'Incidencia no encontrada.');
  return transformarSalida(fila);
}

/** Cambia únicamente el estatus utilizando el catálogo relacional. */
async function cambiarEstatus(id, cuerpo) {
  const estatus = validarCambioEstatus(cuerpo);
  const conexion = await pool.getConnection();

  try {
    await conexion.beginTransaction();
    const idEstatus = await repositorio.buscarEstatus(conexion, estatus);
    if (!idEstatus) throw new ErrorApi(422, 'El estatus no existe en el catálogo.');

    const modificados = await repositorio.actualizarEstatus(conexion, id, idEstatus);
    if (!modificados) throw new ErrorApi(404, 'Incidencia no encontrada.');

    await conexion.commit();
    return { id, estatus };
  } catch (error) {
    await conexion.rollback();
    throw error;
  } finally {
    conexion.release();
  }
}

module.exports = { crear, listar, obtener, cambiarEstatus };
