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

## Condiciones comerciales aprobadas
Se conservan las cuatro tarifas: implementación desde $750/$1,500/$2,500/$3,500 MXN; mensualidades estándar $149/$299/$449/$649 MXN, más IVA. Las fichas incluyen condiciones generales y el formulario las resume conservando las condiciones previas de garantía (60 días), atención ordinaria de sistemas de pedidos (hasta 2 h/mes no acumulables en plan básico), dominio y autorización previa de cambios. Una suscripción por establecimiento; implementación configurable, alojamiento, mantenimiento, seguridad, corrección de errores y orientación inicial incluidos según alcance. Personalizaciones, hardware, dominio propio, terceros, capacitación y visitas adicionales bajo cotización. La propuesta individual confirma alcance y disponibilidad. No se alteran API, registro de solicitudes ni panel privado.

## Cotización centrada en el paquete
Se elimina la selección independiente de tipo de página. El campo libre de giro permanece únicamente en datos del negocio. Las características se organizan por paquete y las funciones específicas (menú, catálogo, pedidos, agenda, inventario, etc.) se seleccionan según necesidad, sin inferir el giro. Las funciones adicionales permanecen en un panel desplegable. La API admite solicitudes nuevas sin tipo_pagina y mantiene validación de tipos históricos; el panel y CSV conservan los datos anteriores. No se modifica D1 ni se cambia el flujo de folio y correo.

## Selección dinámica de paquete
Todas las 25 casillas se muestran juntas y conservan su orden. La selección manual de un paquete carga sus funciones iniciales; las modificaciones posteriores buscan el paquete estándar de menor precio que cubre las funciones elegidas, sin añadir otras casillas. El inventario avanzado cubre el básico. Las dependencias activan el carrito al seleccionar una función que lo requiere y se retiran al desmarcar el carrito. Los pagos con tarjeta se cotizan aparte. Elegir Proyecto a medida directamente mantiene ese modo personalizado. Se conservan tarifas, API y datos de solicitudes.
