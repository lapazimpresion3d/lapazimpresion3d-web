# Sección privada de materiales — Lapazimpresion3d

## Flujo aprobado

1. El cliente solicita una cotización; el folio se conserva en `quiz_propuestas`.
2. Tras aceptar la propuesta, el administrador crea un proyecto vinculado a esa solicitud.
3. El administrador emite un enlace individual de acceso al área de materiales, con token aleatorio de un solo proyecto, vencimiento y revocación.
4. El cliente entrega textos y archivos en distintas sesiones; el administrador revisa y marca como recibido, por corregir o aprobado.
5. El proyecto puede pasar por preparación, recopilación, desarrollo, revisión y finalización.

## Diseño técnico

- `proyectos_cliente`: registro del proyecto aceptado; su `propuesta_id` evita duplicar datos de contacto.
- `proyecto_secciones`: textos del negocio, catálogo o servicios, horarios y otras indicaciones.
- `proyecto_archivos`: solo metadatos; el contenido privado se guardará en el R2 `COTIZACIONES_R2`, bajo un prefijo dedicado.
- Una URL privada no equivale a publicar los archivos: la API autenticará la solicitud y comprobará el proyecto antes de transmitir cualquier archivo de R2.
- Nunca guardar el token en texto claro en D1: almacenar exclusivamente un hash SHA-256; los enlaces vencen y pueden revocarse.
- Validar tipo, tamaño, cantidad y nombre de cada archivo en el servidor; no confiar en `accept` del navegador.
- Eliminar objetos de R2 cuando se eliminen materiales o proyectos. El borrado de una solicitud ligada a un proyecto debe estar bloqueado o gestionarse explícitamente.
- Los archivos no se enviarán por correo ni serán accesibles mediante un enlace público de R2.
- Mostrar avisos de privacidad, evitar indexación y no registrar tokens en logs.

## Desarrollo por etapas

**Etapa 1 — Estructura de datos:** migración `0004_proyectos_materiales.sql` y contrato del flujo. No activa aún endpoints ni carga de archivos.

**Etapa 2 — Panel administrador:** crear un proyecto desde una propuesta aceptada; generar, copiar y revocar enlace seguro; ver estado del proyecto.

**Etapa 3 — Portal cliente:** página privada con acceso validado, textos editables por secciones, guardado progresivo, lista de pendientes y confirmación de envío.

**Etapa 4 — Archivos:** imágenes y documentos en R2, límites por proyecto, miniaturas/descargas protegidas y aprobación administrativa.

**Etapa 5 — Comunicación:** notificación al administrador de nuevas entregas y aviso al cliente de materiales pendientes, sin enviar adjuntos por correo.

## Despliegue de la etapa 1

Crear respaldo de D1 y aplicar la migración en producción desde Wrangler:

```bash
npx wrangler d1 migrations apply lapazimpresion3d-quiz --remote
```

Antes de ejecutar, comprobar qué migraciones aparecen pendientes. No crear enlaces de clientes hasta publicar y verificar las etapas 2 y 3.
