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
 let ocupado=false;
 async function cargar(){if(ocupado)return;ocupado=true;caja.replaceChildren(el("p","Cargando…"));try{pintar(await api(ruta));}catch(e){caja.replaceChildren(el("p",e.message));}finally{ocupado=false;}}
 function pintar(s){
  caja.replaceChildren(el("p","Publica solo avances confirmados. Esto no aprueba materiales, revisiones ni entregas."));
  const f=el("form",undefined,"economica-form"),modalidad=campo(f,"Modalidad","select");opcion(modalidad,"fisica","Fabricación física");opcion(modalidad,"web","Servicio digital");modalidad.value=s.modalidad;modalidad.disabled=!!s.version;
  const actual=campo(f,"Etapa actual","select"),lista=el("fieldset");lista.append(el("legend","Etapas completadas (confirmar individualmente)"));f.append(lista);
  const fecha=campo(f,"Fecha estimada de entrega (opcional)","input");fecha.type="date";fecha.value=s.fecha_estimada;
  const mensaje=campo(f,"Mensaje de actualización para el cliente (opcional)","textarea");mensaje.maxLength=2000;mensaje.rows=4;
  const boton=el("button","Publicar avance"),msg=el("p");msg.setAttribute("role","status");boton.type="submit";f.append(boton,msg);caja.append(f);
  let checks=[];
  function etapas(){actual.replaceChildren();lista.replaceChildren(el("legend","Etapas completadas (confirmar individualmente)"));opcion(actual,"","Sin etapa definida");checks=[];
   LP_SEGUIMIENTO.etapas[modalidad.value].forEach((nombre,i)=>{opcion(actual,String(i),nombre);const l=el("label",undefined,"seguimiento-check"),c=el("input");c.type="checkbox";c.checked=modalidad.value===s.modalidad&&s.completadas.includes(i);l.append(c,document.createTextNode(nombre));lista.append(l);checks.push(c);});
   actual.value=modalidad.value===s.modalidad&&s.actual!==null?String(s.actual):"";
  }
  etapas();modalidad.addEventListener("change",etapas);
  if(p.estado==="cancelado")for(const n of f.querySelectorAll("input,select,textarea,button"))n.disabled=true;
  f.addEventListener("submit",async e=>{e.preventDefault();if(ocupado)return;const a=actual.value===""?null:Number(actual.value),completadas=checks.flatMap((c,i)=>c.checked?[i]:[]);if(completadas.includes(a)){msg.textContent="La etapa actual no puede estar completada.";return;}if(!confirm("¿Publicar esta actualización en el portal privado del cliente?"))return;
   ocupado=true;boton.disabled=true;try{pintar(await api(ruta,{modalidad:modalidad.value,actual:a,completadas,fecha_estimada:fecha.value,mensaje:mensaje.value,version:s.version}));}catch(e){msg.textContent=e.message;}finally{ocupado=false;boton.disabled=false;}
  });
  const fotos=el("section",undefined,"avance-fotos-admin");caja.append(fotos);gestionarFotos(fotos,s,p);
  caja.append(el("h4","Historial publicado"));
  if(!s.historial.length)caja.append(el("p","Sin avances publicados."));
  for(const h of s.historial)caja.append(el("p",new Date(h.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})+" · "+(h.actual===null?"Sin etapa":LP_SEGUIMIENTO.etapas[s.modalidad][h.actual])+" · "+(h.mensaje||"Actualización de etapas/fecha"),"metadatos"));
 }
 detalle.addEventListener("toggle",()=>{if(detalle.open)cargar();});
}
globalThis.LP_ADMIN_SEGUIMIENTO={agregar};
})();
