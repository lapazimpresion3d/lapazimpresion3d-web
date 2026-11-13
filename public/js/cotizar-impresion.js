(() => {"use strict";
const form=document.querySelector('#form-servicio'),tipo=document.querySelector('#servicio'),revision=document.querySelector('#revision'),confirmacion=document.querySelector('#confirmacion'),error=document.querySelector('#mensaje-error'),btn=document.querySelector('#enviar');
const bloques=[...document.querySelectorAll('[data-servicio]')],titulos={llaveros:'Cotizar llaveros personalizados',fdm_medida:'Solicitar impresión 3D a medida',resina:'Cotizar figuras y miniaturas en resina',soporte_qr:'Cotizar soportes QR/NFC'};
let pendiente=null;
const imagenesInput=document.querySelector('#imagenes'),listaImagenes=document.querySelector('#lista-imagenes');
const contextoInput=form.elements.contexto,academicoBloque=document.querySelector('#datos-academicos'),tipoAcademico=form.elements.tipo_trabajo_academico,institucion=form.elements.institucion_academica;
const TIPOS_ACADEMICOS={proyecto_escolar:'Proyecto escolar o universitario',prototipo:'Prototipo o pieza funcional',maqueta:'Maqueta o modelo a escala',investigacion:'Investigación o tesis',otro:'Otro proyecto académico'};
function actualizarAcademico(){const esAcademico=contextoInput.value==='academico';academicoBloque.hidden=!esAcademico;tipoAcademico.disabled=!esAcademico;institucion.disabled=!esAcademico;tipoAcademico.required=esAcademico;if(!esAcademico){tipoAcademico.value='';institucion.value='';}}
contextoInput.addEventListener('change',actualizarAcademico);actualizarAcademico();
const TIPOS_IMAGEN=['image/jpeg','image/png','image/webp'];
function validarImagenes(){
 const fotos=Array.from(imagenesInput.files||[]);
 const error=fotos.length>3?'Selecciona como máximo 3 imágenes.':fotos.some(f=>!TIPOS_IMAGEN.includes(f.type))?'Solo se permiten imágenes JPG, PNG o WebP.':fotos.some(f=>f.size>4*1024*1024)?'Cada imagen debe pesar como máximo 4 MB.':'';
 imagenesInput.setCustomValidity(error);
 listaImagenes.replaceChildren();
 for(const f of fotos){const li=document.createElement('li');li.textContent=`${f.name} (${(f.size/1024/1024).toFixed(2)} MB)`;listaImagenes.append(li);}
 return !error;
}
imagenesInput.addEventListener('change',validarImagenes);
function seleccionar(){const id=tipo.value;document.querySelector('#titulo-pagina').textContent=titulos[id];document.title=titulos[id]+' · Lapazimpresion3d';for(const b of bloques){b.hidden=b.dataset.servicio!==id;for(const e of b.querySelectorAll('input,select,textarea'))e.disabled=b.hidden;}}
function telefono(v){let s=v.replace(/\D/g,'');if(s.length===12&&s.startsWith('52'))s=s.slice(2);else if(s.length===13&&s.startsWith('521'))s=s.slice(3);return /^\d{10}$/.test(s)?s:null;}
const servicioInicial=new URLSearchParams(location.search).get('servicio');if(Object.hasOwn(titulos,servicioInicial))tipo.value=servicioInicial;
tipo.addEventListener('change',seleccionar);seleccionar();
form.addEventListener('submit',e=>{e.preventDefault();const f=new FormData(form), tel=telefono(String(f.get('telefono')||''));const telField=form.elements.telefono;telField.setCustomValidity(tel?'':'Escribe un número de México de 10 dígitos.');validarImagenes();if(!form.reportValidity())return;
const bloque=bloques.find(x=>x.dataset.servicio===tipo.value),campos={};for(const el of bloque.querySelectorAll('input,select,textarea'))campos[el.name]=String(f.get(el.name)||'').trim();
pendiente={servicio:tipo.value,nombre:String(f.get('nombre')||'').trim(),telefono:tel,proyecto:String(f.get('proyecto')||'').trim(),contexto:String(f.get('contexto')||''),tipo_trabajo_academico:String(f.get('tipo_trabajo_academico')||''),institucion_academica:String(f.get('institucion_academica')||'').trim(),fecha_prioritaria:'',fecha_deseada:String(f.get('fecha_deseada')||''),presupuesto:String(f.get('presupuesto')||''),detalles:String(f.get('detalles')||'').trim(),campos,acepta_privacidad:f.get('privacidad')==='on'};
const lista=[`Servicio: ${titulos[pendiente.servicio]}`,`Nombre: ${pendiente.nombre}`,`WhatsApp: ${pendiente.telefono}`,`Proyecto: ${pendiente.proyecto||'No indicado'}`,`Presupuesto: ${pendiente.presupuesto||'Sin indicar'}`,`Tipo de solicitud: ${pendiente.contexto==='academico'?'Escolar / Académico':pendiente.contexto||'Sin indicar'}`,...(pendiente.contexto==='academico'?[`Trabajo académico: ${TIPOS_ACADEMICOS[pendiente.tipo_trabajo_academico]||'Sin especificar'}`,`Institución: ${pendiente.institucion_academica||'Sin indicar'}`,`Descuento académico: 5% sujeto a verificación; no aplicado automáticamente`]:[]),...Object.entries(campos).filter(([,v])=>v).map(([k,v])=>`${k.replace(/_/g,' ')}: ${v}`),`Descripción: ${pendiente.detalles}`,`Imágenes: ${imagenesInput.files.length ? Array.from(imagenesInput.files).map(f=>f.name).join(", ") : "Ninguna"}`];document.querySelector('#resumen').textContent=lista.join('\n');error.hidden=true;form.hidden=true;revision.hidden=false;document.querySelector('#titulo-revision').focus();});
form.elements.telefono.addEventListener('input',()=>form.elements.telefono.setCustomValidity(''));
document.querySelector('#editar').addEventListener('click',()=>{revision.hidden=true;form.hidden=false;tipo.focus();});
btn.addEventListener('click',async()=>{if(!pendiente||btn.disabled)return;btn.disabled=true;btn.textContent='Registrando…';error.hidden=true;try{const payload=new FormData();payload.set('solicitud',JSON.stringify(pendiente));for(const file of imagenesInput.files)payload.append('imagenes',file,file.name);
const r=await fetch('/api/servicios/propuestas',{method:'POST',credentials:'same-origin',body:payload});const d=await r.json().catch(()=>({}));if(!r.ok||!d.ok||!d.folio)throw new Error(d.error||'No se pudo registrar la solicitud.');document.querySelector('#folio').textContent=d.folio;revision.hidden=true;confirmacion.hidden=false;confirmacion.focus();}catch(e){error.textContent=e.message;error.hidden=false;}finally{btn.disabled=false;btn.textContent='Enviar solicitud';}});
})();