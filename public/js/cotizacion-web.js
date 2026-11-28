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


const planesCotizacion = LP_ORIENTACION_WEB.planes;
const resumenPaquete = document.getElementById('resumen-paquete-web');
const tablaPaquetes = document.getElementById('precios-paquetes');
const radiosPaquete = Array.from(tablaPaquetes.querySelectorAll('input[name="paquete"]'));
const ordenPaquetes = Object.keys(planesCotizacion);
const coberturas = new Map(ordenPaquetes.map(clave=>[clave,new Set(planesCotizacion[clave].funciones)]));
// El inventario avanzado cubre el básico, aunque no se premarquen dos módulos de inventario.
coberturas.get('gestion-profesional').add('Inventario básico');
const funcionesCatalogo = new Set(Array.from(coberturas.values()).flatMap(s=>Array.from(s)));
let claveActiva = 'a-medida';
let paqueteBase = 'a-medida';
let seleccionEditada = false;
let modoMedida = false;
let incluidas = new Set();
let avisoAjuste = '';
let giroActivo = LP_ORIENTACION_WEB.giroDesdeTexto(formularioWeb.elements.giro.value);
function camposSeleccionados() {
  return Array.from(opcionesWeb).map(o=>o.querySelector('input')).filter(c=>c.checked).map(c=>c.value);
}
function recomendarPaquete(seleccionadas) { return LP_ORIENTACION_WEB.baseRecomendada(seleccionadas,giroActivo); }
function seleccionarPaquete(clave) {
  claveActiva = ordenPaquetes.includes(clave) ? clave : 'a-medida';
  modoMedida = claveActiva === 'a-medida';
  paqueteBase = claveActiva;
  seleccionEditada = false;
  avisoAjuste = '';
  const funciones = new Set(LP_ORIENTACION_WEB.funcionesPorGiro(claveActiva,giroActivo));
  for (const opcion of opcionesWeb) opcion.querySelector('input').checked = funciones.has(opcion.querySelector('input').value);
  actualizarFunciones();
}
function actualizarFunciones() {
  const plan = planesCotizacion[claveActiva];
  incluidas = new Set([...(coberturas.get(claveActiva)||[])].filter(n=>!['externa','personalizado','adaptacion'].includes(LP_ORIENTACION_WEB.estadoFuncion(n,giroActivo))));
  for (const radio of radiosPaquete) {
    radio.checked = radio.value === claveActiva;
    radio.closest('tr').classList.toggle('paquete-seleccionado',radio.checked);
  }
  const seleccionadas = camposSeleccionados();
  const configuracion = LP_ORIENTACION_WEB.configuracion(paqueteBase,giroActivo,seleccionadas);
  for (const opcion of opcionesWeb) {
    const campo = opcion.querySelector('input');
    // Todas las casillas son seleccionables; las dependencias se resuelven al editarlas.
    opcion.hidden = false;
    campo.disabled = false;
    opcion.classList.toggle('funcion-seleccionada',campo.checked);
    const nivelMinimo = LP_ORIENTACION_WEB.metadatos[campo.value]?.minimo;
    const minimo = nivelMinimo ? ordenPaquetes[nivelMinimo-1] : null;
    const etiqueta = opcion.querySelector('.nivel-funcion');
    const estado=LP_ORIENTACION_WEB.estadoFuncion(campo.value,giroActivo);
    etiqueta.textContent = ['externa','personalizado','adaptacion'].includes(estado)?(minimo?'Desde P'+(ordenPaquetes.indexOf(minimo)+1)+' · ':'')+({externa:'Integración externa',personalizado:'Desarrollo personalizado',adaptacion:'Adaptación al giro'})[estado]+' · Sujeto a cotización':(minimo?'Desde P'+(ordenPaquetes.indexOf(minimo)+1):'Sujeto a cotización')+(estado==='demo'?' · Disponible en demostración; implementación según propuesta':' · Alcance comercial según propuesta');
    etiqueta.hidden = !etiqueta.textContent;
  }
  resumenPaquete.hidden = !plan;
  if (plan) {
    document.getElementById('nombre-paquete-web').textContent = plan.nombre;
    document.getElementById('precio-paquete-web').textContent = (configuracion.personalizada?'Referencia del paquete sugerido: ':'')+plan.precio;
    document.getElementById('alcance-paquete-web').textContent = LP_ORIENTACION_WEB.alcancePorGiro(claveActiva,giroActivo);
    document.getElementById('ficha-paquete-web').href = 'paquetes-web.html#' + claveActiva;
  }
  document.getElementById('leyenda-funciones-web').textContent = 'Características y funciones del proyecto';
  document.getElementById('titulo-funciones-plan').hidden = false;
  document.getElementById('titulo-funciones-plan').textContent = plan ? 'Funciones de ' + plan.nombre : 'Funciones del proyecto a medida';
  const conteo = document.getElementById('conteo-funciones-plan');
  conteo.hidden = false;
  const extras = seleccionadas.filter(v=>!funcionesCatalogo.has(v)||['externa','personalizado','adaptacion'].includes(LP_ORIENTACION_WEB.estadoFuncion(v,giroActivo)));
  conteo.textContent = seleccionadas.length + ' de ' + opcionesWeb.length + ' funciones seleccionadas.' + (extras.length ? ' ' + extras.length + ' función adicional sujeta a cotización.' : '');
  document.getElementById('estado-paquete-web').textContent = (plan ? plan.nombre + ' · ' + plan.precio : 'Proyecto a medida · bajo cotización') + (extras.length ? ' · incluye opciones sujetas a cotización' : '');
  const ajuste=document.getElementById('ajuste-precio-web');
  ajuste.textContent=configuracion.personalizada?'Configuración personalizada · '+configuracion.agregadas.length+' añadidas, '+configuracion.retiradas.length+' retiradas respecto al paquete inicial. Implementación y mensualidad finales sujetas a cotización según módulos, adaptaciones y alcance.':'Configuración estándar sugerida · tarifas publicadas como referencia.';
  document.getElementById('estado-paquete-web').textContent += configuracion.personalizada?' · Precio final personalizado por cotizar':'';
  const aviso = document.getElementById('aviso-ajuste-paquete');
  aviso.textContent = avisoAjuste;
  aviso.hidden = !avisoAjuste;
  document.getElementById('orientacion-paquete-web').hidden = false;
  ayudaPedidos.hidden = false;
  funcionesWeb.hidden = false;
  filtrarFunciones();actualizarDemoCotizacion();
}
const normalizarBusqueda=v=>String(v||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'');
const filtroIds=['buscar-funciones','filtrar-nivel','filtrar-categoria'];
for(const id of filtroIds){const el=document.getElementById(id);el.addEventListener(id==='buscar-funciones'?'input':'change',()=>filtrarFunciones(true));}
function filtrarFunciones(abrir=false){
 const a=LP_ORIENTACION_WEB,q=normalizarBusqueda(document.getElementById('buscar-funciones').value),nivel=document.getElementById('filtrar-nivel').value,cat=document.getElementById('filtrar-categoria').value;
 for(const opcion of opcionesWeb){const input=opcion.querySelector('input'),m=a.metadatos[input.value],estado=a.estadoFuncion(input.value,giroActivo),extra=['externa','personalizado','adaptacion'].includes(estado);
 opcion.hidden=(q&&!normalizarBusqueda(opcion.textContent).includes(q))||(cat!==''&&String(m?.categoria)!==cat)||(nivel!==''&&(nivel==='extra'?!extra:String(m?.minimo)!==nivel));}
 for(const g of funcionesWeb.querySelectorAll('.grupo-funciones')){const visible=[...g.querySelectorAll('[data-funcion]')].filter(x=>!x.hidden);g.hidden=!visible.length;g.querySelector('.grupo-conteo').textContent=visible.length?'('+visible.filter(x=>x.querySelector('input').checked).length+' seleccionadas / '+visible.length+')':'';if(abrir&&visible.length&&(q||cat!==''||nivel!==''))g.open=true;}
 const seleccionadas=camposSeleccionados();document.getElementById('resumen-funciones-elegidas').textContent=seleccionadas.length?'Seleccionadas: '+seleccionadas.join(' · '):'Sin funciones seleccionadas.';
}
function actualizarDemoCotizacion(){const c=globalThis.LP_DEMOS,p='p'+(ordenPaquetes.indexOf(claveActiva)+1),n=c?.negocios.find(n=>c.giros[n]===giroActivo),box=document.getElementById('enlaces-demo-cotizacion');box.hidden=!(n&&planesCotizacion[claveActiva]);if(!box.hidden){document.getElementById('demo-cotizacion-publica').href=c.url(n,p);document.getElementById('demo-cotizacion-panel').href=c.url(n,p,'panel');}}

