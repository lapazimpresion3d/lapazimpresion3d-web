(()=>{"use strict";
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
const btn=t=>{const b=el("button",t,"secundario");b.type="button";return b;};
const campo=(f,t,tag="input")=>{const l=el("label",t),e=el(tag);l.append(e);f.append(l);return e;};
function select(f,t,opts){const e=campo(f,t,"select");for(const [k,v] of Object.entries(opts)){const o=el("option",v);o.value=k;e.append(o);}return e;}
async function api(path,method="GET",body){const res=await fetch(path,{method,credentials:"same-origin",cache:"no-store",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const d=await res.json().catch(()=>({}));if(!res.ok)throw Error(d.error||"Error "+res.status);return d;}
const estados={pendiente:"Pendiente de aprobación",aprobado:"Aprobada",requiere_cambios:"Requiere cambios"};
function enlace(url,t){const a=el("a",t,"boton-enlace");a.href=url;a.target="_blank";a.rel="noopener noreferrer";return a;}
function agregar(art,p){
 const detalle=el("details",undefined,"proyecto-bloque entrega-admin"),abrir=el("summary","Revisión, entrega y publicación"),caja=el("section",undefined,"economica-panel proyecto-bloque-cuerpo");detalle.append(abrir,caja);
 const ruta="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/entrega";
 let ocupado=false,cargado=false;
 async function cargar(){if(ocupado)return;ocupado=true;caja.replaceChildren(el("p","Cargando…"));try{pintar(await api(ruta));cargado=true;}catch(e){const b=btn("Reintentar");b.addEventListener("click",cargar);caja.replaceChildren(el("p","No se pudo consultar la entrega: "+e.message+". Comprueba la migración 0007."),b);}finally{ocupado=false;}}
 function pintar(d){
  const q=d.entrega,cerrado=["finalizado","cancelado"].includes(p.estado);
  const actualizar=btn("Actualizar revisión y entrega");actualizar.addEventListener("click",()=>{if(confirm("¿Actualizar? Se descartarán los cambios no guardados."))cargar();});caja.replaceChildren(el("h3","Entrega y publicación · "+p.folio),actualizar);
  const msg=el("p","","metadatos");msg.setAttribute("role","status");caja.append(msg);
  async function guardar(b,path,metodo,payload){b.disabled=true;msg.textContent="Guardando…";try{await api(path,metodo,payload);await cargar();art.dispatchEvent(new Event("lp:entrega-actualizada"));art.dispatchEvent(new Event("lp:tablero-actualizar",{bubbles:true}));}catch(e){msg.textContent=e.message;b.disabled=false;}}
  if(!q?.fecha_entrega&&!cerrado){
   const f=el("form",undefined,"economica-form"),mod=select(f,"Modalidad",{web:"Página web / sistema digital",fisica:"Fabricación física",combinada:"Proyecto combinado"});mod.value=q?.modalidad||"web";
   const rev=campo(f,"Nombre de la revisión (ej. Diseño v1)");rev.required=true;rev.maxLength=120;rev.value=q?.revision||"";
   const url=campo(f,"URL HTTPS de vista previa (sin parámetros ni claves)");url.type="url";url.maxLength=500;url.value=q?.vista_previa||"";
   const notas=campo(f,"Descripción de la revisión, visible al cliente","textarea");notas.rows=4;notas.maxLength=2000;notas.required=true;notas.value=q?.notas_revision||"";
   const ajustar=()=>{url.disabled=mod.value==="fisica";url.required=!url.disabled;if(url.disabled)url.value="";};mod.addEventListener("change",ajustar);ajustar();
   const b=el("button",q?"Guardar nueva revisión":"Guardar revisión");b.type="submit";f.append(b);
   f.addEventListener("submit",e=>{e.preventDefault();if(q&&!confirm("Una nueva revisión invalida la decisión anterior. ¿Continuar?"))return;guardar(b,ruta,"PUT",{modalidad:mod.value,revision:rev.value,vista_previa:url.value,notas_revision:notas.value,version:q?.version||0});});
   caja.append(f,el("p","La vista previa debe estar alojada previamente. No guardes enlaces con contraseñas o tokens. Para fabricación, describe el diseño presentado al cliente.","metadatos"));
  }
  if(!q)return;
  caja.append(el("p","Revisión "+q.version+" · "+q.revision+" · "+estados[q.decision]),el("p",q.notas_revision,"metadatos"));
  if(q.vista_previa)caja.append(enlace(q.vista_previa,"Abrir vista previa"));
  if(q.fecha_decision)caja.append(el("p","Decisión del "+q.fecha_decision+" · "+(q.origen_decision==="cliente"?"Portal del cliente":"Confirmación externa registrada por administrador")+(q.comentario?" · "+q.comentario:""),"metadatos"));
  if(!cerrado&&q.decision==="pendiente"){
   const f=el("form",undefined,"economica-form"),dec=select(f,"Decisión comunicada por el cliente",{aprobado:"Aprobó",requiere_cambios:"Solicitó cambios"}),coment=campo(f,"Comentario o referencia de confirmación","textarea");coment.maxLength=1000;coment.rows=3;
   const b=el("button","Registrar decisión externa");b.type="submit";f.append(b);
   f.addEventListener("submit",e=>{e.preventDefault();if(confirm("¿Confirmas que el cliente comunicó esta decisión para la revisión guardada?"))guardar(b,ruta+"/decision","POST",{decision:dec.value,comentario:coment.value,version:q.version,confirmada:true});});caja.append(f);
  }
  if(!cerrado&&q.decision==="aprobado"&&!q.fecha_entrega){
   const f=el("form",undefined,"economica-form"),fisica=q.modalidad==="fisica",dom=select(f,"Tipo de dominio",fisica?{no_aplica:"No aplica"}:{subdominio:"Subdominio",propio:"Dominio propio"});
   const url=campo(f,"Dirección web definitiva");url.type="url";url.required=!fisica;url.disabled=fisica;url.maxLength=500;
   const pub=campo(f,"Fecha de publicación");pub.type="date";pub.required=!fisica;pub.disabled=fisica;pub.max=d.hoy;pub.min=q.fecha_decision;if(!fisica)pub.value=d.hoy;
   const fecha=campo(f,"Fecha de entrega");fecha.type="date";fecha.required=true;fecha.max=d.hoy;fecha.min=q.fecha_decision;fecha.value=d.hoy;
   const b=el("button","Registrar entrega realizada");b.type="submit";f.append(b);f.addEventListener("submit",e=>{e.preventDefault();if(confirm("¿Confirmas que ya realizaste la entrega"+(fisica?"":" y publicación")+"? No despliega ni inicia cobros."))guardar(b,ruta+"/finalizar","POST",{tipo_dominio:dom.value,url_final:fisica?"":url.value,fecha_publicacion:fisica?"":pub.value,fecha_entrega:fecha.value,version:q.version});});caja.append(f);
  }
  if(q.fecha_entrega){
   caja.append(el("p","Entregado: "+q.fecha_entrega));
   if(q.url_final)caja.append(enlace(q.url_final,"Abrir sitio definitivo"),el("p","Publicado: "+q.fecha_publicacion+" · "+q.tipo_dominio+" · Garantía de desarrollo hasta "+q.garantia_hasta));
   caja.append(el("p","Inicia la mensualidad por separado en Mensualidades y renovaciones, con la fecha acordada. Cambia el estado general del proyecto manualmente.","metadatos"),el("h4","Modificaciones posteriores (registro interno)"));
   if(p.estado!=="cancelado"){
    const f=el("form",undefined,"economica-form"),t=campo(f,"Descripción de la modificación autorizada o realizada","textarea");t.required=true;t.maxLength=2000;t.rows=3;const b=el("button","Registrar modificación");b.type="submit";f.append(b);
    let id=null;f.addEventListener("input",()=>{if(!b.disabled)id=null;});f.addEventListener("submit",e=>{e.preventDefault();id=id||crypto.randomUUID();guardar(b,ruta+"/cambios","POST",{id,descripcion:t.value});});caja.append(f);
   }
   for(const c of d.cambios)caja.append(el("p",c.fecha_registro.slice(0,10)+" · "+c.descripcion,"pago-economico"));
   if(!d.cambios.length)caja.append(el("p","No hay modificaciones registradas."));
  }
 }
 detalle.addEventListener("toggle",()=>{if(detalle.open&&!cargado)cargar();});art.addEventListener("lp:abrir-entrega",()=>{detalle.open=true;if(!cargado)cargar();abrir.scrollIntoView({block:"nearest"});abrir.focus({preventScroll:true});});art.append(detalle);
}
globalThis.LP_ADMIN_ENTREGA=Object.freeze({agregar});
})();
