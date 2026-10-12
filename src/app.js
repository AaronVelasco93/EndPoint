/** Punto de entrada del microservicio de incidencias. */
const express = require('express');
const env = require('./config/env');
const pool = require('./config/database');
const rutasIncidencias = require('./routes/incidencia.routes');
const asyncHandler = require('./utils/async-handler');
const { rutaNoEncontrada, manejarError } = require('./middlewares/error.middleware');

const app = express();

// Evita publicar innecesariamente el nombre de la tecnología en los encabezados.
app.disable('x-powered-by');

// Limita el JSON para evitar recibir cuerpos excesivamente grandes.
app.use(express.json({ limit: '100kb' }));

// Ruta sencilla para comprobar API y conexión desde Docker o Postman.
app.get('/api/salud', asyncHandler(async (req, res) => {
  await pool.query('SELECT 1');
  res.json({ success: true, servicio: 'microservicio-incidencias', baseDatos: 'conectada' });
}));

// Todas las operaciones del recurso comparten este prefijo.
app.use('/api/incidencias', rutasIncidencias);

// Estos middlewares siempre deben declararse después de las rutas válidas.
app.use(rutaNoEncontrada);
app.use(manejarError);

// Escucha peticiones HTTP en el puerto configurado.
app.listen(env.puerto, () => {
  console.log(`Microservicio disponible en http://localhost:${env.puerto}`);
  console.log(`Salud: http://localhost:${env.puerto}/api/salud`);
});
