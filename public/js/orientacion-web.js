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
const giros=Object.freeze({"restaurante":"Restaurante / taquería","cafeteria":"Cafetería","barberia":"Barbería / estética","mascotas":"Tienda de mascotas","comercio":"Comercio / tienda","servicios":"Servicios profesionales","taller":"Taller / servicios automotrices","turismo":"Turismo y actividades","otro":"Otro giro"});
const objetivos=Object.freeze([{"id":"catalogo","label":"Mostrar mi menú, productos o servicios","funciones":["$catalogo"]},{"id":"whatsapp","label":"Recibir consultas o pedidos por WhatsApp","funciones":["Pedidos por WhatsApp"]},{"id":"pedidos","label":"Recibir y dar seguimiento a pedidos en la página","funciones":["$catalogo","Carrito y pedidos desde la página","Seguimiento de pedidos","Panel privado"]},{"id":"entregas","label":"Organizar pedidos para recoger o a domicilio","funciones":["$catalogo","Pedidos para recoger o a domicilio","Panel privado"]},{"id":"mesas","label":"Recibir pedidos desde las mesas y organizar cocina","funciones":["Menú digital","Pedidos desde las mesas","Pantalla de cocina y comandas","Panel privado"]},{"id":"agenda","label":"Organizar citas o reservaciones","funciones":["Reservaciones y agenda","Panel privado"]},{"id":"turismo","label":"Gestionar reservaciones de tours o actividades","funciones":["Reservaciones de tours y pases turísticos","Panel privado"]},{"id":"pos","label":"Registrar ventas, caja y tickets","funciones":["Punto de venta y caja","Tickets","Panel privado"]},{"id":"inventario","label":"Controlar existencias de productos","funciones":["Inventario básico","Panel privado"]},{"id":"costos","label":"Controlar inventario avanzado, costos y proveedores","funciones":["Inventario avanzado","Costos y proveedores","Panel privado"]},{"id":"automatizar","label":"Automatizar tareas o consultar reportes avanzados","funciones":["Automatizaciones","Reportes avanzados","Panel privado"]},{"id":"tarjeta","label":"Integrar pagos en línea con tarjeta (cotización adicional)","funciones":["Cotizar integración de pagos en línea con tarjeta","Panel privado"]}]);
const orden=Object.keys(planes);
const coberturas=new Map(orden.map(k=>[k,new Set(planes[k].funciones)]));
coberturas.get('gestion-profesional').add('Inventario básico');
const catalogo=new Set([...coberturas.values()].flatMap(s=>[...s]));
const adicionales=new Set(['Cotizar integración de pagos en línea con tarjeta']);
const requiereCarrito=new Set(['Efectivo y transferencias con registro manual','Cotizar integración de pagos en línea con tarjeta','Pedidos para recoger o a domicilio','Pedidos desde las mesas','Pantalla de cocina y comandas','Seguimiento de pedidos','Reportes de pedidos y cobros']);
function recomendar(funciones){
 const estandar=funciones.filter(v=>catalogo.has(v));
 return estandar.length?orden.find(k=>estandar.every(v=>coberturas.get(k).has(v)))||'a-medida':'a-medida';
}
function orientar(giro,ids){
 if(!Object.hasOwn(giros,giro)||!Array.isArray(ids)||ids.length>objetivos.length||ids.some(id=>!objetivos.some(o=>o.id===id)))return null;
 const necesidades=[...new Set(ids)];
 const funciones=new Set(['Página comercial personalizada','Información de contacto y horarios']);
 const tipoCatalogo=['restaurante','cafeteria'].includes(giro)?'Menú digital':'Catálogo de productos';
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
const api=Object.freeze({planes,giros,objetivos,recomendar,orientar,url,leer});
if(typeof module==='object'&&module.exports)module.exports=api;else root.LP_ORIENTACION_WEB=api;
})(globalThis);
