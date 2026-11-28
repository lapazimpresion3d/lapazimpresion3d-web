(()=>{
"use strict";
const el=(tag,txt,cl)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cl)n.className=cl;return n;};
function campo(f,nombre,tag){const l=el("label",nombre),n=el(tag);l.append(n);f.append(l);return n;}
function opcion(s,v,t){const o=el("option",t);o.value=v;s.append(o);}
async function api(path,body){const r=await fetch(path,{method:body?"PUT":"GET",credentials:"same-origin",cache:"no-store",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.error||"Error "+r.status);return d.seguimiento;}
async function gestionarFotos(caja,s,p){
 const ruta="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/avances";
 caja.replaceChildren(el("h4","Fotografías y vistas previas del proceso"));
 const msg=el("p","Cargando imágenes…");msg.setAttribute("role","status");caja.append(msg);
 try{
  const r=await fetch(ruta,{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(!r.ok)throw Error(d.error||"No disponible");
  msg.textContent=d.fotos.length+" de 60 imágenes publicadas. Hasta 6 por actualización.";
  if(s.version&&p.estado!=="cancelado"){
   const f=el("form",undefined,"economica-form"),v=campo(f,"Avance al que pertenece","select");
   s.historial.forEach((h,i)=>opcion(v,String(s.version-i),new Date(h.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})+" · "+(h.mensaje||"Actualización").slice(0,80)));
   const img=campo(f,"Imagen JPG, PNG o WebP (máximo 4 MB)","input");img.type="file";img.accept="image/jpeg,image/png,image/webp";img.required=true;
   const desc=campo(f,"Descripción visible al cliente","textarea");desc.maxLength=500;
   const previa=el("img");previa.className="avance-miniatura";previa.hidden=true;previa.alt="Vista previa local";f.append(previa);
   let local="";img.addEventListener("change",()=>{if(local)URL.revokeObjectURL(local);local="";previa.hidden=true;if(img.files[0]){local=URL.createObjectURL(img.files[0]);previa.src=local;previa.hidden=false;}});
   const b=el("button","Publicar fotografía");b.type="submit";f.append(b);caja.append(f);
   f.addEventListener("submit",async e=>{e.preventDefault();if(!img.files[0]||img.files[0].size>4*1024*1024){msg.textContent="Selecciona una imagen de hasta 4 MB.";return;}if(!confirm("¿Publicar esta imagen en el portal privado del cliente?"))return;b.disabled=true;
    try{const body=new FormData();body.append("imagen",img.files[0]);body.append("descripcion",desc.value);body.append("version",v.value);const r=await fetch(ruta,{method:"POST",body,credentials:"same-origin"}),d=await r.json();if(!r.ok)throw Error(d.error);if(local)URL.revokeObjectURL(local);await gestionarFotos(caja,s,p);}catch(e){msg.textContent=e.message;b.disabled=false;}
   });
  }else if(!s.version)caja.append(el("p","Publica primero una actualización para adjuntar fotografías."));
  const grid=el("div",undefined,"avance-galeria");caja.append(grid);
  for(const a of d.fotos){const fig=el("figure"),link=el("a"),im=el("img");link.href=ruta+"/"+encodeURIComponent(a.id);link.target="_blank";link.rel="noopener noreferrer";im.src=link.href;im.loading="lazy";im.alt=a.descripcion||"Fotografía del proceso";link.append(im);fig.append(link,el("figcaption","Avance "+a.version_avance+" · "+(a.descripcion||"Sin descripción")));
   const b=el("button","Retirar imagen","secundario");b.type="button";b.addEventListener("click",async()=>{if(prompt("Escribe RETIRAR para quitar la imagen del portal y eliminarla del almacenamiento")!=="RETIRAR")return;b.disabled=true;try{const r=await fetch(link.href,{method:"DELETE",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({confirmacion:"RETIRAR"})}),d=await r.json();if(!r.ok)throw Error(d.error);await gestionarFotos(caja,s,p);if(d.limpieza_pendiente)caja.prepend(el("p","Imagen retirada; limpieza R2 pendiente."));}catch(e){msg.textContent=e.message;b.disabled=false;}});fig.append(b);grid.append(fig);
  }
 }catch(e){msg.textContent=e.message;}
}
function agregar(art,p){
 const detalle=el("details",undefined,"seguimiento-admin proyecto-bloque"),caja=el("section",undefined,"economica-panel seguimiento-panel");detalle.append(el("summary","Seguimiento de Mi proyecto"),caja);art.append(detalle);
 const ruta="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/seguimiento";
 let ocupado=false,cargado=false,controlEntrega=new AbortController();
 async function cargar(){if(ocupado)return;ocupado=true;caja.replaceChildren(el("p","Cargando…"));try{pintar(await api(ruta));cargado=true;}catch(e){const b=el("button","Reintentar","secundario");b.type="button";b.addEventListener("click",cargar);caja.replaceChildren(el("p",e.message),b);}finally{ocupado=false;}}
 function pintar(s){
  controlEntrega.abort();controlEntrega=new AbortController();
  const anteriores=[...caja.querySelectorAll("details[data-bloque]")],abiertos=new Set(anteriores.filter(d=>d.open).map(d=>d.dataset.bloque));
  caja.replaceChildren();
  const nombres=LP_SEGUIMIENTO.etapasDe(s),cab=el("div",undefined,"seguimiento-cabecera"),titulo=el("div");
  titulo.append(el("h3","Resumen del seguimiento"),el("p",s.version?"Información publicada en el portal del cliente.":"Aún no se han publicado avances.","metadatos"));
  const refrescar=el("button","Actualizar seguimiento","secundario");refrescar.type="button";refrescar.addEventListener("click",()=>{if(confirm("¿Actualizar? Se descartarán los cambios que no hayas publicado."))cargar();});cab.append(titulo,refrescar);caja.append(cab);
  const indicadores=el("div",undefined,"seguimiento-indicadores");
  function indicador(t,v){const n=el("div");n.append(el("span",t),el("strong",v));return n;}
  indicadores.append(indicador("Etapa actual",s.actual===null?"Por confirmar":nombres[s.actual]),indicador("Etapas completadas",s.completadas.length+" de "+nombres.length),indicador("Entrega estimada",s.fecha_estimada?new Date(s.fecha_estimada+"T12:00:00").toLocaleDateString("es-MX",{dateStyle:"medium"}):"Por confirmar"));caja.append(indicadores);
  const linea=el("ol",undefined,"seguimiento-linea");nombres.forEach((nombre,i)=>{const estado=LP_SEGUIMIENTO.estadoEtapa(s,i),li=el("li");li.dataset.estado=estado;if(s.actual===i)li.setAttribute("aria-current","step");li.append(el("span",String(i+1),"seguimiento-numero"),el("strong",nombre),el("span",estado,"seguimiento-estado"));linea.append(li);});caja.append(linea);
  function bloque(id,titulo,abierto=false){const d=el("details",undefined,"seguimiento-bloque");d.dataset.bloque=id;d.open=anteriores.length?abiertos.has(id):abierto;const sum=el("summary",titulo),body=el("div",undefined,"seguimiento-bloque-cuerpo");d.append(sum,body);caja.append(d);return {d,body};}
  const acciones=el("div",undefined,"seguimiento-atajos"),orientacion=el("p",undefined,"seguimiento-orientacion");caja.append(orientacion,acciones);
  const revision=bloque("revision","Revisión, aprobación y entrega");
  const materiales=bloque("materiales",s.recepcion?"Recopilación de materiales · Confirmada":"Recopilación de materiales · Por confirmar",!s.recepcion);
  const avance=bloque("avance","Actualizar etapas y publicar avance",true);
  const fotografias=bloque("fotos","Fotografías y vistas previas");
  const historial=bloque("historial","Historial publicado · "+s.historial.length);
  function atajo(t,b){const n=el("button",t,"secundario");n.type="button";n.addEventListener("click",()=>{b.d.open=true;b.d.querySelector("summary").focus({preventScroll:true});b.d.scrollIntoView({block:"nearest"});});acciones.append(n);return n;}
  if(!["cancelado","finalizado"].includes(p.estado)){atajo("Publicar avance",avance);if(!s.recepcion)atajo("Confirmar materiales",materiales);}
  atajo("Ver revisión",revision);atajo("Ver historial",historial);
  if(p.estado==="cancelado")orientacion.textContent="Proyecto cancelado. Consulta los registros existentes.";
  else if(p.estado==="finalizado")orientacion.textContent="Proyecto finalizado. Consulta el historial y la entrega registrada.";
  else if(!s.recepcion)orientacion.textContent="Por revisar: confirma si ya tienes la información suficiente para trabajar.";
  else if(!s.version||s.actual===null)orientacion.textContent="Por revisar: define la etapa actual si corresponde.";
  else orientacion.textContent="Etapa publicada: "+nombres[s.actual]+". Actualiza el seguimiento cuando exista un avance confirmado.";
  const evidencia=el("div",undefined,"resumen-entrega-seguimiento");revision.body.append(evidencia);
  async function consultarEntrega(){
   evidencia.replaceChildren(el("p","Consultando revisión y entrega…"));
   try{const r=await fetch("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/entrega",{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(!r.ok)throw Error(d.error);const q=d.entrega,z=LP_SEGUIMIENTO.resumenEntrega(q);revision.d.querySelector("summary").textContent="Revisión y entrega · "+z.titulo;evidencia.dataset.estado=z.estado;evidencia.replaceChildren(el("strong",z.titulo),el("p",z.detalle));
    if(q?.fecha_decision)evidencia.append(el("p","Decisión: "+q.fecha_decision));
    if(q?.fecha_publicacion)evidencia.append(el("p","Publicación: "+q.fecha_publicacion));
    if(q?.fecha_entrega)evidencia.append(el("p","Entrega: "+q.fecha_entrega));
    if(q?.garantia_hasta)evidencia.append(el("p","Garantía hasta: "+q.garantia_hasta));
    if(q&&q.modalidad!==s.modalidad)evidencia.append(el("p","La modalidad de revisión difiere del seguimiento. Revisa los registros antes de publicar."));
   }catch{revision.d.querySelector("summary").textContent="Revisión y entrega · No disponible";evidencia.replaceChildren(el("p","No se pudo consultar la revisión y entrega."));}
   const b=el("button","Consultar revisión y entrega","secundario");b.type="button";b.addEventListener("click",()=>art.dispatchEvent(new Event("lp:abrir-entrega")));evidencia.append(b);
  }
  consultarEntrega();art.addEventListener("lp:entrega-actualizada",()=>{if(evidencia.isConnected)consultarEntrega();},{signal:controlEntrega.signal});
  avance.body.append(el("p","Publica solo avances confirmados. Esto no aprueba materiales, revisiones ni entregas.","metadatos"));
  const f=el("form",undefined,"economica-form seguimiento-form"),modalidad=campo(f,"Modalidad","select");opcion(modalidad,"fisica","Fabricación física");opcion(modalidad,"web","Servicio digital");opcion(modalidad,"combinada","Proyecto combinado");modalidad.value=s.modalidad;modalidad.disabled=!!s.version;
  const formato=campo(f,"Tipo de seguimiento","select");opcion(formato,"detallado","Detallado");opcion(formato,"simplificado","Simplificado (4 etapas)");formato.value=s.formato||"detallado";formato.disabled=!!s.version;
  if(s.version)f.append(el("p","La modalidad y el tipo se conservan después de la primera publicación para proteger el historial.","metadatos"));
  const actual=campo(f,"Etapa actual","select"),lista=el("fieldset");lista.append(el("legend","Etapas completadas (confirmar individualmente)"));f.append(lista);
  const fecha=campo(f,"Fecha estimada de entrega (opcional)","input");fecha.type="date";fecha.value=s.fecha_estimada;
  const mensaje=campo(f,"Mensaje de actualización para el cliente (opcional)","textarea");mensaje.maxLength=2000;mensaje.rows=4;
  const boton=el("button","Publicar avance"),msg=el("p");msg.setAttribute("role","status");boton.type="submit";f.append(boton,msg);avance.body.append(f);
  let checks=[];
  function etapas(){actual.replaceChildren();lista.replaceChildren(el("legend","Etapas completadas (confirmar individualmente)"));opcion(actual,"","Sin etapa definida");checks=[];
   LP_SEGUIMIENTO.etapasDe({modalidad:modalidad.value,formato:formato.value}).forEach((nombre,i)=>{opcion(actual,String(i),nombre);const l=el("label",undefined,"seguimiento-check"),c=el("input");c.type="checkbox";c.checked=modalidad.value===s.modalidad&&formato.value===(s.formato||"detallado")&&s.completadas.includes(i);l.append(c,document.createTextNode(nombre));lista.append(l);checks.push(c);});
   actual.value=modalidad.value===s.modalidad&&formato.value===(s.formato||"detallado")&&s.actual!==null?String(s.actual):"";
  }
  etapas();modalidad.addEventListener("change",etapas);formato.addEventListener("change",etapas);
  if(s.recepcion&&checks[0])checks[0].disabled=true;
  const recepcion=el("section",undefined,"recepcion-materiales-admin");recepcion.dataset.confirmada=String(!!s.recepcion);materiales.body.append(recepcion);
  recepcion.append(el("h4",s.recepcion?"Materiales recibidos":"Confirmar información suficiente"));
  if(s.recepcion){
   const r=s.recepcion;recepcion.append(el("p","Confirmada · "+LP_SEGUIMIENTO.origenes[r.origen]+" · "+new Date(r.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})),el("p",r.observaciones));
   if(r.fecha_edicion)recepcion.append(el("p","Última corrección: "+new Date(r.fecha_edicion).toLocaleString("es-MX",{timeZone:"America/Mazatlan"}),"metadatos"));
   if(p.estado!=="cancelado"){
    const editar=el("button","Editar recopilación","secundario");editar.type="button";recepcion.append(editar);
    const ef=el("form",undefined,"economica-form");ef.hidden=true;
    const origen=campo(ef,"Origen de los materiales","select");for(const [k,v] of Object.entries(LP_SEGUIMIENTO.origenes))opcion(origen,k,v);origen.value=r.origen;
    const nota=campo(ef,"Observaciones visibles al cliente","textarea");nota.required=true;nota.maxLength=1000;nota.value=r.observaciones;nota.rows=3;
    const guardar=el("button","Guardar corrección"),cancelar=el("button","Cancelar","secundario"),aviso=el("p");guardar.type="submit";cancelar.type="button";aviso.setAttribute("role","status");ef.append(guardar,cancelar,aviso);recepcion.append(ef);
    editar.addEventListener("click",()=>{ef.hidden=false;editar.hidden=true;nota.focus();});
    cancelar.addEventListener("click",()=>{origen.value=r.origen;nota.value=r.observaciones;aviso.textContent="";ef.hidden=true;editar.hidden=false;});
    ef.addEventListener("submit",async e=>{e.preventDefault();if(ocupado)return;if(!nota.value.trim()){aviso.textContent="Escribe una observación.";return;}ocupado=true;guardar.disabled=cancelar.disabled=boton.disabled=true;
     try{const res=await fetch(ruta,{method:"PATCH",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({origen:origen.value,observaciones:nota.value,version:s.version,revision_edicion:r.revision_edicion||0})});const d=await res.json();if(!res.ok)throw Error(d.error||"No se pudo guardar");pintar(d.seguimiento);caja.prepend(el("p","Corrección guardada.","metadatos"));}
     catch(e){aviso.textContent=e.message;}finally{ocupado=false;guardar.disabled=cancelar.disabled=boton.disabled=false;}
    });
   }
  }
  else if(!["finalizado","cancelado"].includes(p.estado)){
   const rf=el("form",undefined,"economica-form"),origen=campo(rf,"Origen de los materiales","select");opcion(origen,"","Selecciona el origen");for(const [k,v] of Object.entries(LP_SEGUIMIENTO.origenes))opcion(origen,k,v);origen.required=true;
   const nota=campo(rf,"Observaciones visibles al cliente","textarea");nota.required=true;nota.maxLength=1000;
   const rb=el("button","Confirmar recopilación de materiales");rb.type="submit";const aviso=el("p");aviso.setAttribute("role","status");rf.append(rb,aviso);recepcion.append(el("p","Confirma que tienes información suficiente. No es obligatorio subir archivos al portal. Elige la modalidad y tipo de seguimiento abajo antes de confirmar."),rf);
   rf.addEventListener("submit",async e=>{e.preventDefault();if(ocupado)return;if(!nota.value.trim()){aviso.textContent="Escribe una observación.";return;}if(!confirm("¿Confirmas que ya tienes los materiales necesarios para iniciar o continuar el proyecto?"))return;
    ocupado=true;rb.disabled=true;boton.disabled=true;
    try{const a=actual.value===""?null:Number(actual.value),c=checks.flatMap((x,i)=>x.checked&&i!==a?[i]:[]);pintar(await api(ruta,{modalidad:modalidad.value,formato:formato.value,actual:a,completadas:c,fecha_estimada:fecha.value,mensaje:"Recopilación de materiales confirmada.",version:s.version,recepcion:{origen:origen.value,observaciones:nota.value}}));}catch(e){aviso.textContent=e.message;}finally{ocupado=false;rb.disabled=false;boton.disabled=false;}
   });
  }
  if(p.estado==="cancelado")for(const n of f.querySelectorAll("input,select,textarea,button"))n.disabled=true;
  f.addEventListener("submit",async e=>{e.preventDefault();if(ocupado)return;const a=actual.value===""?null:Number(actual.value),completadas=checks.flatMap((c,i)=>c.checked?[i]:[]);if(completadas.includes(a)){msg.textContent="La etapa actual no puede estar completada.";return;}if(!confirm("¿Publicar esta actualización en el portal privado del cliente?"))return;
   ocupado=true;boton.disabled=true;try{pintar(await api(ruta,{modalidad:modalidad.value,formato:formato.value,actual:a,completadas,fecha_estimada:fecha.value,mensaje:mensaje.value,version:s.version}));}catch(e){msg.textContent=e.message;}finally{ocupado=false;boton.disabled=false;}
  });
  const fotos=el("section",undefined,"avance-fotos-admin");fotografias.body.append(fotos);
  let fotosCargadas=false;function abrirFotos(){if(!fotosCargadas&&fotografias.d.open){fotosCargadas=true;gestionarFotos(fotos,s,p);}}fotografias.d.addEventListener("toggle",abrirFotos);abrirFotos();
  if(!s.historial.length)historial.body.append(el("p","Sin avances publicados."));
  for(const h of s.historial){const item=el("article",undefined,"seguimiento-historial-item");item.append(el("time",new Date(h.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})),el("strong",h.actual===null?"Sin etapa":nombres[h.actual]),el("p",h.mensaje||"Actualización de etapas/fecha"));if(h.recepcion)item.append(el("p","Materiales: "+LP_SEGUIMIENTO.origenes[h.recepcion.origen]+" · "+h.recepcion.observaciones));historial.body.append(item);}
 }
 detalle.addEventListener("toggle",()=>{if(detalle.open&&!cargado)cargar();});
}
globalThis.LP_ADMIN_SEGUIMIENTO={agregar};
})();
