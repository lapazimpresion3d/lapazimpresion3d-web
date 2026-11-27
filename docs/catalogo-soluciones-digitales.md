# Catálogo de soluciones digitales

Los precios son referencias en MXN + IVA, no oferta de contratación. Publicación del catálogo autorizada por el propietario; los enlaces de las nuevas demostraciones se incorporarán únicamente cuando estén verificados.

## Activar una demo
1. Desplegar el paquete y giro en el proyecto SaaS independiente con datos ficticios.
2. Verificar URL HTTPS y pruebas funcionales, incluyendo permisos, flujo del cliente y paneles aplicables.
3. Añadir la entrada paquete/giro al mapa `demos` de `public/js/soluciones-digitales.js`. Usar exactamente la URL verificada; marcar listaParaContratar solo después de aprobar alcance y operación.
4. Revisar textos, precios y módulos públicos. Mantener los pendientes como En desarrollo.
5. El Comal conserva su enlace histórico y no se asigna automáticamente a un paquete. Revalidar enlace principal y QR de mesa antes de fusionar.

## Pruebas antes de publicar
- En móvil (320, 375, 768 px) y escritorio: 4 tarjetas, teclado, foco, contraste, selector, sin desbordamientos.
- Probar los 4 paquetes x 8 giros: consulta lleva paquete y giro al formulario, selección modificable. Probar enlaces sin parámetros y parámetros desconocidos.
- Revisar resumen, editar y enviar a una base D1 de pruebas; confirmar folio, paquete/giro en panel privado, JSON, CSV y notificación de prueba. Confirmar compatibilidad de solicitudes anteriores sin paquete. No enviar datos de prueba a producción.
- Verificar navegación, galería, cotizaciones de llaveros, QR, resina y piezas a medida, cuestionario, redes y guía NFC.
- Verificar los enlaces históricos de El Comal desde navegador; no activar nuevas demos sin prueba funcional.
- Verificar que el despliegue previo no apunte a D1 o correo de producción. No incorporar nuevas demos sin autorización.

## Fichas y cotización adaptada
Las tarjetas enlazan a `public/paquetes-web.html`. La cotización muestra un resumen del paquete y propone funciones por tipo de sitio. El usuario puede modificarlas y agregar otras bajo cotización. Los precios y alcances son orientativos y los módulos no disponibles siguen sujetos a revisión. Los complementos, datos, privacidad, dominio, folio y panel administrativo conservan su flujo. El formulario de proyecto a medida mantiene todas las opciones compatibles. Los giros del selector precargan un tipo sugerido sin bloquear su cambio.

## Presentación simplificada
Las tarjetas no repiten el botón de consulta ni el estado de la demo. Hay un único enlace textual al detalle de paquetes y un único botón general de cotización. El selector sirve exclusivamente para explorar demostraciones y permanece oculto si no existen combinaciones verificadas. Al registrar demos, aparecen sus botones y solo los giros/paquetes con URL válida. El Comal sigue visible como ejemplo independiente. No se modifican los formularios ni el servidor.
