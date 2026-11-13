const formularioWeb = document.querySelector('#form-web');
const funcionesWeb = document.querySelector('#funciones-web');
const opcionesWeb = funcionesWeb.querySelectorAll('[data-paginas]');
const ayudaPedidos = document.querySelector('#ayuda-pedidos');
const revisionWeb = document.querySelector('#revision-web');
const mensajeWeb = document.querySelector('#mensaje-web');

function actualizarFunciones() {
  const tipo = formularioWeb.querySelector('[name="tipo"]:checked')?.dataset.tipo;
  const disponibles = {
    productos: tipo === 'menu' || tipo === 'catalogo',
    menu: tipo === 'menu',
    negocio: Boolean(tipo && tipo !== 'contacto')
  };
  let hayFunciones = false;

  for (const opcion of opcionesWeb) {
    const campo = opcion.querySelector('input');
    const requiere = opcion.dataset.requiere;
    opcion.hidden = !disponibles[opcion.dataset.paginas];
    campo.disabled = opcion.hidden || Boolean(requiere && !document.getElementById(requiere).checked);
    if (campo.disabled) campo.checked = false;
    hayFunciones ||= !opcion.hidden;
  }

  ayudaPedidos.hidden = !disponibles.productos;
  funcionesWeb.hidden = !hayFunciones;
}

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
    telefono,
    tipo_pagina: String(f.get('tipo') || ''),
    funciones: f.getAll('funciones').map(String),
    complementos: f.getAll('complementos').map(String),
    detalles: String(f.get('detalles') || '').trim(),
    presupuesto: String(f.get('presupuesto') || ''),
    acepta_privacidad: f.get('privacidad') === 'on'
  };
  const lineas = [
    `Nombre: ${datosPendientes.nombre}`,
    `Negocio: ${datosPendientes.negocio}`,
    `Giro: ${datosPendientes.giro}`,
    `WhatsApp: ${datosPendientes.telefono}`,
    `Tipo de página: ${datosPendientes.tipo_pagina}`,
    `Funciones: ${datosPendientes.funciones.join('; ') || 'Ninguna'}`,
    `Complementos: ${datosPendientes.complementos.join('; ') || 'Ninguno'}`,
    `Presupuesto: ${datosPendientes.presupuesto || "No indicado"}`,
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
  formularioWeb.querySelector('[name="tipo"]:checked')?.focus();
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

actualizarFunciones();
formularioWeb.hidden = false;
