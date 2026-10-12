/**
 * El controlador traduce HTTP a llamadas del servicio.
 * No contiene SQL ni reglas de transformación.
 */
const servicio = require('../services/incidencia.service');
const ErrorApi = require('../utils/error-api');

/** Valida que el parámetro de la URL sea un entero positivo. */
function obtenerId(req) {
  const id = Number(req.params.id);
  if (!Number.isInteger(id) || id <= 0) {
    throw new ErrorApi(400, 'El id debe ser un número entero positivo.');
  }
  return id;
}

async function crear(req, res) {
  const resultado = await servicio.crear(req.body);
  res.status(201).json({
    success: true,
    mensaje: 'Incidencia registrada correctamente.',
    data: resultado
  });
}

async function listar(req, res) {
  const incidencias = await servicio.listar();
  res.json({ success: true, total: incidencias.length, data: incidencias });
}

async function obtener(req, res) {
  const incidencia = await servicio.obtener(obtenerId(req));
  res.json({ success: true, data: incidencia });
}

async function cambiarEstatus(req, res) {
  const resultado = await servicio.cambiarEstatus(obtenerId(req), req.body);
  res.json({
    success: true,
    mensaje: 'Estatus actualizado correctamente.',
    data: resultado
  });
}

module.exports = { crear, listar, obtener, cambiarEstatus };
