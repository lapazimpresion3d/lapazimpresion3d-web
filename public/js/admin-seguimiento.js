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
 const detalle=el("details",undefined,"seguimiento-admin"),caja=el("section",undefined,"economica-panel");detalle.append(el("summary","Seguimiento de Mi proyecto"),caja);art.append(detalle);
 const ruta="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/seguimiento";
 let ocupado=false,controlEntrega=new AbortController();
 async function cargar(){if(ocupado)return;ocupado=true;caja.replaceChildren(el("p","Cargando…"));try{pintar(await api(ruta));}catch(e){caja.replaceChildren(el("p",e.message));}finally{ocupado=false;}}
 function pintar(s){
  controlEntrega.abort();controlEntrega=new AbortController();
  caja.replaceChildren(el("p","Publica solo avances confirmados. Esto no aprueba materiales, revisiones ni entregas."));
  const evidencia=el("div",undefined,"resumen-entrega-seguimiento");caja.append(evidencia);
  async function consultarEntrega(){
   evidencia.replaceChildren(el("p","Consultando revisión y entrega…"));
   try{const r=await fetch("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/entrega",{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(!r.ok)throw Error(d.error);const q=d.entrega,z=LP_SEGUIMIENTO.resumenEntrega(q);evidencia.dataset.estado=z.estado;evidencia.replaceChildren(el("strong",z.titulo),el("p",z.detalle));
    if(q?.fecha_decision)evidencia.append(el("p","Decisión: "+q.fecha_decision));
    if(q?.fecha_publicacion)evidencia.append(el("p","Publicación: "+q.fecha_publicacion));
    if(q?.fecha_entrega)evidencia.append(el("p","Entrega: "+q.fecha_entrega));
    if(q?.garantia_hasta)evidencia.append(el("p","Garantía hasta: "+q.garantia_hasta));
    if(q&&q.modalidad!==s.modalidad)evidencia.append(el("p","La modalidad de revisión difiere del seguimiento. Revisa los registros antes de publicar."));
   }catch{evidencia.replaceChildren(el("p","No se pudo consultar la revisión y entrega."));}
   const b=el("button","Consultar revisión y entrega","secundario");b.type="button";b.addEventListener("click",()=>art.dispatchEvent(new Event("lp:abrir-entrega")));evidencia.append(b);
  }
  consultarEntrega();art.addEventListener("lp:entrega-actualizada",()=>{if(evidencia.isConnected)consultarEntrega();},{signal:controlEntrega.signal});
  const f=el("form",undefined,"economica-form"),modalidad=campo(f,"Modalidad","select");opcion(modalidad,"fisica","Fabricación física");opcion(modalidad,"web","Servicio digital");opcion(modalidad,"combinada","Proyecto combinado");modalidad.value=s.modalidad;modalidad.disabled=!!s.version;
  const formato=campo(f,"Tipo de seguimiento","select");opcion(formato,"detallado","Detallado");opcion(formato,"simplificado","Simplificado (4 etapas)");formato.value=s.formato||"detallado";formato.disabled=!!s.version;
  if(s.version)f.append(el("p","La modalidad y el tipo se conservan después de la primera publicación para proteger el historial.","metadatos"));
  const actual=campo(f,"Etapa actual","select"),lista=el("fieldset");lista.append(el("legend","Etapas completadas (confirmar individualmente)"));f.append(lista);
  const fecha=campo(f,"Fecha estimada de entrega (opcional)","input");fecha.type="date";fecha.value=s.fecha_estimada;
  const mensaje=campo(f,"Mensaje de actualización para el cliente (opcional)","textarea");mensaje.maxLength=2000;mensaje.rows=4;
  const boton=el("button","Publicar avance"),msg=el("p");msg.setAttribute("role","status");boton.type="submit";f.append(boton,msg);caja.append(f);
  let checks=[];
  function etapas(){actual.replaceChildren();lista.replaceChildren(el("legend","Etapas completadas (confirmar individualmente)"));opcion(actual,"","Sin etapa definida");checks=[];
   LP_SEGUIMIENTO.etapasDe({modalidad:modalidad.value,formato:formato.value}).forEach((nombre,i)=>{opcion(actual,String(i),nombre);const l=el("label",undefined,"seguimiento-check"),c=el("input");c.type="checkbox";c.checked=modalidad.value===s.modalidad&&formato.value===(s.formato||"detallado")&&s.completadas.includes(i);l.append(c,document.createTextNode(nombre));lista.append(l);checks.push(c);});
   actual.value=modalidad.value===s.modalidad&&formato.value===(s.formato||"detallado")&&s.actual!==null?String(s.actual):"";
  }
  etapas();modalidad.addEventListener("change",etapas);formato.addEventListener("change",etapas);
  if(s.recepcion&&checks[0])checks[0].disabled=true;
  const recepcion=el("section",undefined,"recepcion-materiales-admin");caja.insertBefore(recepcion,f);
  recepcion.append(el("h4","Recopilación de materiales"));
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
  const fotos=el("section",undefined,"avance-fotos-admin");caja.append(fotos);gestionarFotos(fotos,s,p);
  caja.append(el("h4","Historial publicado"));
  if(!s.historial.length)caja.append(el("p","Sin avances publicados."));
  for(const h of s.historial)caja.append(el("p",new Date(h.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})+" · "+(h.actual===null?"Sin etapa":LP_SEGUIMIENTO.etapasDe(s)[h.actual])+" · "+(h.mensaje||"Actualización de etapas/fecha"),"metadatos"));
 }
 detalle.addEventListener("toggle",()=>{if(detalle.open)cargar();});
}
globalThis.LP_ADMIN_SEGUIMIENTO={agregar};
})();
