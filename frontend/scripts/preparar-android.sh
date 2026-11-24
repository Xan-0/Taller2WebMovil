#!/usr/bin/env bash
# Prepara el proyecto Android (idempotente): lo crea si no existe, añade permisos y genera ícono/splash.
set -euo pipefail
cd "$(dirname "$0")/.."

if [ ! -d android ]; then
  echo ">> Creando plataforma Android (cap add android)"
  npx cap add android
fi

MANIFEST=android/app/src/main/AndroidManifest.xml
for perm in INTERNET CAMERA ACCESS_COARSE_LOCATION ACCESS_FINE_LOCATION; do
  if ! grep -q "android.permission.$perm" "$MANIFEST"; then
    echo ">> Agregando permiso $perm"
    sed -i "s#</manifest>#    <uses-permission android:name=\"android.permission.$perm\" />\n</manifest>#" "$MANIFEST"
  fi
done

echo ">> Generando ícono y splash desde resources/"
npx capacitor-assets generate --android
