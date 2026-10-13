# Guía de uso del microservicio y pruebas con Postman

Esta guía explica cómo funciona el microservicio de incidencias, cómo iniciarlo con Docker y cómo probar todos sus endpoints desde Postman.

## 1. Tecnologías utilizadas

- **Node.js:** ejecuta el microservicio.
- **Express:** define las rutas y atiende las peticiones HTTP.
- **MariaDB:** almacena los datos en tablas relacionadas.
- **mysql2:** conecta Node.js con MariaDB mediante consultas preparadas.
- **Docker Compose:** inicia la API y MariaDB como contenedores.
- **Postman:** funciona como cliente para probar la API.

## 2. Cómo funciona la aplicación

El recorrido general de una petición es:

```text
Postman
   |
   | Petición HTTP y JSON
   v
Ruta de Express
   v
Controlador
   v
Validador
   v
Servicio
   v
Repositorio SQL
   v
MariaDB
```

### Responsabilidad de cada capa

1. **Ruta:** relaciona una URL con un controlador.
2. **Controlador:** recibe la petición y construye la respuesta HTTP.
3. **Validador:** comprueba campos, longitudes, correo y estatus.
4. **Servicio:** aplica la transformación y coordina la transacción.
5. **Repositorio:** contiene las consultas SQL.
6. **MariaDB:** conserva los datos relacionados.

## 3. Transformación del JSON

Postman envía un objeto anidado:

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

El microservicio separa la información de esta forma:

```text
usuario                    -> tabla usuarios
ubicacion                  -> tabla ubicaciones
estatus                    -> tabla estatus
datos generales y sus ids  -> tabla incidencias
```

La operación utiliza una transacción:

1. Inicia la transacción.
2. Busca o crea al usuario.
3. Busca o crea la ubicación.
4. Obtiene el identificador del estatus.
5. Inserta la incidencia con llaves foráneas.
6. Ejecuta `commit` si todo fue correcto.
7. Ejecuta `rollback` si alguna operación falló.

## 4. Preparar las variables de entorno

Abre PowerShell en la carpeta del proyecto:

```powershell
cd C:\Users\Vinculacion\Desktop\EndPoint
```

Si todavía no existe `.env`, créalo desde la plantilla:

```powershell
Copy-Item .env.example .env
```

El archivo debe contener un solo bloque como este:

```env
PORT=8080

DB_HOST=localhost
DB_PORT=3306
DB_NAME=microservicio_incidencias
DB_USER=incidencias_user
DB_PASSWORD=una_clave_para_la_practica
```

Docker reemplaza internamente `DB_HOST` por `db`. La variable `DB_PASSWORD` también se utiliza para inicializar MariaDB en esta práctica local.

> No publiques el archivo `.env`. Está incluido en `.gitignore` porque contiene credenciales.

## 5. Iniciar la aplicación con Docker

Primero abre Docker Desktop y espera a que su motor esté disponible.

Después ejecuta:

```powershell
docker compose up -d --build
```

Comprueba los servicios:

```powershell
docker compose ps
```

El resultado debe indicar aproximadamente:

```text
incidencias_api   Up
incidencias_db    Up (healthy)
```

Para revisar los mensajes de los contenedores:

```powershell
docker compose logs -f
```

Para mostrar solamente los mensajes de MariaDB:

```powershell
docker compose logs -f db
```

Para salir de la vista de registros presiona `Ctrl + C`.

## 6. Probar con Postman paso a paso

### Prueba 1: comprobar la salud

Configura una petición:

```text
Método: GET
URL: http://localhost:8080/api/salud
```

Presiona **Send**.

Respuesta esperada:

```json
{
  "success": true,
  "servicio": "microservicio-incidencias",
  "baseDatos": "conectada"
}
```

### Prueba 2: crear una incidencia

Configura:

```text
Método: POST
URL: http://localhost:8080/api/incidencias
```

En Postman selecciona:

```text
Body -> raw -> JSON
```

Utiliza un folio que no haya sido registrado:

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

Respuesta esperada con código `201 Created`:

```json
{
  "success": true,
  "mensaje": "Incidencia registrada correctamente.",
  "data": {
    "id": 2,
    "folio": "INC-001",
    "estatus": "PENDIENTE"
  }
}
```

El identificador puede ser diferente según los registros existentes.

### Prueba 3: consultar todas las incidencias

```text
Método: GET
URL: http://localhost:8080/api/incidencias
```

