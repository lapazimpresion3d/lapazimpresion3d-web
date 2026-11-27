# Escaparate multicomercio 38.3 — revisión
Base comercial 097988b; reutiliza tarjetas de 8c89c4c. Origen de recursos: prueba-cloudflare/desarrollo 523079db58d6f47c6ffd79ada72cc32d8d5b16a6.
- Cinco portadas WebP y cinco logotipos SVG locales, originales con hashes coincidentes. El banner de El Comal conserva sus 414 KB; optimización adicional pendiente.
- URL base central en public/js/demos-config.js. No se usa dominio futuro ni se modifica DNS.
- Vista previa: añadir ?revision-demos=1#paginas-web a la URL de preview. Permite explorar 20 pares con sus dos enlaces como revisión no verificada. Sin ese parámetro los botones se habilitan únicamente con la lista de combinaciones verificadas. Galería y comparador tienen validación independiente. No fusionar sin comprobar ambos destinos y sus flujos, seguridad y visualización.
- Consultas al Worker desde herramienta web: cache miss; curl local: DNS no resolvió el host. No se ha confirmado ninguna combinación pública. El commit de origen tuvo ejecución exitosa de Actions 46003299222 y contiene pruebas de las 20 combinaciones. No equivalen a comprobación pública.
- No se anuncian POS, caja, inventario, costos, fidelización, automatización ni reportes como módulos listos. No realizar pagos reales ni usar información personal. Mantener repositorios separados.
- Precios: se conservan últimos aprobados en main, implementación desde 750/1500/2500/3500; mensual 149/249/349/499 MXN + IVA. Documento recibido y comparador del SaaS conservan precios anteriores; armonizar antes de publicación.
- Pruebas: node --test tests/escaparate-demos.test.cjs; node scripts/verificar-demos-publicas.cjs (solo GET). Revisión visual 320/375/768 y escritorio, teclado, enlaces, vistas de práctica aisladas y ausencia de cobros reales. No enviar solicitudes de prueba a D1 de producción. No modificar wrangler ni migraciones. No fusionar sin aprobación.

## Jerarquía comercial de tarjetas
El título principal es el nombre del paquete (P1–P4); el establecimiento ficticio se muestra como ejemplo secundario junto a su giro y logotipo de menor tamaño. Se mantienen las cinco tarjetas, fotografías, funciones, enlaces y controles de validación.

## Publicación comercial autorizada
Se integra el escaparate en main por autorización explícita. Los enlaces de práctica se habilitan públicamente sin parámetro especial; no se marcan como verificados ni se afirma disponibilidad de contratación. Las pruebas públicas siguen pendientes. Se conserva la configuración de producción, sin añadir el Worker de preview, DNS, D1 ni cambios al repositorio de demos. Las tarifas del sitio comercial son las últimas aprobadas.

## Fichas integradas
Se reúnen los precios, características y demostraciones en cuatro fichas comerciales. P3 contiene dos ejemplos, los demás uno. Se conserva el selector de veinte combinaciones y todos los accesos, sin repetir el nombre del paquete en cada negocio. El ancla titulo-escaparate-demos sigue disponible.

## Redacción comercial
Presentar los ejemplos como demostraciones interactivas, no como negocios ficticios. Explicar que se pueden probar las funciones disponibles sin generar pedidos, citas, mensajes ni cobros reales; usar datos de ejemplo. La redacción no cambia la disponibilidad comercial ni la lógica de práctica.

## Captación desde paquetes y demos
Cada ficha tiene «Me interesa este paquete», con precarga por slug del paquete. El selector añade únicamente un giro permitido, editable en cotización. No se copian nombres de establecimientos de demostración ni datos de práctica; no se envía una solicitud sin revisión y confirmación. POS, caja, inventario, almacenes y compras se describen como ejemplos de práctica, no contratación validada. No modificar contratos ni estados de verificación.

## Selector destacado
El bloque Explora una demo para tu negocio conserva su ubicación tras las cuatro fichas y recibe un acceso directo desde el comienzo de Servicios Web. Cabecera marino/amarillo, tres pasos numerados, controles grandes, resumen de giro/paquete actualizado en tiempo real, tres acciones y aviso de práctica. Una columna en móvil. No modifica el mapa de URLs, precios, estados de verificación ni el configurador de cotización.

## Legibilidad en móvil y orden de cotización
El aviso Sin plazos forzosos mantiene fondo claro y colores de texto explícitos de alto contraste incluso con el modo oscuro del sistema. Las ventajas se apilan en una columna en pantallas pequeñas. El botón Me interesa este paquete se coloca después de las demostraciones dentro de cada ficha (en P3, después de ambos negocios), conservando el destino y la precarga. El selector interactivo conserva su orden y los tres enlaces. No cambia precios, lógica o datos.
