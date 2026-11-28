(()=>{
"use strict";
const el=(tag,txt,cl)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cl)n.className=cl;return n;};
const fecha=v=>v?new Date(v+"T12:00:00").toLocaleDateString("es-MX",{dateStyle:"long"}):"Por confirmar";
async function cargar(){
 const caja=document.querySelector("#seguimiento-proyecto");
 caja.hidden=false;caja.replaceChildren(el("h2","Seguimiento de tu proyecto"));
 try{
  const r=await fetch("/api/cliente/seguimiento",{credentials:"same-origin",cache:"no-store"});
  if(!r.ok)throw Error();
  const {seguimiento:s,disponible}=await r.json(),etapas=LP_SEGUIMIENTO.etapas[s.modalidad];
  caja.append(el("p","Etapa actual: "+(s.actual===null?"Por confirmar":etapas[s.actual]),"seguimiento-actual"),el("p","Entrega estimada: "+fecha(s.fecha_estimada)));
  const lista=el("ol",undefined,"seguimiento-etapas");
  etapas.forEach((nombre,i)=>{const estado=LP_SEGUIMIENTO.estadoEtapa(s,i),li=el("li");li.dataset.estado=estado;if(s.actual===i)li.setAttribute("aria-current","step");li.append(el("strong",nombre),el("span",estado));lista.append(li);});caja.append(lista);
  if(!disponible||!s.version)caja.append(el("p","Aún no se han publicado avances.","mensaje"));
  caja.append(el("h3","Historial de avances"));
  if(!s.historial.length)caja.append(el("p","Todavía no hay actualizaciones.","mensaje"));
  for(const h of s.historial){const art=el("article",undefined,"seguimiento-avance");art.append(el("strong",new Date(h.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})),el("p","Etapa: "+(h.actual===null?"Por confirmar":etapas[h.actual])+" · Entrega estimada: "+fecha(h.fecha_estimada)),el("p","Completadas: "+(h.completadas.map(i=>etapas[i]).join(", ")||"Ninguna registrada")));if(h.mensaje)art.append(el("p",h.mensaje));caja.append(art);}
 }catch{caja.append(el("p","No se pudo consultar el seguimiento. Actualiza el portal para intentar de nuevo.","mensaje"));}
}
globalThis.LP_CLIENTE_SEGUIMIENTO={cargar};
})();
