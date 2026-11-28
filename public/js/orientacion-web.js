/* Catálogo compartido y orientación comercial local. No realiza solicitudes ni operaciones de servidor. */
(function(root){
'use strict';
const planes = {
  "presencia-digital": {
    "nombre": "Presencia digital",
    "precio": "Implementación desde $750 MXN · $149 MXN al mes + IVA",
    "alcance": "Página comercial con identidad, horarios, ubicación y contacto. Menú o catálogo básico, según el tipo de negocio. Acceso desde QR/NFC y consultas por WhatsApp.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Menú digital",
      "Catálogo de productos",
      "Pedidos por WhatsApp"
    ]
  },
  "negocio-interactivo": {
    "nombre": "Negocio interactivo",
    "precio": "Implementación desde $1,500 MXN · $249 MXN al mes + IVA",
    "alcance": "Funciones de presencia digital. Carrito, pedidos y seguimiento para menús o catálogos. Agenda o reservaciones según el giro. Panel privado; cocina básica y pedidos de mesa cuando corresponda.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Menú digital",
      "Catálogo de productos",
      "Pedidos por WhatsApp",
      "Carrito y pedidos desde la página",
      "Pedidos para recoger o a domicilio",
      "Pedidos desde las mesas",
      "Reservaciones y agenda",
      "Reservaciones de tours y pases turísticos",
      "Panel privado",
      "Pantalla de cocina y comandas",
      "Seguimiento de pedidos"
    ]
  },
  "gestion-comercial": {
    "nombre": "Gestión comercial",
    "precio": "Implementación desde $2,500 MXN · $349 MXN al mes + IVA",
    "alcance": "Funciones de Negocio interactivo, según el giro. Punto de venta, caja y registro de cobros. Inventario básico para productos; comandas o atención de servicios. Tickets y reportes de pedidos y cobros.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Menú digital",
      "Catálogo de productos",
      "Pedidos por WhatsApp",
      "Carrito y pedidos desde la página",
      "Pedidos para recoger o a domicilio",
      "Pedidos desde las mesas",
      "Reservaciones y agenda",
      "Reservaciones de tours y pases turísticos",
      "Panel privado",
      "Pantalla de cocina y comandas",
      "Seguimiento de pedidos",
      "Efectivo y transferencias con registro manual",
      "Reportes de pedidos y cobros",
      "Punto de venta y caja",
      "Inventario básico",
      "Tickets"
    ]
  },
  "gestion-profesional": {
    "nombre": "Gestión profesional",
    "precio": "Implementación desde $3,500 MXN · $499 MXN al mes + IVA",
    "alcance": "Funciones de Gestión comercial, según el giro. Inventario avanzado, costos y proveedores. Fidelización y administración avanzada. Automatizaciones y reportes avanzados.",
    "funciones": [
      "Página comercial personalizada",
      "Información de contacto y horarios",
      "Menú digital",
      "Catálogo de productos",
      "Pedidos por WhatsApp",
      "Carrito y pedidos desde la página",
      "Pedidos para recoger o a domicilio",
      "Pedidos desde las mesas",
      "Reservaciones y agenda",
      "Reservaciones de tours y pases turísticos",
      "Panel privado",
      "Pantalla de cocina y comandas",
      "Seguimiento de pedidos",
      "Efectivo y transferencias con registro manual",
      "Reportes de pedidos y cobros",
      "Punto de venta y caja",
      "Tickets",
      "Inventario avanzado",
      "Costos y proveedores",
      "Fidelización",
      "Administración avanzada",
      "Automatizaciones",
      "Reportes avanzados"
    ]
  }
};
const giros=Object.freeze({"restaurante":"Restaurante / taquería","cafeteria":"Cafetería","barberia":"Barbería / estética","mascotas":"Tienda de mascotas","comercio":"Comercio / tienda","servicios":"Servicios profesionales","taller":"Taller / servicios automotrices","turismo":"Turismo y actividades","hotel":"Hoteles y alojamientos","eventos":"Eventos y espectáculos","academia":"Academias y capacitación","otro":"Otro giro"});
const objetivos=Object.freeze([{"id":"catalogo","label":"Mostrar mi menú, productos o servicios","funciones":["$catalogo"]},{"id":"whatsapp","label":"Recibir consultas o pedidos por WhatsApp","funciones":["Pedidos por WhatsApp"]},{"id":"pedidos","label":"Recibir y dar seguimiento a pedidos en la página","funciones":["$catalogo","Carrito y pedidos desde la página","Seguimiento de pedidos","Panel privado"]},{"id":"entregas","label":"Organizar pedidos para recoger o a domicilio","funciones":["$catalogo","Pedidos para recoger o a domicilio","Panel privado"]},{"id":"mesas","label":"Recibir pedidos desde las mesas y organizar cocina","funciones":["Menú digital","Pedidos desde las mesas","Pantalla de cocina y comandas","Panel privado"]},{"id":"agenda","label":"Organizar citas o reservaciones","funciones":["Reservaciones y agenda","Panel privado"]},{"id":"turismo","label":"Gestionar reservaciones de tours o actividades","funciones":["Reservaciones de tours y pases turísticos","Panel privado"]},{"id":"pos","label":"Registrar ventas, caja y tickets","funciones":["Punto de venta y caja","Tickets","Panel privado"]},{"id":"inventario","label":"Controlar existencias de productos","funciones":["Inventario básico","Panel privado"]},{"id":"costos","label":"Controlar inventario avanzado, costos y proveedores","funciones":["Inventario avanzado","Costos y proveedores","Panel privado"]},{"id":"automatizar","label":"Automatizar tareas o consultar reportes avanzados","funciones":["Automatizaciones","Reportes avanzados","Panel privado"]},{"id":"tarjeta","label":"Integrar pagos en línea con tarjeta (cotización adicional)","funciones":["Cotizar integración de pagos en línea con tarjeta","Panel privado"]}]);
const orden=Object.keys(planes);
const nuevasFunciones=[["Página turística bilingüe",1],["Catálogo de experiencias turísticas",1],["Boletos digitales con QR",2],["Gestión de salidas y recursos turísticos",3],["Control de asistencia y abordaje con QR",3],["Anticipos, saldos y caja turística",3],["Reportes turísticos",3],["Rentabilidad, comisiones y promociones turísticas",4],["Cotizaciones y órdenes de servicio",3],["Gestión de pasajeros y manifiestos básicos",2],["Listas de espera y control de ocupación",3],["Calendario básico de actividades",2],["Calendario avanzado y conflictos externos",4],["Alertas operativas turísticas",4],["Almacenes, traspasos y compras",3],["Recetas e insumos",4]];
for(const [nombre,nivel] of nuevasFunciones)for(const clave of orden.slice(nivel-1))planes[clave].funciones.push(nombre);
const porGiro={"Menú digital":["restaurante","cafeteria"],"Catálogo de productos":["mascotas","comercio","taller","barberia","servicios"],"Carrito y pedidos desde la página":["restaurante","cafeteria","mascotas","comercio"],"Pedidos para recoger o a domicilio":["restaurante","cafeteria","mascotas","comercio"],"Pedidos desde las mesas":["restaurante"],"Pantalla de cocina y comandas":["restaurante","cafeteria"],"Seguimiento de pedidos":["restaurante","cafeteria","mascotas","comercio"],"Efectivo y transferencias con registro manual":["restaurante","cafeteria","mascotas","comercio"],"Reportes de pedidos y cobros":["restaurante","cafeteria","mascotas","comercio"],"Reservaciones y agenda":["restaurante","barberia","taller","servicios"],"Reservaciones de tours y pases turísticos":["turismo"],"Cotizaciones y órdenes de servicio":["taller","barberia","mascotas","comercio"],"Página turística bilingüe":["turismo"],"Catálogo de experiencias turísticas":["turismo"],"Boletos digitales con QR":["turismo"],"Gestión de salidas y recursos turísticos":["turismo"],"Control de asistencia y abordaje con QR":["turismo"],"Anticipos, saldos y caja turística":["turismo"],"Reportes turísticos":["turismo"],"Rentabilidad, comisiones y promociones turísticas":["turismo"],"Gestión de pasajeros y manifiestos básicos":["turismo"],"Listas de espera y control de ocupación":["turismo"],"Calendario básico de actividades":["turismo"],"Calendario avanzado y conflictos externos":["turismo"],"Alertas operativas turísticas":["turismo"],"Almacenes, traspasos y compras":["restaurante","cafeteria","mascotas","comercio","taller","barberia"],"Recetas e insumos":["restaurante","cafeteria"]};
const turismoFunciones=new Set(["Página comercial personalizada","Información de contacto y horarios","Pedidos por WhatsApp","Panel privado","Reservaciones de tours y pases turísticos","Página turística bilingüe","Catálogo de experiencias turísticas","Boletos digitales con QR","Gestión de salidas y recursos turísticos","Control de asistencia y abordaje con QR","Anticipos, saldos y caja turística","Reportes turísticos","Rentabilidad, comisiones y promociones turísticas","Gestión de pasajeros y manifiestos básicos","Listas de espera y control de ocupación","Calendario básico de actividades","Calendario avanzado y conflictos externos","Alertas operativas turísticas"]);
function funcionesPorGiro(paquete,giro){const base=planes[paquete]?.funciones||[];if(!Object.hasOwn(giros,giro)||giro==='otro')return base.filter(f=>!nuevasFunciones.some(x=>x[0]===f));if(['hotel','eventos','academia'].includes(giro))return base.filter(f=>['Página comercial personalizada','Información de contacto y horarios','Pedidos por WhatsApp'].includes(f));if(giro==='turismo')return base.filter(f=>turismoFunciones.has(f));return base.filter(f=>!Object.hasOwn(porGiro,f)||porGiro[f].includes(giro));}
function giroDesdeTexto(texto){const v=String(texto||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');if(!v)return null;const exacto=Object.keys(giros).find(k=>[k,giros[k].toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'')].includes(v));if(exacto)return exacto;const reglas=[['turismo',/tour|turis|excursion|paseo/],['hotel',/hotel|alojamiento/],['eventos',/evento|espectaculo/],['academia',/academia|capacitacion|escuela/],['restaurante',/restaur|taquer|comida/],['cafeteria',/cafe|cafeter/],['barberia',/barber|estetic|peluquer/],['mascotas',/mascota|veterin/],['taller',/taller|automotr|mecanic/],['comercio',/tienda|comercio/],['servicios',/servicio/]];return reglas.find(([,r])=>r.test(v))?.[0]||null;}
function alcancePorGiro(paquete,giro){if(giro!=='turismo')return planes[paquete]?.alcance||'';return ({'presencia-digital':'Página turística bilingüe y catálogo de experiencias.','negocio-interactivo':'Reservaciones, cupos y boletos digitales con QR.','gestion-comercial':'Salidas, recursos, pasajeros, abordaje, anticipos y caja turística.','gestion-profesional':'Operación turística completa, costos, rentabilidad, comisiones y promociones.'})[paquete]||'';}
const categorias=Object.freeze(["Página web y presencia digital","Catálogos y administración de contenido","Pedidos y atención al cliente","Citas, agendas y reservaciones","Turismo, experiencias y eventos","Ventas y punto de venta","Inventario, almacenes y compras","Cotizaciones y órdenes de servicio","Recursos y operación del negocio","Finanzas, costos y rentabilidad","Marketing y fidelización","Personal, sucursales y permisos","Integraciones y automatizaciones","Servicios adicionales y personalizaciones"]);
const ampliacion=Object.freeze([["turismo-pasajeros","Gestión de pasajeros y manifiestos básicos",4,2,["turismo"],"Registro de pasajeros y manifiesto básico de reservaciones.","demo"],["turismo-espera","Listas de espera y control de ocupación",4,3,["turismo"],"Control de solicitudes en espera, cupos y conversión a reservaciones confirmadas.","demo"],["calendario-basico","Calendario básico de actividades",3,2,["turismo"],"Consulta de actividades y enlace para agregar una reservación al calendario personal; no sincroniza automáticamente.","demo"],["calendario-avanzado","Calendario avanzado y conflictos externos",3,4,["turismo"],"Bloqueos y conflictos con eventos externos de ejemplo; sincronización real no incluida.","demo"],["turismo-alertas","Alertas operativas turísticas",10,4,["turismo"],"Alertas internas de baja ocupación o margen estimado negativo, sin envío automático.","demo"],["almacenes","Almacenes, traspasos y compras",6,3,["restaurante","cafeteria","mascotas","comercio","taller","barberia"],"Movimientos de almacén, órdenes de compra y proveedores según el módulo.","demo"],["recetas","Recetas e insumos",6,4,["restaurante","cafeteria"],"Insumos, rendimientos, mermas y consumo asociado a ventas.","demo"],["bilingue-adaptado","Página bilingüe para otros giros",0,null,["hotel","restaurante","comercio","servicios","eventos","academia"],"Adaptación de contenidos en dos idiomas; alcance y traducciones por confirmar.","adaptacion"],["recursos-adaptados","Gestión de recursos y listas de espera para otros giros",8,null,["hotel","taller","barberia","servicios","eventos","academia"],"Adaptar disponibilidad, bloqueos y listas de espera a la operación del negocio.","adaptacion"],["qr-adaptado","Boletos QR y asistencia para eventos o academias",4,null,["eventos","academia","hotel"],"Adaptación del módulo turístico a accesos y asistencia de otros giros.","adaptacion"],["rentabilidad-adaptada","Rentabilidad por servicio e intermediarios",9,null,["taller","servicios","hotel","eventos","academia"],"Adaptar costos, márgenes y comisiones a servicios no turísticos.","adaptacion"],["personal","Personal, sucursales y permisos específicos",11,null,[],"Roles y cupos se confirman en propuesta; configuración especial sujeta a revisión.","adaptacion"],["calendar-sync","Sincronización con Google Calendar",12,null,[],"Cuenta, permisos y API externa; no equivale a abrir un enlace de calendario.","externa"],["whatsapp-api","Integración WhatsApp Business",12,null,[],"Requiere cuenta y configuración del proveedor; no equivale a un enlace de chat.","externa"],["correo","Notificaciones automáticas por correo",12,null,[],"Proveedor, remitente y automatización sujetos a cotización.","externa"],["analytics","Google Analytics y Meta Pixel",12,null,[],"Configuración de cuentas, consentimiento y medición según alcance.","externa"],["mapas","Mapas e integraciones de reservación",12,null,[],"Servicios externos, permisos y posibles costos del proveedor.","externa"],["contabilidad","Integraciones contables, APIs y webhooks",12,null,[],"Análisis de sistemas y desarrollo de conectores.","externa"],["personalizacion","Desarrollo y personalización especial",13,null,[],"Requerimientos específicos sujetos a evaluación y presupuesto.","personalizado"]]);
const baseCategorias=[["Página comercial personalizada",0],["Información de contacto y horarios",0],["Menú digital",1],["Catálogo de productos",1],["Panel privado",1],["Carrito y pedidos desde la página",2],["Pedidos por WhatsApp",2],["Pedidos para recoger o a domicilio",2],["Pedidos desde las mesas",2],["Seguimiento de pedidos",2],["Pantalla de cocina y comandas",8],["Reservaciones y agenda",3],["Reservaciones de tours y pases turísticos",4],["Página turística bilingüe",0],["Catálogo de experiencias turísticas",4],["Boletos digitales con QR",4],["Gestión de salidas y recursos turísticos",8],["Control de asistencia y abordaje con QR",8],["Anticipos, saldos y caja turística",9],["Reportes turísticos",9],["Rentabilidad, comisiones y promociones turísticas",9],["Cotizaciones y órdenes de servicio",7],["Efectivo y transferencias con registro manual",5],["Cotizar integración de pagos en línea con tarjeta",12],["Reportes de pedidos y cobros",5],["Punto de venta y caja",5],["Tickets",5],["Inventario básico",6],["Inventario avanzado",6],["Costos y proveedores",9],["Fidelización",10],["Administración avanzada",11],["Automatizaciones",12],["Reportes avanzados",9]];
const descripcionesAmpliadas={"Catálogo de experiencias turísticas":"Editor de experiencias bilingües: fotos, horarios, duración, tarifas adultos/menores y temporadas, modalidad privada o compartida, publicación, itinerarios, incluidos, extras, requisitos, punto de encuentro y cancelación.","Reservaciones de tours y pases turísticos":"Cupos, fecha y horario, reservas individuales o grupales, cotización por pasajeros, consulta, reprogramación, cancelación y liberación de cupos.","Boletos digitales con QR":"Comprobantes y boletos grupales o individuales para reservas confirmadas, descarga e impresión; no incluye registro de abordaje en P2.","Gestión de salidas y recursos turísticos":"Calendario operativo, guías, embarcaciones, asignaciones, conflictos, bloqueos por mantenimiento y suspensión de salidas.","Control de asistencia y abordaje con QR":"Manifiestos operativos, verificación de códigos, presencia, abordaje, pendientes y ausentes; no promete lectura por cámara.","Anticipos, saldos y caja turística":"Anticipos, liquidaciones, devoluciones, recibos, fondo inicial, entradas y gastos, arqueos, cortes, conciliación e historial. Registro administrativo, no cobro electrónico.","Reportes turísticos":"Pasajeros, ventas, ocupación, saldos y reportes CSV disponibles.","Rentabilidad, comisiones y promociones turísticas":"Costos estimados y efectivos (combustible, transporte, mantenimiento, tripulación y otros), márgenes por salida/experiencia/transporte, agencias y hoteles, comisiones, liquidación registrada y códigos promocionales."};
const metadatos=Object.freeze(Object.fromEntries([...baseCategorias.map(([nombre,categoria],i)=>[nombre,{id:'historico-'+(i+1),nombre,categoria,descripcion:descripcionesAmpliadas[nombre]||'',minimo:orden.findIndex(k=>planes[k].funciones.includes(nombre))+1||null,giros:porGiro[nombre]||[],estado:nombre==='Cotizar integración de pagos en línea con tarjeta'?'externa':turismoFunciones.has(nombre)&&porGiro[nombre]?.includes('turismo')?'demo':'alcance_comercial'}]),...ampliacion.map(([id,nombre,categoria,minimo,giros,descripcion,estado])=>[nombre,{id,nombre,categoria,minimo,giros,descripcion,estado}])]));
function estadoFuncion(nombre,giro){const m=metadatos[nombre];if(!m)return 'personalizado';if(['externa','personalizado','adaptacion'].includes(m.estado))return m.estado;if(giro&&giro!=='otro'&&((m.giros.length&&!m.giros.includes(giro))||(giro==='turismo'&&!turismoFunciones.has(nombre))))return 'adaptacion';return m.estado;}
function baseRecomendada(funciones,giro){return recomendar(funciones.filter(n=>!['externa','personalizado','adaptacion'].includes(estadoFuncion(n,giro))));}
const coberturas=new Map(orden.map(k=>[k,new Set(planes[k].funciones)]));
coberturas.get('gestion-profesional').add('Inventario básico');
const catalogo=new Set([...coberturas.values()].flatMap(s=>[...s]));
const adicionales=new Set(['Cotizar integración de pagos en línea con tarjeta',...ampliacion.filter(x=>x[3]===null).map(x=>x[1])]);
const requiereCarrito=new Set(['Efectivo y transferencias con registro manual','Cotizar integración de pagos en línea con tarjeta','Pedidos para recoger o a domicilio','Pedidos desde las mesas','Pantalla de cocina y comandas','Seguimiento de pedidos','Reportes de pedidos y cobros']);
function recomendar(funciones){
 const estandar=funciones.filter(v=>catalogo.has(v));
 return estandar.length?orden.find(k=>estandar.every(v=>coberturas.get(k).has(v)))||'a-medida':'a-medida';
}
function orientar(giro,ids){
 if(!Object.hasOwn(giros,giro)||!Array.isArray(ids)||ids.length>objetivos.length||ids.some(id=>!objetivos.some(o=>o.id===id)))return null;
 const necesidades=[...new Set(ids)];
 const funciones=new Set(['Página comercial personalizada','Información de contacto y horarios']);
 const tipoCatalogo=giro==='turismo'?'Catálogo de experiencias turísticas':['restaurante','cafeteria'].includes(giro)?'Menú digital':'Catálogo de productos';
 for(const o of objetivos)if(necesidades.includes(o.id))for(const v of o.funciones)funciones.add(v==='$catalogo'?tipoCatalogo:v);
 if([...funciones].some(v=>requiereCarrito.has(v)))funciones.add('Carrito y pedidos desde la página');
 if(funciones.has('Inventario avanzado'))funciones.delete('Inventario básico');
 const lista=[...funciones];
 if(lista.some(v=>!catalogo.has(v)&&!adicionales.has(v)))return null;
 const paquete=recomendar(lista);
 return {giro,necesidades,funciones:lista,paquete,adicionales:lista.filter(v=>adicionales.has(v))};
}
function url(resultado){
 const r=resultado&&orientar(resultado.giro,resultado.necesidades);if(!r)return null;
 return 'cotizacion-web.html?orientacion=1&paquete='+encodeURIComponent(r.paquete)+'&giro='+encodeURIComponent(r.giro)+r.necesidades.map(n=>'&necesidad='+encodeURIComponent(n)).join('')+'#precios-paquetes';
}
function leer(parametros){
 if(parametros.get('orientacion')!=='1')return null;
 return orientar(parametros.get('giro'),parametros.getAll('necesidad'));
}
const api=Object.freeze({planes,giros,objetivos,recomendar,orientar,url,leer,funcionesPorGiro,giroDesdeTexto,alcancePorGiro,categorias,metadatos,estadoFuncion,baseRecomendada});
if(typeof module==='object'&&module.exports)module.exports=api;else root.LP_ORIENTACION_WEB=api;
})(globalThis);
