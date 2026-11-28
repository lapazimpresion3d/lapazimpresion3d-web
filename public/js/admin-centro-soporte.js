(()=>{"use strict";
const $=id=>document.getElementById(id),panel=$("centro-soporte"),lista=$("soporte-pendientes"),metricas=$("soporte-metricas"),aviso=$("soporte-aviso"),atencion=$("soporte-atencion"),actualizar=$("soporte-actualizar");
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
const boton=t=>{const b=el("button",t,"secundario");b.type="button";return b;};
const estados={abierto:"Abierto",en_proceso:"En proceso",espera_cliente:"Esperando al cliente"};
const prioridades={critica:"Crítica",alta:"Alta",normal:"Normal",baja:"Baja"};
let filtro="todos",generacion=0,cargado=false;
async function cargar(k=filtro){
 filtro=k;const g=++generacion;actualizar.disabled=true;aviso.textContent="Consultando soporte…";
 try{const r=await fetch("/api/admin/soporte/pendientes?filtro="+encodeURIComponent(k),{credentials:"same-origin",cache:"no-store"}),d=await r.json();if(!r.ok)throw Error(d.error||"Error "+r.status);if(g!==generacion||$("panel").hidden)return;cargado=true;pintar(d);}
 catch(e){if(g===generacion){lista.replaceChildren();metricas.replaceChildren();aviso.textContent=e.message;}}
 finally{if(g===generacion)actualizar.disabled=false;}
}
function pintar(d){
 metricas.replaceChildren();lista.replaceChildren();
 for(const [k,t,n] of [["todos","Pendientes",d.resumen.total],["criticas","Críticas",d.resumen.criticas],["abiertas","Abiertas",d.resumen.abiertas],["por_responder","Por responder",d.mensajes_disponibles?d.resumen.por_responder:"—"],["espera_cliente","Esperando cliente",d.resumen.espera_cliente]]){
 const b=boton("");b.className="proyectos-metrica";b.append(el("strong",String(n)),el("span",t));b.setAttribute("aria-pressed",String(filtro===k));b.disabled=k==="por_responder"&&!d.mensajes_disponibles;b.addEventListener("click",()=>cargar(k));metricas.append(b);}
 aviso.textContent=d.items.length+" solicitudes mostradas · "+new Date(d.consultado).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})+(d.limitado?" · Más de 100 resultados; utiliza los filtros.":"")+(!d.mensajes_disponibles?" · Conversaciones no disponibles (0012).":"")+(!d.origen_disponible?" · Origen externo no disponible (0014).":"");
 for(const x of d.items){const a=el("article",undefined,"registro soporte-notificacion");a.dataset.prioridad=x.prioridad;a.append(el("h3",x.titulo),el("p",x.folio+" · "+x.nombre+" · "+(x.proyecto||""),"metadatos"),el("p",prioridades[x.prioridad]+" · "+estados[x.estado]+(x.ultimo_autor==="cliente"?" · Último mensaje del cliente":"")+(x.desde_panel?" · Panel del negocio":"")),el("p","Registrada "+new Date(x.fecha_registro).toLocaleString("es-MX",{timeZone:"America/Mazatlan"}),"metadatos"));
 const b=boton("Atender solicitud");b.addEventListener("click",()=>{if(atencion.childElementCount&&!confirm("¿Abrir otra solicitud? Se perderán borradores no guardados en esta vista."))return;const cab=el("div",undefined,"herramientas"),cerrar=boton("Cerrar atención");cerrar.addEventListener("click",()=>{if(confirm("¿Cerrar atención? Se perderán borradores no guardados.")){atencion.replaceChildren();cargar();}});cab.append(el("h3","Atención: "+x.titulo),cerrar);const art=el("article",undefined,"registro");atencion.replaceChildren(cab,art);globalThis.LP_SOPORTE.agregar(art,x,x.ticket_id);atencion.scrollIntoView({block:"start"});});a.append(b);lista.append(a);}
 if(!d.items.length)lista.append(el("p","No hay solicitudes pendientes en este filtro."));
}
actualizar.addEventListener("click",()=>cargar());panel.addEventListener("toggle",()=>{if(panel.open&&!cargado&&!$("panel").hidden)cargar();});
$("salir").addEventListener("click",()=>{generacion++;cargado=false;filtro="todos";lista.replaceChildren();metricas.replaceChildren();atencion.replaceChildren();aviso.textContent="";actualizar.disabled=false;});
})();