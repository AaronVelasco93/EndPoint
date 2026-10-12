/**
 * Centraliza la lectura de variables de entorno.
 * Ningún controlador necesita conocer contraseñas ni detalles del servidor SQL.
 */
const path = require('path');

// dotenv convierte el archivo .env local en variables accesibles con process.env.
require('dotenv').config({ path: path.join(__dirname, '..', '..', '.env') });

/** Lee una variable obligatoria y produce un error claro cuando falta. */
function requerida(nombre) {
  const valor = process.env[nombre];
  if (!valor) {
    throw new Error(`Falta la variable de entorno obligatoria: ${nombre}`);
  }
  return valor;
}

// Se exporta un objeto inmutable para evitar cambios accidentales en ejecución.
module.exports = Object.freeze({
  puerto: Number(process.env.PORT || 8080),
  baseDatos: {
    host: requerida('DB_HOST'),
    port: Number(process.env.DB_PORT || 3306),
    database: requerida('DB_NAME'),
    user: requerida('DB_USER'),
    password: requerida('DB_PASSWORD')
  }
});
