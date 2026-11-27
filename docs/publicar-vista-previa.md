# Publicar vista previa visual independiente
Rama: desarrollo/catalogo-soluciones-digitales. No fusionar a main.
El Worker de revisión `lapazimpresion3d-preview` utiliza `wrangler.preview.json` y `src/preview.mjs` exclusivamente. No tiene D1, correo, secretos de producción, dominios propios ni rutas del sitio comercial. Bloquea API, paneles internos y métodos de escritura; no prueba operaciones reales. El enlace de inicio abre modo revisión de demos automáticamente y muestra un aviso de solo lectura. Los botones abren las demostraciones externas aún pendientes de validación; no introducir datos reales.
## Publicación manual con Wrangler
En una copia del repositorio (Windows PowerShell o terminal):
```sh
git fetch origin
git switch desarrollo/catalogo-soluciones-digitales
git pull --ff-only origin desarrollo/catalogo-soluciones-digitales
npx wrangler login
npx wrangler deploy --config wrangler.preview.json
```
Si la rama no existe localmente: git switch --track origin/desarrollo/catalogo-soluciones-digitales.
Usar la URL workers.dev que Wrangler devuelva, no asumir que ya existe. Añadir /?revision-demos=1#paginas-web para acceder al escaparate.
No ejecutar wrangler deploy sin --config wrangler.preview.json; el archivo wrangler.json corresponde a producción.
## Verificación
node --test tests/preview-aislada.test.mjs tests/escaparate-demos.test.cjs
Tras publicar, comprobar aviso, cinco portadas, selector, botones, acceso bloqueado a /api y /admin, y ausencia de cambios en producción. La revisión visual y los flujos de El Comal siguen pendientes. No se ha ejecutado un despliegue remoto desde ChatGPT: falta acceso autorizado a Cloudflare.
