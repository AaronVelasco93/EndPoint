const express = require('express');
const controlador = require('../controllers/incidencia.controller');
const asyncHandler = require('../utils/async-handler');

const router = express.Router();

// POST transforma y guarda el JSON recibido.
router.post('/', asyncHandler(controlador.crear));

// GET devuelve todas las incidencias con sus relaciones.
router.get('/', asyncHandler(controlador.listar));

// GET con id devuelve solamente una incidencia.
router.get('/:id', asyncHandler(controlador.obtener));

// PUT modifica exclusivamente la relación con el catálogo de estatus.
router.put('/:id/estatus', asyncHandler(controlador.cambiarEstatus));

module.exports = router;