La respuesta contiene `total` y un arreglo `data`.

```json
{
  "success": true,
  "total": 1,
  "data": []
}
```

Cada elemento muestra nuevamente el usuario y la ubicación como objetos anidados, aunque en MariaDB estén guardados en tablas diferentes.

### Prueba 4: consultar una incidencia

```text
Método: GET
URL: http://localhost:8080/api/incidencias/1
```

Sustituye `1` por el identificador recibido al crear la incidencia.

Cuando el registro no existe, la API responde con código `404`:

```json
{
  "success": false,
  "mensaje": "Incidencia no encontrada."
}
```

### Prueba 5: cambiar el estatus

```text
Método: PUT
URL: http://localhost:8080/api/incidencias/1/estatus
```

En `Body -> raw -> JSON` escribe:

```json
{
  "estatus": "EN_PROCESO"
}
```

Respuesta esperada:

```json
{
  "success": true,
  "mensaje": "Estatus actualizado correctamente.",
  "data": {
    "id": 1,
    "estatus": "EN_PROCESO"
  }
}
```

Los estatus permitidos son:

```text
PENDIENTE
EN_PROCESO
ATENDIDA
CANCELADA
```

Realiza nuevamente el `GET` de la incidencia para comprobar el cambio.

## 7. Importar la colección de Postman

La colección preparada está en:

```text
postman/Microservicio_Incidencias.postman_collection.json
```

En Postman:

1. Presiona **Import**.
2. Selecciona **File**.
3. Elige el archivo de la colección.
4. Abre **Microservicio de incidencias**.
5. Ejecuta las peticiones en el orden numerado.

La variable de la colección `baseUrl` contiene:

```text
http://localhost:8080
```

## 8. Consultar directamente MariaDB

Entra al contenedor:

```powershell
docker exec -it incidencias_db mariadb -u incidencias_user -p
```

Escribe el valor de `DB_PASSWORD` cuando MariaDB solicite la contraseña.

Selecciona la base:

```sql
USE microservicio_incidencias;
```

Consulta las tablas:

```sql
SELECT * FROM usuarios;
SELECT * FROM ubicaciones;
SELECT * FROM estatus;
SELECT * FROM incidencias;
```

Consulta toda la información relacionada:

```sql
SELECT
    i.id_incidencia,
    i.folio,
    u.nombre AS usuario,
    u.correo,
    ub.edificio,
    ub.salon,
    e.nombre AS estatus,
    i.tipo,
    i.descripcion,
    i.fecha
FROM incidencias AS i
INNER JOIN usuarios AS u
    ON u.id_usuario = i.id_usuario
INNER JOIN ubicaciones AS ub
    ON ub.id_ubicacion = i.id_ubicacion
INNER JOIN estatus AS e
    ON e.id_estatus = i.id_estatus;
```

Para cerrar MariaDB:

```sql
exit;
```

## 9. Códigos HTTP utilizados

| Código | Significado |
|---|---|
| `200` | Consulta o actualización correcta |
| `201` | Incidencia creada correctamente |
| `400` | Identificador o JSON incorrecto |
| `404` | Ruta o incidencia inexistente |
| `409` | Folio duplicado |
| `422` | Datos válidos como JSON, pero incorrectos para el sistema |
| `500` | Error interno no controlado |

## 10. Solución de problemas

### MariaDB aparece como `Restarting`

Consulta los registros:

```powershell
docker compose logs db
```

Comprueba que `.env` tenga `DB_USER` y `DB_PASSWORD`, sin repetir los nombres varias veces.

Después recrea los contenedores:

```powershell
docker compose up -d --build --force-recreate
```

### La ruta de salud no responde

Comprueba el estado:

```powershell
docker compose ps
```

Después revisa la API:

```powershell
docker compose logs api
```

### Error de folio duplicado

El campo `folio` es único. Cambia `INC-001` por otro valor, por ejemplo:

```json
{
  "folio": "INC-002"
}
```

### Reiniciar la práctica desde cero

El siguiente comando elimina también el volumen y todos los datos guardados:

```powershell
docker compose down -v
docker compose up -d --build
```

> Utiliza `down -v` solamente cuando realmente quieras borrar la base de la práctica.

## 11. Detener el proyecto

Para detener los contenedores sin borrar la información:

```powershell
docker compose down
```

Los datos permanecerán dentro del volumen `incidencias_data`.
