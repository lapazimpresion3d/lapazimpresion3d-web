/* Catálogo comercial modular. Los giros orientan la precarga, nunca limitan la selección. No es autorización de módulos del servidor de demos. */
(function(root){
'use strict';
const planes={
  "presencia-digital": {
    "nombre": "Presencia digital",
    "implementacionReferencia": 75000,
    "mensualidadReferencia": 14900,
    "precio": "Implementación desde $750 MXN · $149 MXN al mes + IVA",
    "alcance": "Página comercial con identidad, horarios, ubicación y contacto. Menú o catálogo básico, según el tipo de negocio. Acceso desde QR/NFC y consultas por WhatsApp.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Página bilingüe",
      "Menú digital",
      "Catálogo de productos y servicios",
      "Panel privado de administración",
      "Pedidos por WhatsApp"
    ]
  },
  "negocio-interactivo": {
    "nombre": "Negocio interactivo",
    "implementacionReferencia": 150000,
    "mensualidadReferencia": 24900,
    "precio": "Implementación desde $1,500 MXN · $249 MXN al mes + IVA",
    "alcance": "Funciones de presencia digital. Carrito, pedidos y seguimiento para menús o catálogos. Agenda o reservaciones según el giro. Panel privado; cocina básica y pedidos de mesa cuando corresponda.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Página bilingüe",
      "Menú digital",
      "Catálogo de productos y servicios",
      "Panel privado de administración",
      "Pedidos por WhatsApp",
      "Carrito y pedidos desde la página",
      "Pedidos para recoger o a domicilio",
      "Pedidos desde las mesas",
      "Seguimiento de pedidos",
      "Gestión de clientes",
      "Reservaciones y agenda",
      "Calendario básico de actividades",
      "Boletos digitales con QR",
      "Gestión de participantes y pasajeros",
      "Registro manual de pagos",
      "Pantalla de cocina y comandas"
    ]
  },
  "gestion-comercial": {
    "nombre": "Gestión comercial",
    "implementacionReferencia": 250000,
    "mensualidadReferencia": 34900,
    "precio": "Implementación desde $2,500 MXN · $349 MXN al mes + IVA",
    "alcance": "Funciones de Negocio interactivo, según el giro. Punto de venta, caja y registro de cobros. Inventario básico para productos; comandas o atención de servicios. Tickets y reportes de pedidos y cobros.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Página bilingüe",
      "Menú digital",
      "Catálogo de productos y servicios",
      "Panel privado de administración",
      "Pedidos por WhatsApp",
      "Carrito y pedidos desde la página",
      "Pedidos para recoger o a domicilio",
      "Pedidos desde las mesas",
      "Seguimiento de pedidos",
      "Gestión de clientes",
      "Reservaciones y agenda",
      "Calendario básico de actividades",
      "Listas de espera y control de ocupación",
      "Boletos digitales con QR",
      "Gestión de participantes y pasajeros",
      "Control de asistencia y abordaje con QR",
      "Registro manual de pagos",
      "Punto de venta",
      "Gestión de caja",
      "Tickets y comprobantes",
      "Inventario básico",
      "Almacenes, traspasos y compras",
      "Cotizaciones y órdenes de servicio",
      "Pantalla de cocina y comandas",
      "Gestión de recursos y salidas",
      "Anticipos, saldos y devoluciones",
      "Reportes operativos y financieros"
    ]
  },
  "gestion-profesional": {
    "nombre": "Gestión profesional",
    "implementacionReferencia": 350000,
    "mensualidadReferencia": 49900,
    "precio": "Implementación desde $3,500 MXN · $499 MXN al mes + IVA",
    "alcance": "Funciones de Gestión comercial, según el giro. Inventario avanzado, costos y proveedores. Fidelización y administración avanzada. Automatizaciones y reportes avanzados.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Página bilingüe",
      "Menú digital",
      "Catálogo de productos y servicios",
      "Panel privado de administración",
      "Pedidos por WhatsApp",
      "Carrito y pedidos desde la página",
      "Pedidos para recoger o a domicilio",
      "Pedidos desde las mesas",
      "Seguimiento de pedidos",
      "Gestión de clientes",
      "Reservaciones y agenda",
      "Calendario básico de actividades",
      "Calendario avanzado y conflictos externos",
      "Listas de espera y control de ocupación",
      "Boletos digitales con QR",
      "Gestión de participantes y pasajeros",
      "Control de asistencia y abordaje con QR",
      "Registro manual de pagos",
      "Punto de venta",
      "Gestión de caja",
      "Tickets y comprobantes",
      "Inventario avanzado",
      "Almacenes, traspasos y compras",
      "Recetas e insumos",
      "Cotizaciones y órdenes de servicio",
      "Pantalla de cocina y comandas",
      "Gestión de recursos y salidas",
      "Anticipos, saldos y devoluciones",
      "Reportes operativos y financieros",
      "Reportes avanzados",
      "Costos y rentabilidad",
      "Intermediarios y comisiones",
      "Promociones y fidelización",
      "Alertas y automatizaciones",
      "Personal, sucursales y permisos"
    ]
  }
};
const giros=Object.freeze({"restaurante":"Restaurante / taquería","cafeteria":"Cafetería","barberia":"Barbería / estética","mascotas":"Tienda de mascotas","comercio":"Comercio / tienda","servicios":"Servicios profesionales","taller":"Taller / servicios automotrices","turismo":"Turismo y actividades","hotel":"Hoteles y alojamientos","eventos":"Eventos y espectáculos","academia":"Academias y capacitación","otro":"Otro giro"});
const objetivos=Object.freeze([{"id":"catalogo","label":"Mostrar mi menú, productos o servicios","funciones":["$catalogo"]},{"id":"whatsapp","label":"Recibir consultas o pedidos por WhatsApp","funciones":["Pedidos por WhatsApp"]},{"id":"pedidos","label":"Recibir y dar seguimiento a pedidos en la página","funciones":["$catalogo","Carrito y pedidos desde la página","Seguimiento de pedidos","Panel privado de administración"]},{"id":"entregas","label":"Organizar pedidos para recoger o a domicilio","funciones":["$catalogo","Pedidos para recoger o a domicilio","Panel privado de administración"]},{"id":"mesas","label":"Recibir pedidos desde las mesas y organizar cocina","funciones":["Menú digital","Pedidos desde las mesas","Pantalla de cocina y comandas","Panel privado de administración"]},{"id":"agenda","label":"Organizar citas o reservaciones","funciones":["Reservaciones y agenda","Panel privado de administración"]},{"id":"turismo","label":"Gestionar reservaciones de tours o actividades","funciones":["Reservaciones y agenda","Panel privado de administración"]},{"id":"pos","label":"Registrar ventas, caja y tickets","funciones":["Punto de venta","Gestión de caja","Tickets y comprobantes","Panel privado de administración"]},{"id":"inventario","label":"Controlar existencias de productos","funciones":["Inventario básico","Panel privado de administración"]},{"id":"costos","label":"Controlar inventario avanzado, costos y proveedores","funciones":["Inventario avanzado","Costos y rentabilidad","Almacenes, traspasos y compras","Panel privado de administración"]},{"id":"automatizar","label":"Automatizar tareas o consultar reportes avanzados","funciones":["Alertas y automatizaciones","Reportes avanzados","Panel privado de administración"]},{"id":"tarjeta","label":"Integrar pagos en línea con tarjeta (cotización adicional)","funciones":["Cotizar integración de pagos en línea con tarjeta","Panel privado de administración"]}]);
const categorias=Object.freeze(["Página web y presencia digital","Catálogos y administración de contenido","Pedidos y atención al cliente","Citas, agendas y reservaciones","Turismo, experiencias y eventos","Ventas y punto de venta","Inventario, almacenes y compras","Cotizaciones y órdenes de servicio","Recursos y operación del negocio","Finanzas, costos y rentabilidad","Marketing y fidelización","Personal, sucursales y permisos","Integraciones y automatizaciones","Servicios adicionales y personalizaciones"]);
const metadatos=Object.freeze({
  "Página comercial personalizada": {
    "id": "historico-1",
    "nombre": "Página comercial personalizada",
    "categoria": 0,
    "minimo": 1,
    "giros": [],
    "descripcion": "Presentación, identidad, ubicación y servicios.",
    "estado": "alcance_comercial",
    "alias_historicos": []
  },
  "Información de contacto y horarios": {
    "id": "historico-2",
    "nombre": "Información de contacto y horarios",
    "categoria": 0,
    "minimo": 1,
    "giros": [],
    "descripcion": "WhatsApp, redes, dirección y horarios.",
    "estado": "alcance_comercial",
    "alias_historicos": []
  },
  "Página bilingüe": {
    "id": "historico-14",
    "nombre": "Página bilingüe",
    "categoria": 0,
    "minimo": 1,
    "giros": [
      "turismo"
    ],
    "descripcion": "Contenido en español e inglés; traducciones y adaptación según propuesta.",
    "estado": "demo",
    "alias_historicos": [
      "Página turística bilingüe",
      "Página bilingüe para otros giros"
    ]
  },
  "Menú digital": {
    "id": "historico-3",
    "nombre": "Menú digital",
    "categoria": 1,
    "minimo": 1,
    "giros": [
      "restaurante",
      "cafeteria"
    ],
    "descripcion": "Platillos, bebidas, categorías y precios; se puede combinar con un catálogo de otros servicios.",
    "estado": "alcance_comercial",
    "alias_historicos": []
  },
  "Catálogo de productos y servicios": {
    "id": "historico-4",
    "nombre": "Catálogo de productos y servicios",
    "categoria": 1,
    "minimo": 1,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia",
      "turismo",
      "servicios"
    ],
    "descripcion": "Productos, servicios o experiencias: fotos, categorías, precios y disponibilidad. En turismo incluye itinerarios, tarifas por edad o temporada, modalidad, requisitos y políticas.",
    "estado": "demo",
    "alias_historicos": [
      "Catálogo de productos",
      "Catálogo de experiencias turísticas"
    ]
  },
  "Panel privado de administración": {
    "id": "historico-5",
    "nombre": "Panel privado de administración",
    "categoria": 1,
    "minimo": 1,
    "giros": [],
    "descripcion": "Edición del contenido habilitado; en P1 editor de contenido, no operación avanzada. Autenticación y persistencia real según propuesta.",
    "estado": "alcance_comercial",
    "alias_historicos": [
      "Panel privado"
    ]
  },
  "Pedidos por WhatsApp": {
    "id": "historico-7",
    "nombre": "Pedidos por WhatsApp",
    "categoria": 2,
    "minimo": 1,
    "giros": [],
    "descripcion": "Abre un chat con la solicitud del cliente; no implica WhatsApp Business API.",
    "estado": "alcance_comercial",
    "alias_historicos": []
  },
  "Carrito y pedidos desde la página": {
    "id": "historico-6",
    "nombre": "Carrito y pedidos desde la página",
    "categoria": 2,
    "minimo": 2,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio"
    ],
    "descripcion": "Selección de artículos, cantidades y pedidos registrados.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Pedidos para recoger o a domicilio": {
    "id": "historico-8",
    "nombre": "Pedidos para recoger o a domicilio",
    "categoria": 2,
    "minimo": 2,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio"
    ],
    "descripcion": "Modalidad de entrega, dirección y costo de envío; requiere carrito.",
    "estado": "alcance_comercial",
    "alias_historicos": []
  },
  "Pedidos desde las mesas": {
    "id": "historico-9",
    "nombre": "Pedidos desde las mesas",
    "categoria": 2,
    "minimo": 2,
    "giros": [
      "restaurante"
    ],
    "descripcion": "Pedidos asociados a una mesa mediante QR; requiere carrito.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Seguimiento de pedidos": {
    "id": "historico-10",
    "nombre": "Seguimiento de pedidos",
    "categoria": 2,
    "minimo": 2,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio"
    ],
    "descripcion": "Consulta de estados de preparación y entrega; requiere carrito.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Gestión de clientes": {
    "id": "clientes",
    "nombre": "Gestión de clientes",
    "categoria": 2,
    "minimo": 2,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Directorio e historial de operaciones compatibles; alcance según propuesta.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Reservaciones y agenda": {
    "id": "historico-12",
    "nombre": "Reservaciones y agenda",
    "categoria": 3,
    "minimo": 2,
    "giros": [
      "restaurante",
      "barberia",
      "taller",
      "servicios",
      "turismo"
    ],
    "descripcion": "Citas, mesas, actividades o tours según giro; disponibilidad, cupos, tarifas por pasajero cuando corresponda, confirmación, reprogramación y cancelación.",
    "estado": "demo",
    "alias_historicos": [
      "Reservaciones de tours y pases turísticos"
    ]
  },
  "Calendario básico de actividades": {
    "id": "calendario-basico",
    "nombre": "Calendario básico de actividades",
    "categoria": 3,
    "minimo": 2,
    "giros": [
      "restaurante",
      "barberia",
      "taller",
      "turismo"
    ],
    "descripcion": "Calendario de citas, reservas o salidas y enlace personal; sin sincronización automática.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Calendario avanzado y conflictos externos": {
    "id": "calendario-avanzado",
    "nombre": "Calendario avanzado y conflictos externos",
    "categoria": 3,
    "minimo": 4,
    "giros": [
      "restaurante",
      "barberia",
      "taller",
      "turismo"
    ],
    "descripcion": "Ampliación del calendario: bloqueos y conflictos con eventos externos de ejemplo. No incluye sincronización real.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Listas de espera y control de ocupación": {
    "id": "turismo-espera",
    "nombre": "Listas de espera y control de ocupación",
    "categoria": 3,
    "minimo": 3,
    "giros": [
      "turismo"
    ],
    "descripcion": "Solicitudes en espera, ocupación y conversión a reservación confirmada; adaptable a otros giros.",
    "estado": "demo",
    "alias_historicos": [
      "Gestión de recursos y listas de espera para otros giros"
    ]
  },
  "Boletos digitales con QR": {
    "id": "historico-16",
    "nombre": "Boletos digitales con QR",
    "categoria": 4,
    "minimo": 2,
    "giros": [
      "turismo"
    ],
    "descripcion": "Boletos individuales o grupales y comprobantes de reserva, descarga e impresión. No incluye registro de asistencia.",
    "estado": "demo",
    "alias_historicos": [
      "Boletos QR y asistencia para eventos o academias"
    ]
  },
  "Gestión de participantes y pasajeros": {
    "id": "turismo-pasajeros",
    "nombre": "Gestión de participantes y pasajeros",
    "categoria": 4,
    "minimo": 2,
    "giros": [
      "turismo"
    ],
    "descripcion": "Registro de pasajeros o participantes y manifiestos básicos.",
    "estado": "demo",
    "alias_historicos": [
      "Gestión de pasajeros y manifiestos básicos"
    ]
  },
  "Control de asistencia y abordaje con QR": {
    "id": "historico-18",
    "nombre": "Control de asistencia y abordaje con QR",
    "categoria": 4,
    "minimo": 3,
    "giros": [
      "turismo"
    ],
    "descripcion": "Verificación de códigos y registro de presencia, acceso o abordaje. No promete escaneo mediante cámara.",
    "estado": "demo",
    "alias_historicos": [
      "Boletos QR y asistencia para eventos o academias"
    ]
  },
  "Registro manual de pagos": {
    "id": "historico-23",
    "nombre": "Registro manual de pagos",
    "categoria": 5,
    "minimo": 2,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio"
    ],
    "descripcion": "Registro de efectivo, transferencias y pagos asociados a pedidos; no procesa cobros reales.",
    "estado": "demo",
    "alias_historicos": [
      "Efectivo y transferencias con registro manual"
    ]
  },
  "Punto de venta": {
    "id": "historico-26",
    "nombre": "Punto de venta",
    "categoria": 5,
    "minimo": 3,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Ventas de mostrador, productos o servicios y registro de operaciones; caja se configura como módulo propio.",
    "estado": "demo",
    "alias_historicos": [
      "Punto de venta y caja"
    ]
  },
  "Gestión de caja": {
    "id": "caja",
    "nombre": "Gestión de caja",
    "categoria": 5,
    "minimo": 3,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia",
      "turismo"
    ],
    "descripcion": "Apertura, fondo, ingresos, egresos, arqueo, cortes, conciliación e historial; aplicable a caja turística o comercial.",
    "estado": "demo",
    "alias_historicos": [
      "Punto de venta y caja",
      "Anticipos, saldos y caja turística"
    ]
  },
  "Tickets y comprobantes": {
    "id": "historico-27",
    "nombre": "Tickets y comprobantes",
    "categoria": 5,
    "minimo": 3,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Comprobantes internos de ventas, cancelaciones y cortes; no CFDI. Los boletos y comprobantes de reserva están en su propio módulo.",
    "estado": "demo",
    "alias_historicos": [
      "Tickets"
    ]
  },
  "Inventario básico": {
    "id": "historico-28",
    "nombre": "Inventario básico",
    "categoria": 6,
    "minimo": 3,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Existencias, SKU, entradas, salidas y mínimos.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Inventario avanzado": {
    "id": "historico-29",
    "nombre": "Inventario avanzado",
    "categoria": 6,
    "minimo": 4,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Nivel superior de inventario, sustituye al básico y añade controles según alcance; no se cobra ni selecciona ambos niveles.",
    "estado": "alcance_comercial",
    "alias_historicos": []
  },
  "Almacenes, traspasos y compras": {
    "id": "almacenes",
    "nombre": "Almacenes, traspasos y compras",
    "categoria": 6,
    "minimo": 3,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Almacenes, recepción, transferencias, proveedores y órdenes de compra; requiere inventario.",
    "estado": "demo",
    "alias_historicos": [
      "Costos y proveedores"
    ]
  },
  "Recetas e insumos": {
    "id": "recetas",
    "nombre": "Recetas e insumos",
    "categoria": 6,
    "minimo": 4,
    "giros": [
      "restaurante",
      "cafeteria"
    ],
    "descripcion": "Insumos, rendimientos, mermas y consumo por producto o servicio; requiere inventario.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Cotizaciones y órdenes de servicio": {
    "id": "historico-22",
    "nombre": "Cotizaciones y órdenes de servicio",
    "categoria": 7,
    "minimo": 3,
    "giros": [
      "taller",
      "barberia",
      "mascotas",
      "comercio"
    ],
    "descripcion": "Presupuestos, vigencias, trabajos y estados; adaptable a otros servicios.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Pantalla de cocina y comandas": {
    "id": "historico-11",
    "nombre": "Pantalla de cocina y comandas",
    "categoria": 8,
    "minimo": 2,
    "giros": [
      "restaurante",
      "cafeteria"
    ],
    "descripcion": "Preparación, estados y comandas de cocina; requiere carrito.",
    "estado": "demo",
    "alias_historicos": []
  },
  "Gestión de recursos y salidas": {
    "id": "historico-17",
    "nombre": "Gestión de recursos y salidas",
    "categoria": 8,
    "minimo": 3,
    "giros": [
      "turismo"
    ],
    "descripcion": "Guías, embarcaciones, equipos o recursos, asignaciones, conflictos y bloqueos según el giro.",
    "estado": "demo",
    "alias_historicos": [
      "Gestión de salidas y recursos turísticos",
      "Gestión de recursos y listas de espera para otros giros"
    ]
  },
  "Anticipos, saldos y devoluciones": {
    "id": "historico-19",
    "nombre": "Anticipos, saldos y devoluciones",
    "categoria": 9,
    "minimo": 3,
    "giros": [
      "turismo"
    ],
    "descripcion": "Anticipos, liquidaciones, saldos, devoluciones y recibos; no procesa pagos electrónicos.",
    "estado": "demo",
    "alias_historicos": [
      "Anticipos, saldos y caja turística"
    ]
  },
  "Reportes operativos y financieros": {
    "id": "historico-25",
    "nombre": "Reportes operativos y financieros",
    "categoria": 9,
    "minimo": 3,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia",
      "turismo"
    ],
    "descripcion": "Ventas, pedidos, cobros, ocupación, pasajeros e inventario según módulos contratados; exportación disponible según giro.",
    "estado": "demo",
    "alias_historicos": [
      "Reportes turísticos",
      "Reportes de pedidos y cobros"
    ]
  },
  "Reportes avanzados": {
    "id": "historico-34",
    "nombre": "Reportes avanzados",
    "categoria": 9,
    "minimo": 4,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Ampliación analítica de los reportes operativos: comparativos e indicadores avanzados según alcance.",
    "estado": "alcance_comercial",
    "alias_historicos": []
  },
  "Costos y rentabilidad": {
    "id": "historico-30",
    "nombre": "Costos y rentabilidad",
    "categoria": 9,
    "minimo": 4,
    "giros": [
      "turismo"
    ],
    "descripcion": "Costos estimados y efectivos, márgenes por salida, producto, servicio o recurso; demostrado en turismo, otros giros según adaptación.",
    "estado": "demo",
    "alias_historicos": [
      "Rentabilidad, comisiones y promociones turísticas",
      "Rentabilidad por servicio e intermediarios",
      "Costos y proveedores"
    ]
  },
  "Intermediarios y comisiones": {
    "id": "comisiones",
    "nombre": "Intermediarios y comisiones",
    "categoria": 9,
    "minimo": 4,
    "giros": [
      "turismo"
    ],
    "descripcion": "Canales de venta, intermediarios, cálculo y registro de liquidaciones; no transfiere dinero.",
    "estado": "demo",
    "alias_historicos": [
      "Rentabilidad, comisiones y promociones turísticas",
      "Rentabilidad por servicio e intermediarios"
    ]
  },
  "Promociones y fidelización": {
    "id": "historico-31",
    "nombre": "Promociones y fidelización",
    "categoria": 10,
    "minimo": 4,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia",
      "turismo"
    ],
    "descripcion": "Códigos, descuentos y promociones; puntos o fidelización cuando corresponda al giro.",
    "estado": "demo",
    "alias_historicos": [
      "Rentabilidad, comisiones y promociones turísticas",
      "Fidelización"
    ]
  },
  "Alertas y automatizaciones": {
    "id": "historico-33",
    "nombre": "Alertas y automatizaciones",
    "categoria": 12,
    "minimo": 4,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia",
      "turismo"
    ],
    "descripcion": "Alertas internas y reglas de operación, según módulos; no implica notificaciones externas.",
    "estado": "demo",
    "alias_historicos": [
      "Alertas operativas turísticas",
      "Automatizaciones"
    ]
  },
  "Personal, sucursales y permisos": {
    "id": "historico-32",
    "nombre": "Personal, sucursales y permisos",
    "categoria": 11,
    "minimo": 4,
    "giros": [
      "restaurante",
      "cafeteria",
      "mascotas",
      "comercio",
      "taller",
      "barberia"
    ],
    "descripcion": "Configuración avanzada de usuarios, permisos y sucursales; capacidad y operación real según propuesta.",
    "estado": "alcance_comercial",
    "alias_historicos": [
      "Administración avanzada",
      "Personal, sucursales y permisos específicos"
    ]
  },
  "Cotizar integración de pagos en línea con tarjeta": {
    "id": "historico-24",
    "nombre": "Cotizar integración de pagos en línea con tarjeta",
    "categoria": 12,
    "minimo": null,
    "giros": [],
    "descripcion": "Procesamiento externo con cuenta del negocio; se cotiza aparte y no exige carrito si se integra a reservas o servicios.",
    "estado": "externa",
    "alias_historicos": []
  },
  "Sincronización con Google Calendar": {
    "id": "calendar-sync",
    "nombre": "Sincronización con Google Calendar",
    "categoria": 12,
    "minimo": null,
    "giros": [],
    "descripcion": "Cuenta, permisos y API; distinta del enlace o calendario local.",
    "estado": "externa",
    "alias_historicos": []
  },
  "Integración WhatsApp Business": {
    "id": "whatsapp-api",
    "nombre": "Integración WhatsApp Business",
    "categoria": 12,
    "minimo": null,
    "giros": [],
    "descripcion": "Cuenta y configuración del proveedor; distinta del enlace de chat.",
    "estado": "externa",
    "alias_historicos": []
  },
  "Notificaciones automáticas por correo": {
    "id": "correo",
    "nombre": "Notificaciones automáticas por correo",
    "categoria": 12,
    "minimo": null,
    "giros": [],
    "descripcion": "Proveedor, remitente y automatización sujetos a cotización.",
    "estado": "externa",
    "alias_historicos": []
  },
  "Google Analytics y Meta Pixel": {
    "id": "analytics",
    "nombre": "Google Analytics y Meta Pixel",
    "categoria": 12,
    "minimo": null,
    "giros": [],
    "descripcion": "Cuentas, configuración, consentimiento y medición según alcance.",
    "estado": "externa",
    "alias_historicos": []
  },
  "Mapas e integraciones de reservación": {
    "id": "mapas",
    "nombre": "Mapas e integraciones de reservación",
    "categoria": 12,
    "minimo": null,
    "giros": [],
    "descripcion": "Servicios de mapas o proveedores externos de reservas, sujetos a alcance.",
    "estado": "externa",
    "alias_historicos": []
  },
  "Integraciones contables, APIs y webhooks": {
    "id": "contabilidad",
    "nombre": "Integraciones contables, APIs y webhooks",
    "categoria": 12,
    "minimo": null,
    "giros": [],
    "descripcion": "Análisis de sistemas y conectores externos.",
    "estado": "externa",
    "alias_historicos": []
  },
  "Desarrollo y personalización especial": {
    "id": "personalizacion",
    "nombre": "Desarrollo y personalización especial",
    "categoria": 13,
    "minimo": null,
    "giros": [],
    "descripcion": "Requerimientos especiales, adaptación y presupuesto individual.",
    "estado": "personalizado",
    "alias_historicos": []
  }
});
const aliases=Object.freeze({"Página turística bilingüe":["Página bilingüe"],"Página bilingüe para otros giros":["Página bilingüe"],"Catálogo de productos":["Catálogo de productos y servicios"],"Catálogo de experiencias turísticas":["Catálogo de productos y servicios"],"Panel privado":["Panel privado de administración"],"Reservaciones de tours y pases turísticos":["Reservaciones y agenda"],"Gestión de pasajeros y manifiestos básicos":["Gestión de participantes y pasajeros"],"Boletos QR y asistencia para eventos o academias":["Boletos digitales con QR","Control de asistencia y abordaje con QR"],"Gestión de salidas y recursos turísticos":["Gestión de recursos y salidas"],"Gestión de recursos y listas de espera para otros giros":["Gestión de recursos y salidas","Listas de espera y control de ocupación"],"Efectivo y transferencias con registro manual":["Registro manual de pagos"],"Punto de venta y caja":["Punto de venta","Gestión de caja"],"Tickets":["Tickets y comprobantes"],"Anticipos, saldos y caja turística":["Anticipos, saldos y devoluciones","Gestión de caja"],"Reportes turísticos":["Reportes operativos y financieros"],"Reportes de pedidos y cobros":["Reportes operativos y financieros"],"Rentabilidad, comisiones y promociones turísticas":["Costos y rentabilidad","Intermediarios y comisiones","Promociones y fidelización"],"Rentabilidad por servicio e intermediarios":["Costos y rentabilidad","Intermediarios y comisiones"],"Costos y proveedores":["Costos y rentabilidad","Almacenes, traspasos y compras"],"Fidelización":["Promociones y fidelización"],"Alertas operativas turísticas":["Alertas y automatizaciones"],"Automatizaciones":["Alertas y automatizaciones"],"Administración avanzada":["Personal, sucursales y permisos"],"Personal, sucursales y permisos específicos":["Personal, sucursales y permisos"]});
const dependencias=Object.freeze({"Pedidos para recoger o a domicilio":["Carrito y pedidos desde la página"],"Pedidos desde las mesas":["Carrito y pedidos desde la página"],"Pantalla de cocina y comandas":["Carrito y pedidos desde la página"],"Seguimiento de pedidos":["Carrito y pedidos desde la página"],"Registro manual de pagos":["Carrito y pedidos desde la página"],"Calendario básico de actividades":["Reservaciones y agenda"],"Calendario avanzado y conflictos externos":["Calendario básico de actividades"],"Listas de espera y control de ocupación":["Reservaciones y agenda"],"Boletos digitales con QR":["Reservaciones y agenda"],"Gestión de participantes y pasajeros":["Reservaciones y agenda"],"Control de asistencia y abordaje con QR":["Boletos digitales con QR","Gestión de participantes y pasajeros"],"Gestión de recursos y salidas":["Reservaciones y agenda"],"Anticipos, saldos y devoluciones":["Reservaciones y agenda"],"Reportes avanzados":["Reportes operativos y financieros"]});
const inventarioRequerido=Object.freeze(["Almacenes, traspasos y compras","Recetas e insumos"]);
const turismoDefaults=new Set(["Página comercial personalizada","Información de contacto y horarios","Página bilingüe","Catálogo de productos y servicios","Panel privado de administración","Pedidos por WhatsApp","Reservaciones y agenda","Calendario básico de actividades","Calendario avanzado y conflictos externos","Listas de espera y control de ocupación","Boletos digitales con QR","Gestión de participantes y pasajeros","Control de asistencia y abordaje con QR","Gestión de recursos y salidas","Anticipos, saldos y devoluciones","Gestión de caja","Reportes operativos y financieros","Costos y rentabilidad","Intermediarios y comisiones","Promociones y fidelización","Alertas y automatizaciones"]);
const orden=Object.keys(planes);
const basicos=new Set(['Página comercial personalizada','Información de contacto y horarios','Panel privado de administración','Pedidos por WhatsApp']);
const adicionales=new Set(Object.values(metadatos).filter(m=>m.minimo===null).map(m=>m.nombre));
function normalizar(funciones){return [...new Set(funciones.flatMap(n=>Object.hasOwn(aliases,n)?aliases[n]:[n]))].filter(n=>Object.hasOwn(metadatos,n));}
function dependientes(f,seleccion){return [...(dependencias[f]||[]),...(inventarioRequerido.includes(f)?[seleccion.includes('Inventario avanzado')?'Inventario avanzado':'Inventario básico']:[])];}
function completar(funciones){
 const s=new Set(normalizar(funciones));let cambio=true;
 while(cambio){cambio=false;for(const n of [...s])for(const dep of dependientes(n,[...s]))if(!s.has(dep)){s.add(dep);cambio=true;}}
 if(s.has('Inventario avanzado'))s.delete('Inventario básico');
 return [...s];
}
function editar(funciones,n,marcado){
 const s=new Set(normalizar(funciones));
 if(marcado){s.add(n);if(n==='Inventario básico')s.delete('Inventario avanzado');if(n==='Inventario avanzado')s.delete('Inventario básico');return completar([...s]);}
 s.delete(n);let cambio=true;
 while(cambio){cambio=false;for(const x of [...s])if(dependientes(x,[...s]).some(dep=>!s.has(dep))){s.delete(x);cambio=true;}}
 return [...s];
}
function funcionesPorGiro(paquete,giro){
 if(!Object.hasOwn(planes,paquete))return [];
 const base=planes[paquete].funciones;
 if(giro==='turismo')return completar(base.filter(n=>turismoDefaults.has(n)));
 if(!Object.hasOwn(giros,giro)||['otro','hotel','eventos','academia'].includes(giro))return completar(base.filter(n=>basicos.has(n)||n==='Catálogo de productos y servicios'));
 return completar(base.filter(n=>{if(n==='Catálogo de productos y servicios'&&['restaurante','cafeteria'].includes(giro))return false;const m=metadatos[n];return !m.giros.length||m.giros.includes(giro);}));
}
function giroDesdeTexto(texto){const v=String(texto||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');if(!v)return null;const exacto=Object.keys(giros).find(k=>[k,giros[k].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')].includes(v));if(exacto)return exacto;const reglas=[['turismo',/tour|turis|excursion|paseo/],['hotel',/hotel|alojamiento/],['eventos',/evento|espectaculo/],['academia',/academia|capacitacion|escuela/],['restaurante',/restaur|taquer|comida/],['cafeteria',/cafe|cafeter/],['barberia',/barber|estetic|peluquer/],['mascotas',/mascota|veterin/],['taller',/taller|automotr|mecanic/],['comercio',/tienda|comercio/],['servicios',/servicio/]];return reglas.find(([,r])=>r.test(v))?.[0]||null;}
function alcancePorGiro(paquete,giro){if(giro!=='turismo')return planes[paquete]?.alcance||'';return ({'presencia-digital':'Página bilingüe y catálogo de experiencias.','negocio-interactivo':'Reservaciones, cupos y boletos digitales con QR.','gestion-comercial':'Salidas, recursos, pasajeros, abordaje, anticipos y caja turística.','gestion-profesional':'Costos, rentabilidad, comisiones, promociones y alertas según selección.'})[paquete]||'';}

