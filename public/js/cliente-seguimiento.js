(()=>{
"use strict";
const el=(tag,txt,cl)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cl)n.className=cl;return n;};
const fecha=v=>v?new Date(v+"T12:00:00").toLocaleDateString("es-MX",{dateStyle:"long"}):"Por confirmar";
let entregaActual=null,entregaConsultada=false;
function mostrarEntrega(q,consultada=true){
 entregaActual=q;entregaConsultada=consultada;
 const caja=document.querySelector("#resumen-entrega-seguimiento");if(!caja)return;
 caja.replaceChildren();
 if(!consultada){caja.append(el("p","No se pudo consultar la revisión y entrega. Actualiza el portal."));return;}
 const r=LP_SEGUIMIENTO.resumenEntrega(q);caja.dataset.estado=r.estado;
 caja.append(el("strong",r.titulo),el("p",r.detalle));
 if(q?.fecha_decision)caja.append(el("p","Decisión registrada: "+fecha(q.fecha_decision)));
 if(q?.fecha_publicacion)caja.append(el("p","Publicación: "+fecha(q.fecha_publicacion)));
 if(q?.fecha_entrega)caja.append(el("p","Entrega realizada: "+fecha(q.fecha_entrega)));
 if(q?.garantia_hasta)caja.append(el("p","Garantía de desarrollo hasta: "+fecha(q.garantia_hasta)));
 if(q){const a=el("a",r.estado==="pendiente"?"Revisar y responder":r.estado==="cambios"?"Consultar correcciones":"Consultar revisión y entrega");a.href="#revision-entrega";a.addEventListener("click",()=>{document.querySelector("#revision-entrega").open=true;});caja.append(a);}
}
async function cargar(){
 const caja=document.querySelector("#seguimiento-proyecto");
 caja.hidden=false;caja.replaceChildren(el("h2","Seguimiento de tu proyecto"));
 try{
  const r=await fetch("/api/cliente/seguimiento",{credentials:"same-origin",cache:"no-store"});
  if(!r.ok)throw Error();
  const {seguimiento:s,disponible,fotos=[]}=await r.json(),etapas=LP_SEGUIMIENTO.etapas[s.modalidad];
  caja.append(el("p","Etapa actual: "+(s.actual===null?"Por confirmar":etapas[s.actual]),"seguimiento-actual"),el("p","Entrega estimada: "+fecha(s.fecha_estimada)));
  const resumen=el("section",undefined,"resumen-entrega-seguimiento");resumen.id="resumen-entrega-seguimiento";caja.append(resumen);mostrarEntrega(entregaActual,entregaConsultada);
  caja.append(el("p","Las etapas son avances publicados por Lapazimpresion3d. Las decisiones y fechas de entrega se muestran por separado.","mensaje"));
  const lista=el("ol",undefined,"seguimiento-etapas");
  etapas.forEach((nombre,i)=>{const estado=LP_SEGUIMIENTO.estadoEtapa(s,i),li=el("li");li.dataset.estado=estado;if(s.actual===i)li.setAttribute("aria-current","step");li.append(el("strong",nombre),el("span",estado));lista.append(li);});caja.append(lista);
  if(!disponible||!s.version)caja.append(el("p","Aún no se han publicado avances.","mensaje"));
  const historial=el("details",undefined,"portal-detalle");historial.open=true;historial.append(el("summary","Historial de avances ("+s.historial.length+")"));caja.append(historial);
  if(!s.historial.length)historial.append(el("p","Todavía no hay actualizaciones.","mensaje"));
  for(const [i,h] of s.historial.entries()){const art=el("article",undefined,"seguimiento-avance");art.append(el("strong",new Date(h.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})),el("p","Etapa: "+(h.actual===null?"Por confirmar":etapas[h.actual])+" · Entrega estimada: "+fecha(h.fecha_estimada)),el("p","Completadas: "+(h.completadas.map(i=>etapas[i]).join(", ")||"Ninguna registrada")));if(h.mensaje)art.append(el("p",h.mensaje));
   const adjuntos=fotos.filter(a=>a.version_avance===s.version-i);
   if(adjuntos.length){const grid=el("div",undefined,"avance-galeria");for(const a of adjuntos){const fig=el("figure"),link=el("a"),img=el("img");link.href="/api/cliente/avances/"+encodeURIComponent(a.id);link.target="_blank";link.rel="noopener noreferrer";img.src=link.href;img.loading="lazy";img.alt=a.descripcion||"Fotografía del avance";link.append(img);fig.append(link,el("figcaption",a.descripcion||"Fotografía del proceso"));grid.append(fig);}art.append(grid);}
   historial.append(art);}
 }catch{caja.append(el("p","No se pudo consultar el seguimiento. Actualiza el portal para intentar de nuevo.","mensaje"));}
}
globalThis.LP_CLIENTE_SEGUIMIENTO={cargar,mostrarEntrega};
})();
