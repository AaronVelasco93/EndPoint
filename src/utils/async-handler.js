/**
 * Envuelve controladores asíncronos y entrega sus errores al middleware final.
 * Así se evita repetir try/catch en cada endpoint.
 */
function asyncHandler(controlador) {
  return (req, res, next) => Promise.resolve(controlador(req, res, next)).catch(next);
}

module.exports = asyncHandler;
