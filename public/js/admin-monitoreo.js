(()=>{"use strict";
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
const campo=(f,t,tag="input")=>{const l=el("label",t),n=el(tag);l.append(n);f.append(l);return n;};
const boton=t=>{const b=el("button",t,"secundario");b.type="button";return b;};
const estados={disponible:"Disponible",degradado:"Degradado",no_disponible:"No disponible"};
const fecha=v=>v?new Date(v).toLocaleString("es-MX",{timeZone:"America/Mazatlan"}):"Sin registro";
async function api(url,datos){const r=await fetch(url,{method:datos?"POST":"GET",credentials:"same-origin",cache:"no-store",headers:datos?{"Content-Type":"application/json"}:undefined,body:datos?JSON.stringify(datos):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Error "+r.status);return d;}
function agregar(art,x){
 const ruta="/api/admin/servicios/"+encodeURIComponent(x.propuesta_id)+"/monitoreo",p=el("details",undefined,"proyecto-bloque"),head=el("summary","Monitoreo del sitio web"),c=el("div",undefined,"economica-panel");p.append(head,c);art.append(p);let cargado=false,ocupado=false;
 const vigente=()=>art.isConnected&&!document.getElementById("panel").hidden;
 async function cargar(){if(ocupado)return;ocupado=true;try{const d=await api(ruta);if(!vigente())return;cargado=true;pintar(d);}catch(e){if(vigente()){const b=boton("Reintentar");b.addEventListener("click",cargar);c.replaceChildren(el("p",e.message),b);}}finally{ocupado=false;}}
 function pintar(d){
 head.textContent="Monitoreo del sitio web · "+(d.ultimo?estados[d.ultimo.estado]+" (último registro)":"Sin comprobación");
 const met=el("div",undefined,"soporte-resumen"),s=d.resumen;
 for(const [k,v] of [["Última comprobación",fecha(d.ultimo?.fecha_comprobacion)],["Último resultado",d.ultimo?estados[d.ultimo.estado]:"Sin registro"],["HTTP / tiempo",d.ultimo?(d.ultimo.codigo_http??"—")+" / "+(d.ultimo.tiempo_ms===null?"—":d.ultimo.tiempo_ms+" ms"):"—"],["Muestras últimos 30 días",s?String(s.muestras):"—"],["Muestras disponibles",s?s.disponibles+" de "+s.muestras:"—"],["Promedio de tiempos registrados",s?.promedio_ms==null?"—":s.promedio_ms+" ms"],["Última incidencia observada",fecha(d.ultimo_fallo)],["Primera recuperación posterior observada",fecha(d.recuperacion)]]){const z=el("div");z.append(el("strong",v),el("span",k,"metadatos"));met.append(z);}
 const refresh=boton("Actualizar registros");refresh.addEventListener("click",()=>{if(confirm("¿Actualizar? Se perderán borradores no guardados."))cargar();});
 c.replaceChildren(el("p","Comprobaciones registradas manualmente. No son mediciones en vivo ni porcentaje de uptime. No se ejecutan solicitudes automáticas desde el servidor.","metadatos"),met,refresh);
 if(d.sitio){
  const link=el("a","Abrir sitio entregado","boton-enlace");link.href=d.sitio;link.target="_blank";link.rel="noopener noreferrer";c.append(el("p",d.sitio),link);
  const nuevo=el("details",undefined,"proyecto-bloque"),f=el("form",undefined,"economica-form");nuevo.append(el("summary","+ Registrar comprobación realizada"),f);c.append(nuevo);
  const fechaLocal=campo(f,"Fecha y hora de comprobación (zona horaria del dispositivo)"),estado=campo(f,"Resultado","select"),http=campo(f,"Código HTTP (si se conoce)"),ms=campo(f,"Tiempo de respuesta en ms (si se midió)"),obs=campo(f,"Observaciones","textarea"),b=el("button","Registrar comprobación"),msg=el("p",undefined,"metadatos");
  fechaLocal.type="datetime-local";fechaLocal.required=true;const now=new Date();fechaLocal.value=new Date(now.getTime()-now.getTimezoneOffset()*60000).toISOString().slice(0,16);for(const [k,v] of Object.entries(estados)){const o=el("option",v);o.value=k;estado.append(o);}for(const [i,min,max] of [[http,100,599],[ms,0,120000]]){i.type="number";i.min=min;i.max=max;i.step=1;}obs.maxLength=1000;b.type="submit";msg.setAttribute("role","status");f.append(b,msg);const ajustar=()=>{obs.required=estado.value!=="disponible";obs.minLength=obs.required?3:0;};estado.addEventListener("change",ajustar);ajustar();let intento=null;f.addEventListener("input",()=>{if(!b.disabled)intento=null;});
  f.addEventListener("submit",async ev=>{ev.preventDefault();if(!confirm("¿Confirmas que esta comprobación ya se realizó?"))return;b.disabled=true;try{intento=intento||{id:crypto.randomUUID(),sitio:d.sitio,fecha_comprobacion:new Date(fechaLocal.value).toISOString(),estado:estado.value,codigo_http:http.value===""?null:Number(http.value),tiempo_ms:ms.value===""?null:Number(ms.value),observaciones:obs.value};await api(ruta,intento);if(vigente()){await cargar();globalThis.LP_ADMIN_ALERTAS?.cargar();}}catch(e){msg.textContent=e.message;b.disabled=false;}});
 }else c.append(el("p","No hay URL HTTPS final de entrega válida para registrar nuevas comprobaciones."));
 c.append(el("h4","Historial de comprobaciones"));if(!d.items.length)c.append(el("p","Sin comprobaciones registradas."));for(const q of d.items){const a=el("article",undefined,"soporte-intervencion");a.append(el("strong",estados[q.estado]+" · "+fecha(q.fecha_comprobacion)),el("p",q.sitio,"metadatos"),el("p","HTTP "+(q.codigo_http??"Sin medición")+" · "+(q.tiempo_ms===null?"Tiempo sin medición":q.tiempo_ms+" ms")),el("p",q.observaciones));c.append(a);}if(d.limitado)c.append(el("p","Últimas 100 comprobaciones.","metadatos"));
 }
 p.addEventListener("toggle",()=>{if(p.open&&!cargado)cargar();});
}
globalThis.LP_MONITOREO={agregar};
})();