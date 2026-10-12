const ErrorApi = require('../utils/error-api');

/** Respuesta para rutas que no están definidas. */
function rutaNoEncontrada(req, res) {
  res.status(404).json({
    success: false,
    mensaje: `No existe la ruta ${req.method} ${req.originalUrl}.`
  });
}

/**
 * Convierte cualquier excepción en JSON sin revelar consultas ni contraseñas.
 * Los cuatro parámetros son necesarios para que Express lo reconozca como
 * middleware de errores.
 */
function manejarError(error, req, res, next) {
  // express.json genera este error cuando el cuerpo no contiene JSON válido.
  if (error.type === 'entity.parse.failed') {
    return res.status(400).json({
      success: false,
      mensaje: 'El cuerpo de la petición no contiene un JSON válido.'
    });
  }

  // Un folio repetido produce la restricción UNIQUE de MariaDB.
  if (error.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({
      success: false,
      mensaje: 'El folio o dato único ya se encuentra registrado.'
    });
  }

  if (error instanceof ErrorApi) {
    return res.status(error.codigoHttp).json({
      success: false,
      mensaje: error.message,
      ...(error.detalles && { detalles: error.detalles })
    });
  }

  // El detalle completo queda en la terminal para ayudar al desarrollador.
  console.error(error);
  return res.status(500).json({
    success: false,
    mensaje: 'Ocurrió un error interno en el microservicio.'
  });
}

module.exports = { rutaNoEncontrada, manejarError };