function estadoFuncion(nombre,giro){
 const m=metadatos[nombre];if(!m)return 'personalizado';
 if(m.minimo===null)return m.estado;
 if(giro&&giro!=='otro'&&m.giros.length&&!m.giros.includes(giro))return 'adaptacion';
 return m.estado;
}
function recomendar(funciones){
 const lista=completar(funciones);
 const nivel=Math.max(0,...lista.map(n=>metadatos[n].minimo||0));
 return nivel?orden[nivel-1]:'a-medida';
}
function baseRecomendada(funciones,giro){return recomendar(funciones);}
function configuracion(paquete,giro,funciones){
 const base=funcionesPorGiro(paquete,giro),elegidas=completar(funciones),agregadas=elegidas.filter(n=>!base.includes(n)),retiradas=base.filter(n=>!elegidas.includes(n)),especiales=elegidas.filter(n=>['externa','personalizado','adaptacion'].includes(estadoFuncion(n,giro)));
 return {paqueteBase:paquete,paqueteRecomendado:baseRecomendada(elegidas,giro),agregadas,retiradas,especiales,personalizada:!Object.hasOwn(planes,paquete)||agregadas.length>0||retiradas.length>0||especiales.length>0};
}
function orientar(giro,ids){
 if(!Object.hasOwn(giros,giro)||!Array.isArray(ids)||ids.length>objetivos.length||ids.some(id=>!objetivos.some(o=>o.id===id)))return null;
 const necesidades=[...new Set(ids)],funciones=['Página comercial personalizada','Información de contacto y horarios'];
 const tipoCatalogo=['restaurante','cafeteria'].includes(giro)?'Menú digital':'Catálogo de productos y servicios';
 for(const o of objetivos)if(necesidades.includes(o.id))for(const n of o.funciones)funciones.push(n==='$catalogo'?tipoCatalogo:n);
 const lista=completar(funciones);
 return {giro,necesidades,funciones:lista,paquete:recomendar(lista),adicionales:lista.filter(n=>adicionales.has(n))};
}
function url(resultado){
 const r=resultado&&orientar(resultado.giro,resultado.necesidades);if(!r)return null;
 return 'cotizacion-web.html?orientacion=1&paquete='+encodeURIComponent(r.paquete)+'&giro='+encodeURIComponent(r.giro)+r.necesidades.map(n=>'&necesidad='+encodeURIComponent(n)).join('')+'#precios-paquetes';
}
function leer(parametros){
 if(parametros.get('orientacion')!=='1')return null;
 return orientar(parametros.get('giro'),parametros.getAll('necesidad'));
}

const api=Object.freeze({planes,giros,objetivos,categorias,metadatos,aliases,dependencias,inventarioRequerido,normalizar,completar,editar,recomendar,orientar,url,leer,funcionesPorGiro,giroDesdeTexto,alcancePorGiro,estadoFuncion,baseRecomendada,configuracion});
if(typeof module==='object'&&module.exports)module.exports=api;else root.LP_ORIENTACION_WEB=api;
})(globalThis);
