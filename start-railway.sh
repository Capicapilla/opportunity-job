#!/bin/bash
echo "=== INICIANDO APLICACIÓN EN RAILWAY ==="
echo "Directorio actual: $(pwd)"
echo "Contenido del directorio:"
ls -la

echo "=== VERIFICANDO CARPETA API ==="
if [ -d "api" ]; then
    echo "✅ Carpeta api encontrada"
    cd api
    echo "Directorio actual: $(pwd)"
    echo "Contenido de api:"
    ls -la
    
    echo "=== EJECUTANDO DIAGNÓSTICO ==="
    node test-railway.js
else
    echo "❌ Carpeta api NO encontrada"
    echo "Estructura del proyecto:"
    find . -type d -name "api" 2>/dev/null
fi
