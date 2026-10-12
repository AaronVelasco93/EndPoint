const ErrorApi = require('../utils/error-api');

// Únicos valores que acepta la regla de negocio del catálogo.
const ESTATUS_PERMITIDOS = ['PENDIENTE', 'EN_PROCESO', 'ATENDIDA', 'CANCELADA'];

/** Convierte un valor en texto limpio sin aceptar números u objetos. */
function texto(valor) {
  return typeof valor === 'string' ? valor.trim() : '';
}

/** Agrega un error cuando un texto está vacío o excede su columna SQL. */
function validarTexto(errores, valor, campo, maximo) {
  if (!valor) errores.push(`${campo} es obligatorio.`);
  else if (valor.length > maximo) errores.push(`${campo} admite máximo ${maximo} caracteres.`);
}

/**
 * Valida y transforma el JSON anidado a un objeto interno uniforme.
 * Este es el primer punto donde ocurre la transformación de datos.
 */
function validarCreacion(cuerpo) {
  const datos = {
    folio: texto(cuerpo.folio),
    usuario: {
      nombre: texto(cuerpo.usuario?.nombre),
      correo: texto(cuerpo.usuario?.correo).toLowerCase()
    },
    ubicacion: {
      edificio: texto(cuerpo.ubicacion?.edificio),
      salon: texto(cuerpo.ubicacion?.salon)
    },
    tipo: texto(cuerpo.tipo),
    descripcion: texto(cuerpo.descripcion),
    estatus: texto(cuerpo.estatus).toUpperCase()
  };

  const errores = [];
  validarTexto(errores, datos.folio, 'folio', 30);
  validarTexto(errores, datos.usuario.nombre, 'usuario.nombre', 100);
  validarTexto(errores, datos.usuario.correo, 'usuario.correo', 120);
  validarTexto(errores, datos.ubicacion.edificio, 'ubicacion.edificio', 50);
  validarTexto(errores, datos.ubicacion.salon, 'ubicacion.salon', 50);
  validarTexto(errores, datos.tipo, 'tipo', 100);
  validarTexto(errores, datos.descripcion, 'descripcion', 255);

  // Una expresión sencilla comprueba la estructura general del correo.
  if (datos.usuario.correo && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.usuario.correo)) {
    errores.push('usuario.correo no tiene un formato válido.');
  }

  if (!ESTATUS_PERMITIDOS.includes(datos.estatus)) {
    errores.push(`estatus debe ser uno de: ${ESTATUS_PERMITIDOS.join(', ')}.`);
  }

  if (errores.length) {
    throw new ErrorApi(422, 'El JSON contiene datos no válidos.', errores);
  }

  return datos;
}

/** Valida el cuerpo reducido utilizado para cambiar únicamente el estatus. */
function validarCambioEstatus(cuerpo) {
  const estatus = texto(cuerpo.estatus).toUpperCase();
  if (!ESTATUS_PERMITIDOS.includes(estatus)) {
    throw new ErrorApi(422, 'Estatus no válido.', ESTATUS_PERMITIDOS);
  }
  return estatus;
}

module.exports = { validarCreacion, validarCambioEstatus, ESTATUS_PERMITIDOS };
