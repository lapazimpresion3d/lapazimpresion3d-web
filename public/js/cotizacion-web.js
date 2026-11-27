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
let ultimoPaquete = null;
let incluidas = new Set();
let automaticas = new Set();
// Los módulos específicos de menú, inventario, pedidos o agenda no se presuponen.
const comunes = new Set(["Página comercial personalizada","Información de contacto y horarios","Panel privado"]);
function actualizarFunciones() {
  const clave = formularioWeb.elements.paquete.value;
  const plan = Object.hasOwn(planesCotizacion, clave) ? planesCotizacion[clave] : null;
  const cambio = ultimoPaquete !== clave;
  const nuevasIncluidas = new Set(plan?.funciones || []);
  if (cambio) {
    for (const opcion of opcionesWeb) {
      const campo = opcion.querySelector('input');
      if (automaticas.has(campo.value) && !nuevasIncluidas.has(campo.value)) {
        campo.checked = false;
        automaticas.delete(campo.value);
      }
      if (comunes.has(campo.value) && nuevasIncluidas.has(campo.value) && !incluidas.has(campo.value) && !campo.checked) {
        campo.checked = true;
        automaticas.add(campo.value);
      }
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
    if (campo.disabled) {campo.checked = false; automaticas.delete(campo.value);}
    if (destino === bloqueExtra) hayExtra = true;
  }
  // No ocultar una elección manual al cambiar de paquete.
  if (cambio) contenedorExtra.open = Array.from(bloqueExtra.querySelectorAll('input')).some(c=>c.checked);
  ultimoPaquete = clave;
  incluidas = nuevasIncluidas;
  resumenPaquete.hidden = !plan;
  if (plan) {
    document.getElementById('nombre-paquete-web').textContent = plan.nombre;
    document.getElementById('precio-paquete-web').textContent = plan.precio;
    document.getElementById('alcance-paquete-web').textContent = plan.alcance;
    document.getElementById('ficha-paquete-web').href = 'paquetes-web.html#' + clave;
  }
  document.getElementById('titulo-funciones-plan').hidden = !plan;
  document.getElementById('orientacion-paquete-web').hidden = !plan;
  contenedorExtra.hidden = !hayExtra;
  ayudaPedidos.hidden = Boolean(plan && !nuevasIncluidas.has("Carrito y pedidos desde la página"));
  funcionesWeb.hidden = false;
}
formularioWeb.addEventListener('change', evento => {
  if (evento.target?.name === 'funciones') automaticas.delete(evento.target.value);
});

formularioWeb.addEventListener('change', actualizarFunciones);
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
    paquete: formularioWeb.elements.paquete.selectedOptions[0]?.value ? formularioWeb.elements.paquete.selectedOptions[0].textContent.trim() : '',
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
  revisionWeb.hidden = false;
  document.querySelector('#titulo-revision').focus();
});

telefonoWeb.addEventListener('input', () => telefonoWeb.setCustomValidity(''));

document.querySelector('#editar-cotizacion').addEventListener('click', () => {
  if (botonEnviar.disabled) return;
  revisionWeb.hidden = true;
  formularioWeb.hidden = false;
  formularioWeb.elements.paquete.focus();
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
const selectorPaquete = formularioWeb.elements.paquete;
const paqueteCatalogo = parametrosCatalogo.get('paquete');
if (Array.from(selectorPaquete.options).some(o => o.value === paqueteCatalogo)) selectorPaquete.value = paqueteCatalogo;
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