function editarFuncion(campo) {
  const opcion = campo.closest('[data-funcion]');
  if (!opcion) return;
  seleccionEditada = true;
  const antes=camposSeleccionados(),despues=LP_ORIENTACION_WEB.editar(antes,campo.value,campo.checked);
  const elegidas=new Set(despues);
  for(const o of opcionesWeb){const input=o.querySelector('input');input.checked=elegidas.has(input.value);}
  const agregadas=despues.filter(n=>!antes.includes(n)),retiradas=antes.filter(n=>!elegidas.has(n));
  avisoAjuste=(agregadas.length?'Requisitos añadidos: '+agregadas.join(', ')+'. ':'')+(retiradas.length?'Funciones dependientes o niveles sustituidos: '+retiradas.join(', ')+'.':'');
  if (!modoMedida) {
    const anterior = claveActiva;
    claveActiva = recomendarPaquete(camposSeleccionados());
    if (anterior !== claveActiva) avisoAjuste += ' Paquete sugerido actualizado a ' + (planesCotizacion[claveActiva]?.nombre || 'Proyecto a medida') + ' según tus funciones.';
  }
  actualizarFunciones();
}
formularioWeb.addEventListener('change', evento => {
  if (evento.target?.name === 'funciones') editarFuncion(evento.target);
  if (evento.target?.name === 'giro') {const nuevo=LP_ORIENTACION_WEB.giroDesdeTexto(evento.target.value);if(nuevo!==giroActivo){const previo=giroActivo;giroActivo=nuevo;if(!previo&&!seleccionEditada&&!modoMedida){seleccionarPaquete(paqueteBase);}else{if(!modoMedida)claveActiva=recomendarPaquete(camposSeleccionados());avisoAjuste='Se conservaron tus selecciones. Las funciones de otro giro se indican como adaptaciones; revisa las recomendaciones.';actualizarFunciones();}}}
});
for (const radio of radiosPaquete) {
  radio.addEventListener('change',()=>seleccionarPaquete(radio.value));
  radio.closest('tr').addEventListener('click', evento => {
    if (evento.target.closest('label, input')) return;
    if (!radio.checked) seleccionarPaquete(radio.value);
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
  const configuracion = LP_ORIENTACION_WEB.configuracion(paqueteBase,giroActivo,camposSeleccionados());
  datosPendientes = {
    paquete_base: planesCotizacion[paqueteBase]?.nombre || '',
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
    `Paquete recomendado: ${planesCotizacion[recomendarPaquete(datosPendientes.funciones)]?.nombre || "Proyecto a medida"}`,
    `Paquete inicial: ${datosPendientes.paquete_base || "Proyecto a medida"}`,
    `Tarifas de referencia: ${planesCotizacion[claveActiva]?.precio || "Sujeto a cotización"}`,
    `Funciones añadidas: ${configuracion.agregadas.join('; ') || 'Ninguna'}`,
    `Funciones retiradas: ${configuracion.retiradas.join('; ') || 'Ninguna'}`,
    `Precio final: ${configuracion.personalizada?'Configuración personalizada; implementación y mensualidad sujetas a cotización':'Tarifas base según propuesta'}`,
    `Integraciones y adaptaciones: ${datosPendientes.funciones.filter(n=>["externa","personalizado","adaptacion"].includes(LP_ORIENTACION_WEB.estadoFuncion(n,giroActivo))).join("; ") || "Ninguna"} (sujeto a cotización cuando corresponda)`,
    `WhatsApp: ${datosPendientes.telefono}`,
    `Funciones: ${datosPendientes.funciones.join('; ') || 'Ninguna'}`,
    ...(datosPendientes.paquete ? [`Funciones adicionales bajo revisión: ${datosPendientes.funciones.filter(x => !incluidas.has(x)).join('; ') || 'Ninguna'}`] : []),
    `Complementos: ${datosPendientes.complementos.join('; ') || 'Ninguno'}`,
    `Preferencia de inversión: ${formularioWeb.elements.presupuesto.selectedOptions[0]?.value ? formularioWeb.elements.presupuesto.selectedOptions[0].textContent.trim() : "No indicada"}`,
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
    const token = await globalThis.LP_Turnstile.token('cotizacion_web',botonEnviar);
    const res = await fetch('/api/web/propuestas', {
      method: 'POST', credentials: 'same-origin',
      headers: { 'Content-Type': 'application/json', 'X-Turnstile-Token':token },
      body: JSON.stringify(datosPendientes)
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok || !data.folio) throw new Error(data.error || 'No pudimos registrar tu solicitud. Intenta nuevamente.');
    globalThis.LP_Medicion?.emit('generate_lead',{source:'web'});
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
const giroCatalogo = parametrosCatalogo.get('giro');
if (!formularioWeb.elements.giro.value && Object.hasOwn(LP_ORIENTACION_WEB.giros,giroCatalogo)) formularioWeb.elements.giro.value = LP_ORIENTACION_WEB.giros[giroCatalogo];
giroActivo = LP_ORIENTACION_WEB.giroDesdeTexto(formularioWeb.elements.giro.value);
seleccionarPaquete(radioInicial?.value || radiosPaquete.find(r=>r.checked)?.value || 'a-medida');
const orientacionInicial = LP_ORIENTACION_WEB.leer(parametrosCatalogo);
if (orientacionInicial) {
  claveActiva = orientacionInicial.paquete;
  paqueteBase = claveActiva;
  seleccionEditada = true;
  modoMedida = false;
  const elegidas = new Set(orientacionInicial.funciones);
  for (const opcion of opcionesWeb) opcion.querySelector('input').checked = elegidas.has(opcion.querySelector('input').value);
  avisoAjuste = 'Se cargaron las funciones de tu orientación. Puedes cambiarlas antes de solicitar la cotización.';
  actualizarFunciones();
}
actualizarDominio();
formularioWeb.hidden = false;
// Resolver las anclas después de inicializar el formulario y estabilizar su diseño.
function navegarAnclaCotizacion() {
  const hash = location.hash;
  const id = hash === "#precios-paquetes" ? "precios-paquetes" : hash === "#condiciones-paquetes" ? "condiciones-paquetes" : null;
  if (!id) return;
  const destino = document.getElementById(id);
  if (!destino || destino.closest("[hidden]")) return;
  if (id === "condiciones-paquetes") destino.open = true;
  requestAnimationFrame(() => {
    if (location.hash !== hash || destino.closest("[hidden]")) return;
    destino.querySelector(id === "condiciones-paquetes" ? "summary" : "h2")?.focus({preventScroll:true});
    destino.scrollIntoView({block:"start",behavior:"auto"});
  });
}
if (document.readyState === "complete") navegarAnclaCotizacion();
else window.addEventListener("load", navegarAnclaCotizacion, {once:true});
window.addEventListener("hashchange", navegarAnclaCotizacion);
