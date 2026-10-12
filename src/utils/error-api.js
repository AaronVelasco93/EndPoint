/** Error controlado que conserva un código HTTP y detalles opcionales. */
class ErrorApi extends Error {
  constructor(codigoHttp, mensaje, detalles = undefined) {
    super(mensaje);
    this.name = 'ErrorApi';
    this.codigoHttp = codigoHttp;
    this.detalles = detalles;
  }
}

module.exports = ErrorApi;
