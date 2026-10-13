# Microservicio de incidencias con Node.js

Proyecto educativo que recibe un JSON anidado, valida sus datos, los transforma en registros relacionados y los almacena en MariaDB/MySQL. No incluye interfaz gráfica: se prueba con Postman.

La explicación detallada para iniciar Docker y realizar las pruebas está en
[`GUIA_USO_POSTMAN.md`](GUIA_USO_POSTMAN.md).

## Tecnologías

- Node.js y Express para la API HTTP.
- `mysql2` para consultas preparadas y transacciones.
- MariaDB 11.4 o MySQL compatible.
- Docker Compose para iniciar API y base de datos.
- Postman como cliente de prueba.

## Estructura

```text
EndPoint/
|-- database/schema.sql             Modelo relacional y catálogo
|-- postman/                         Colección lista para importar
|-- src/
|   |-- config/                      Variables y conexión SQL
|   |-- controllers/                 Entrada y salida HTTP
|   |-- middlewares/                 Errores y rutas inexistentes
|   |-- repositories/                Consultas SQL
|   |-- routes/                      Definición de endpoints
|   |-- services/                    Transformación y transacciones
|   |-- utils/                       Utilidades compartidas
|   |-- validators/                  Validación del JSON
|   `-- app.js                       Punto de entrada
|-- .env.example                     Plantilla sin secretos
|-- docker-compose.yml
|-- Dockerfile
`-- package.json
```

## Flujo educativo

```text
Postman
   | JSON anidado
   v
Ruta -> Controlador -> Validador -> Servicio
                                  | transacción
                                  v
                              Repositorio
                                  | SQL
                                  v
         usuarios + ubicaciones + estatus + incidencias
```

El archivo clave es `src/services/incidencia.service.js`. Su función `crear()` coordina la transformación:

1. Valida el JSON.
2. Inicia una transacción.
3. Busca o crea al usuario por correo.
4. Busca o crea la ubicación por edificio y salón.
5. Obtiene el identificador del estatus.
6. Inserta la incidencia usando las tres llaves foráneas.
7. Confirma todos los cambios con `commit`.
8. Ante un error, deshace todo con `rollback`.

## Opción A: ejecutar con Docker

1. Copia `.env.example` con el nombre `.env`.
2. Configura `DB_USER` y `DB_PASSWORD`. Docker reutiliza estos valores para
   crear el usuario de MariaDB; en esta práctica local también usa
   `DB_PASSWORD` como contraseña inicial de `root`.
3. Inicia los contenedores:

```bash
docker compose up -d --build
```

4. Comprueba el estado:

```bash
docker compose ps
docker compose logs -f api
```

5. Abre `http://localhost:8080/api/salud`.

Para detenerlos:

```bash
docker compose down
```

`docker compose down -v` también borra la base almacenada; úsalo solamente cuando quieras reiniciar la práctica.

## Opción B: ejecutar con MariaDB local

1. Ejecuta `database/schema.sql` en MariaDB o phpMyAdmin.
2. Copia `.env.example` como `.env` y coloca tus credenciales locales.
3. Instala e inicia:

```bash
npm install
npm start
```

En Windows también puedes abrir `iniciar-local.bat`.

## Endpoints

| Método | Ruta | Operación |
|---|---|---|
| GET | `/api/salud` | Comprueba API y base |
| POST | `/api/incidencias` | Valida, transforma y registra |
| GET | `/api/incidencias` | Consulta todas |
| GET | `/api/incidencias/:id` | Consulta una |
| PUT | `/api/incidencias/:id/estatus` | Cambia el estatus |

## JSON para registrar

```json
{
  "folio": "INC-001",
  "usuario": {
    "nombre": "Juan Pérez",
    "correo": "juan@correo.com"
  },
  "ubicacion": {
    "edificio": "A4",
    "salon": "A401"
  },
  "tipo": "Equipo de cómputo",
  "descripcion": "La computadora no enciende",
  "estatus": "PENDIENTE"
}
```

Respuesta con código HTTP `201`:

```json
{
  "success": true,
  "mensaje": "Incidencia registrada correctamente.",
  "data": {
    "id": 1,
    "folio": "INC-001",
    "estatus": "PENDIENTE"
  }
}
```

## Cambiar el estatus

```json
{
  "estatus": "EN_PROCESO"
}
```

Valores permitidos: `PENDIENTE`, `EN_PROCESO`, `ATENDIDA` y `CANCELADA`.

## Probar en Postman

Importa `postman/Microservicio_Incidencias.postman_collection.json`. La colección incluye las cinco peticiones en el orden sugerido.

## Códigos HTTP utilizados

- `200`: consulta o actualización correcta.
- `201`: incidencia creada.
- `400`: identificador incorrecto o JSON mal formado.
- `404`: ruta o incidencia inexistente.
- `409`: folio duplicado.
- `422`: datos de entrada no válidos.
- `500`: error interno no controlado.

## Actividad para alumnos

Agrega el endpoint `GET /api/incidencias/estatus/:nombre` para filtrar incidencias. Debe validar el catálogo, usar una consulta preparada y conservar la separación entre ruta, controlador, servicio y repositorio.
