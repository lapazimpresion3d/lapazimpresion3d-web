const formularioWeb = document.querySelector('#form-web');
const funcionesWeb = document.querySelector('#funciones-web');
const opcionesWeb = funcionesWeb.querySelectorAll('[data-funcion]');
const ayudaPedidos = document.querySelector('#ayuda-pedidos');
const revisionWeb = document.querySelector('#revision-web');
const mensajeWeb = document.querySelector('#mensaje-web');
const dominioActualWeb = document.querySelector('#campo-dominio-actual');
function actualizarDominio() {
  const tengoDominio = formularioWeb.querySelector('[name="situacion_dominio"]:checked')?.value === 'tengo_dominio';
  dominioActualWeb.hidden = !tengoDominio;
  if (!tengoDominio) formularioWeb.elements.dominio_actual.value = '';
}
formularioWeb.addEventListener('change', actualizarDominio);


const planesCotizacion = {
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
    "precio": "Implementación desde $1,500 MXN · $299 MXN al mes + IVA",
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
    "precio": "Implementación desde $2,500 MXN · $449 MXN al mes + IVA",
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
    "precio": "Implementación desde $3,500 MXN · $649 MXN al mes + IVA",
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
const bloquePlan = document.getElementById('funciones-plan');
const bloqueExtra = document.getElementById('funciones-extra');
const contenedorExtra = document.getElementById('funciones-adicionales');
const resumenPaquete = document.getElementById('resumen-paquete-web');
const tablaPaquetes = document.getElementById('precios-paquetes');
const radiosPaquete = Array.from(tablaPaquetes.querySelectorAll('input[name="paquete"]'));
let ultimoPaquete = null;
let incluidas = new Set();
// Al cambiar de paquete se carga su selección completa, sin extras heredados.
function actualizarFunciones() {
  const clave = radiosPaquete.find(r => r.checked)?.value || 'a-medida';
  for (const radio of radiosPaquete) radio.closest('tr').classList.toggle('paquete-seleccionado',radio.checked);
  const plan = Object.hasOwn(planesCotizacion, clave) ? planesCotizacion[clave] : null;
  const cambio = ultimoPaquete !== clave;
  const nuevasIncluidas = new Set(plan?.funciones || []);
  if (cambio) {
    // Aplicar todas las casillas antes de evaluar sus dependencias (carrito, etc.).
    for (const opcion of opcionesWeb) {
      const campo = opcion.querySelector('input');
      campo.checked = nuevasIncluidas.has(campo.value);
    }
  }
  let hayExtra = false;
  for (const opcion of opcionesWeb) {
    const campo = opcion.querySelector('input');
    const requiere = opcion.dataset.requiere;
    const destino = !plan || nuevasIncluidas.has(campo.value) ? bloquePlan : bloqueExtra;
    if (opcion.parentElement !== destino) destino.append(opcion);
    opcion.hidden = false;
    campo.disabled = Boolean(requiere && !document.getElementById(requiere).checked);
    if (campo.disabled) campo.checked = false;
    opcion.classList.toggle('funcion-seleccionada', campo.checked);
    if (destino === bloqueExtra) hayExtra = true;
  }
  // No arrastrar adicionales de otra cotización al cambiar de paquete.
  if (cambio) contenedorExtra.open = false;
  ultimoPaquete = clave;
  incluidas = nuevasIncluidas;
  resumenPaquete.hidden = !plan;
  if (plan) {
    document.getElementById('nombre-paquete-web').textContent = plan.nombre;
    document.getElementById('precio-paquete-web').textContent = plan.precio;
    document.getElementById('alcance-paquete-web').textContent = plan.alcance;
    document.getElementById('ficha-paquete-web').href = 'paquetes-web.html#' + clave;
  }
  const tituloFunciones = document.getElementById('titulo-funciones-plan');
  const conteoFunciones = document.getElementById('conteo-funciones-plan');
  document.getElementById('leyenda-funciones-web').textContent = plan ? 'Características de ' + plan.nombre : 'Características y funciones del proyecto a medida';
  tituloFunciones.hidden = !plan;
  tituloFunciones.textContent = plan ? 'Funciones de ' + plan.nombre : 'Funciones del proyecto';
  conteoFunciones.hidden = !plan;
  const marcadasPlan = Array.from(opcionesWeb).filter(o=>o.parentElement===bloquePlan && o.querySelector('input').checked).length;
  conteoFunciones.textContent = plan ? marcadasPlan + ' de ' + nuevasIncluidas.size + ' funciones seleccionadas. Puedes desmarcar las que no necesites; el alcance y la disponibilidad se confirman en la propuesta.' : '';
  const extrasSeleccionadas = opcionesWeb.length && Array.from(opcionesWeb).filter(o=>o.parentElement===bloqueExtra && o.querySelector('input').checked).length;
  document.getElementById('estado-paquete-web').textContent = plan ? plan.nombre + ' seleccionado · ' + marcadasPlan + ' de ' + nuevasIncluidas.size + ' funciones marcadas. Revisa sus características debajo.' : 'Proyecto a medida seleccionado · elige las funciones que necesitas.';
  contenedorExtra.querySelector('summary').textContent = 'Funciones adicionales bajo cotización' + (extrasSeleccionadas ? ' (' + extrasSeleccionadas + ' seleccionadas)' : '');
  document.getElementById('orientacion-paquete-web').hidden = !plan;
  contenedorExtra.hidden = !hayExtra;
  ayudaPedidos.hidden = Boolean(plan && !nuevasIncluidas.has("Carrito y pedidos desde la página"));
  funcionesWeb.hidden = false;
}
formularioWeb.addEventListener('change', actualizarFunciones);
// Los radios pertenecen al formulario mediante form=, pero sus eventos no suben por él.
for (const radio of radiosPaquete) {
  radio.addEventListener('change', actualizarFunciones);
  radio.closest('tr').addEventListener('click', evento => {
    if (evento.target.closest('label, input')) return;
    radio.checked = true;
    actualizarFunciones();
  });
}
window.addEventListener('pageshow', actualizarFunciones);

const telefonoWeb = formularioWeb.elements.telefono;
const confirmacionWeb = document.querySelector('#confirmacion-web');
const errorWeb = document.querySelector('#error-web');
const botonEnviar = document.querySelector('#enviar-solicitud-web');
const resumenWeb = document.querySelector('#resumen-web');
let datosPendientes = null;

function telefonoMexicano(valor) {
  let d = valor.replace(/\D/g, '');
  if (d.length === 12 && d.startsWith('52')) d = d.slice(2);
  else if (d.length === 13 && d.startsWith('521')) d = d.slice(3);
  return /^\d{10}$/.test(d) ? d : null;
}

formularioWeb.addEventListener('submit', (evento) => {
  evento.preventDefault();
  const telefono = telefonoMexicano(telefonoWeb.value);
  telefonoWeb.setCustomValidity(telefono ? '' : 'Escribe un número mexicano válido de 10 dígitos.');
  if (!formularioWeb.reportValidity()) return;
  const f = new FormData(formularioWeb);
  datosPendientes = {
    nombre: String(f.get('nombre') || '').trim(),
    negocio: String(f.get('negocio') || '').trim(),
    giro: String(f.get('giro') || '').trim(),
    paquete: Object.hasOwn(planesCotizacion, f.get('paquete')) ? planesCotizacion[f.get('paquete')].nombre : '',
    telefono,
    funciones: f.getAll('funciones').map(String),
    complementos: f.getAll('complementos').map(String),
    detalles: String(f.get('detalles') || '').trim(),
    presupuesto: String(f.get('presupuesto') || ''),
    situacion_dominio: String(f.get('situacion_dominio') || 'subdominio'),
    dominio_actual: String(f.get('dominio_actual') || '').trim(),
    acepta_privacidad: f.get('privacidad') === 'on'
  };
  const lineas = [
    `Nombre: ${datosPendientes.nombre}`,
    `Negocio: ${datosPendientes.negocio}`,
    `Giro: ${datosPendientes.giro}`,
    `Paquete de interés: ${datosPendientes.paquete || "Proyecto a medida / sin definir"}`,
    `WhatsApp: ${datosPendientes.telefono}`,
    `Funciones: ${datosPendientes.funciones.join('; ') || 'Ninguna'}`,
    ...(datosPendientes.paquete ? [`Funciones adicionales bajo revisión: ${datosPendientes.funciones.filter(x => !incluidas.has(x)).join('; ') || 'Ninguna'}`] : []),
    `Complementos: ${datosPendientes.complementos.join('; ') || 'Ninguno'}`,
    `Presupuesto: ${datosPendientes.presupuesto || "No indicado"}`,
    `Modalidad de dirección: ${({subdominio:"Subdominio incluido",necesito_dominio:"Dominio .com nuevo",tengo_dominio:"Dominio existente",orientacion:"Necesita orientación"})[datosPendientes.situacion_dominio] || datosPendientes.situacion_dominio}`,
    `Dirección actual: ${datosPendientes.dominio_actual || 'No indicada'}`,
    `Descripción: ${datosPendientes.detalles}`
  ];
  resumenWeb.textContent = lineas.join('\n');
  errorWeb.hidden = true;
  formularioWeb.hidden = true;
  tablaPaquetes.hidden = true;
  revisionWeb.hidden = false;
  document.querySelector('#titulo-revision').focus();
});

telefonoWeb.addEventListener('input', () => telefonoWeb.setCustomValidity(''));

document.querySelector('#editar-cotizacion').addEventListener('click', () => {
  if (botonEnviar.disabled) return;
  revisionWeb.hidden = true;
  formularioWeb.hidden = false;
  tablaPaquetes.hidden = false;
  radiosPaquete.find(r => r.checked)?.focus();
});

botonEnviar.addEventListener('click', async () => {
  if (!datosPendientes || botonEnviar.disabled) return;
  botonEnviar.disabled = true;
  botonEnviar.textContent = 'Registrando solicitud…';
  errorWeb.hidden = true;
  try {
    const res = await fetch('/api/web/propuestas', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(datosPendientes)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok || !data.folio) throw new Error(data.error || 'No pudimos registrar tu solicitud. Intenta nuevamente.');
    document.querySelector('#folio-web').textContent = data.folio;
    revisionWeb.hidden = true;
    confirmacionWeb.hidden = false;
    confirmacionWeb.focus();
  } catch (error) {
    errorWeb.textContent = error.message || 'No se pudo registrar la solicitud.';
    errorWeb.hidden = false;
  } finally {
    botonEnviar.disabled = false;
    botonEnviar.textContent = 'Enviar solicitud';
  }
});

// Solo valores conocidos: no insertar parámetros de URL como HTML ni cambiar selecciones en pageshow.
const parametrosCatalogo = new URLSearchParams(location.search);
const paqueteCatalogo = parametrosCatalogo.get('paquete');
const radioInicial = radiosPaquete.find(r => r.value === paqueteCatalogo);
if (radioInicial) radioInicial.checked = true;
const girosCatalogo = new Map([["restaurante","Restaurante / taquería"],["cafeteria","Cafetería"],["barberia","Barbería / estética"],["mascotas","Tienda de mascotas"],["comercio","Comercio / tienda"],["servicios","Servicios profesionales"],["turismo","Turismo y actividades"],["otro","Otro giro"]]);
const giroCatalogo = parametrosCatalogo.get('giro');
if (!formularioWeb.elements.giro.value && girosCatalogo.has(giroCatalogo)) formularioWeb.elements.giro.value = girosCatalogo.get(giroCatalogo);
actualizarFunciones();
actualizarDominio();
formularioWeb.hidden = false;
// El panel está cerrado inicialmente; el enlace directo a condiciones lo abre.
function abrirCondicionesDesdeEnlace() {
  if (location.hash !== "#condiciones-paquetes") return;
  const destino = document.getElementById("condiciones-paquetes");
  if (!destino) return;
  destino.open = true;
  requestAnimationFrame(() => {
    if (location.hash !== "#condiciones-paquetes") return;
    destino.querySelector("summary")?.focus({preventScroll:true});
    destino.scrollIntoView({block:"start"});
  });
}
abrirCondicionesDesdeEnlace();
window.addEventListener("hashchange", abrirCondicionesDesdeEnlace);
