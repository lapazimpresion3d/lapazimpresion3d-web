# Catálogo de soluciones digitales (rama de revisión)

Los precios son referencias en MXN + IVA, no oferta de contratación. No fusionar a main hasta aprobación comercial y pruebas de vista previa aislada.

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
- Verificar que el despliegue previo no apunte a D1 o correo de producción. No fusionar sin autorización.
