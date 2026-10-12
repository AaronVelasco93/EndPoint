#!/usr/bin/env sh
# Detiene el script si un comando falla.
set -e

# Cambia a la carpeta del proyecto sin importar desde dónde se invoque.
CARPETA_PROYECTO=$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)
cd "$CARPETA_PROYECTO"

# Instala dependencias únicamente la primera vez.
if [ ! -d node_modules ]; then
  npm install
fi

# Inicia el microservicio con el archivo .env local.
npm start
