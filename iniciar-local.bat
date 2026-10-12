@echo off
REM Se coloca en la carpeta donde está guardado este archivo.
cd /d "%~dp0"

REM Instala las dependencias cuando todavía no existe node_modules.
if not exist "node_modules" call npm.cmd install

REM Inicia el microservicio usando las variables del archivo .env.
call npm.cmd start

REM Mantiene la terminal abierta si ocurre algún error.
pause
