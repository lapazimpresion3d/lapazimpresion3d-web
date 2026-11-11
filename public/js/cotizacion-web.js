const formularioWeb = document.querySelector('#form-web');
const funcionesWeb = document.querySelector('#funciones-web');
const opcionesWeb = funcionesWeb.querySelectorAll('[data-paginas]');
const revisionWeb = document.querySelector('#revision-web');
const mensajeWeb = document.querySelector('#mensaje-web');
const whatsappComercial = document.querySelector('.enlaces a[href^="https://wa.me/"]');

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

  funcionesWeb.hidden = !hayFunciones;
}

formularioWeb.addEventListener('change', actualizarFunciones);
window.addEventListener('pageshow', actualizarFunciones);

const telefonoWeb = formularioWeb.elements.telefono;
telefonoWeb.addEventListener('input', () => telefonoWeb.setCustomValidity(''));

for (const nombre of ['negocio', 'giro', 'detalles']) {
  const campo = formularioWeb.elements[nombre];
  campo.addEventListener('input', () => campo.setCustomValidity(''));
}

formularioWeb.addEventListener('submit', (evento) => {
  evento.preventDefault();
  for (const nombre of ['negocio', 'giro', 'detalles']) {
    const campo = formularioWeb.elements[nombre];
    campo.setCustomValidity(campo.value.trim() ? '' : 'Completa este campo.');
  }
  const digitos = telefonoWeb.value.replace(/\D/g, '').length;
  telefonoWeb.setCustomValidity(digitos >= 10 && digitos <= 15 ? '' : 'Escribe un número de 10 a 15 dígitos.');
  if (!formularioWeb.reportValidity()) return;

  const datos = new FormData(formularioWeb);
  const lista = (nombre) => datos.getAll(nombre).join('\n- ');
  const lineas = [
    'Hola, quiero solicitar una cotización para una página web.',
    '',
    `Negocio: ${datos.get('negocio').trim()}`,
    `Giro: ${datos.get('giro').trim()}`,
    `WhatsApp de contacto: ${datos.get('telefono').trim()}`,
    `Tipo de página: ${datos.get('tipo')}`
  ];
  if (lista('funciones')) lineas.push('', `Funciones:\n- ${lista('funciones')}`);
  if (lista('complementos')) lineas.push('', `Complementos:\n- ${lista('complementos')}`);
  lineas.push('', `Lo que necesito: ${datos.get('detalles').trim()}`);

  mensajeWeb.setCustomValidity('');
  mensajeWeb.value = lineas.join('\n');
  formularioWeb.hidden = true;
  revisionWeb.hidden = false;
  document.querySelector('#titulo-revision').focus();
});

mensajeWeb.addEventListener('input', () => mensajeWeb.setCustomValidity(''));

document.querySelector('#abrir-whatsapp').addEventListener('click', (evento) => {
  const mensaje = mensajeWeb.value.trim();
  mensajeWeb.setCustomValidity(mensaje ? '' : 'Escribe el mensaje que quieres enviar.');
  if (!mensajeWeb.reportValidity()) {
    evento.preventDefault();
    return;
  }

  const enlace = evento.currentTarget;
  const destino = new URL(enlace.href);
  destino.searchParams.set('text', mensaje);
  enlace.href = destino.href;
});

function mostrarFormulario() {
  revisionWeb.hidden = true;
  formularioWeb.hidden = false;
  (formularioWeb.querySelector('[name="tipo"]:checked') ||
    formularioWeb.querySelector('[name="tipo"]')).focus();
}

document.querySelector('#editar-cotizacion').addEventListener('click', mostrarFormulario);

actualizarFunciones();
formularioWeb.hidden = false;
