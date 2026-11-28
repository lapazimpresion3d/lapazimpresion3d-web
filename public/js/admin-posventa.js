(()=>{"use strict";
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
const campo=(f,t,tag="input")=>{const l=el("label",t),n=el(tag);l.append(n);f.append(l);return n;};
const boton=t=>{const b=el("button",t,"secundario");b.type="button";return b;};
const cob={por_evaluar:"Por evaluar",garantia:"Garantía",mantenimiento:"Mantenimiento mensual",adicional:"Trabajo adicional",sin_cargo:"Sin cargo",no_procede:"No procede"};
const est={abierto:"Abierto",en_proceso:"En proceso",espera_cliente:"Esperando cliente",resuelto:"Resuelto",cancelado:"Cancelado"};
const origen={whatsapp:"WhatsApp",correo:"Correo",telefono:"Teléfono",presencial:"Presencial",interno:"Interno",otro:"Otro"};
const plazo={sin_fecha:"Sin fecha de garantía registrada",dentro_plazo:"Reporte dentro del plazo registrado",fuera_plazo:"Reporte fuera del plazo registrado",antes_entrega:"Antes de entrega"};
function sel(f,t,opts){const n=campo(f,t,"select");for(const [k,v] of Object.entries(opts)){const o=el("option",v);o.value=k;n.append(o);}return n;}
async function api(url,method="GET",datos){const r=await fetch(url,{method,credentials:"same-origin",cache:"no-store",headers:datos?{"Content-Type":"application/json"}:undefined,body:datos?JSON.stringify(datos):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Error "+r.status);return d;}
function agregar(caja,p,entrega){
 const ruta="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/posventa",panel=el("details",undefined,"proyecto-bloque"),head=el("summary","Garantías y posventa"),body=el("div",undefined,"economica-panel");panel.append(head,body);caja.append(panel);let listo=false,ocupado=false;
 const vigente=()=>panel.isConnected&&!document.getElementById("panel").hidden;
 async function cargar(){if(ocupado)return;ocupado=true;try{const d=await api(ruta);if(!vigente())return;listo=true;pintar(d);}catch(e){if(vigente()){const b=boton("Reintentar");b.addEventListener("click",cargar);body.replaceChildren(el("p",e.message),b);}}finally{ocupado=false;}}
 function pintar(d){
 head.textContent="Garantías y posventa · "+d.resumen.pendientes+" pendientes";
 body.replaceChildren(el("p","Entrega: "+d.entrega.fecha_entrega+" · Garantía registrada hasta: "+(d.entrega.garantia_hasta||"Sin fecha"),"metadatos"),el("p","La fecha orienta la evaluación; no determina por sí sola la cobertura. No genera cobros, no modifica contratos ni amplía garantías. Tiempo de posventa separado del soporte mensual.","metadatos"));
 const ref=boton("Actualizar casos");ref.addEventListener("click",()=>{if(confirm("¿Actualizar? Se perderán borradores no guardados."))cargar();});body.append(ref);
 if(d.entrega.estado!=="cancelado"){
 const nuevo=el("details",undefined,"proyecto-bloque"),f=el("form",undefined,"economica-form");nuevo.append(el("summary","+ Registrar reclamación o trabajo de posventa"),f);body.append(nuevo);
 const fecha=campo(f,"Fecha del reporte"),o=sel(f,"Origen",origen),t=campo(f,"Título"),desc=campo(f,"Descripción del problema","textarea"),b=el("button","Registrar caso"),msg=el("p",undefined,"metadatos");fecha.type="date";fecha.min=d.entrega.fecha_entrega;fecha.max=d.hoy;fecha.value=d.hoy;fecha.required=true;t.minLength=3;t.maxLength=120;t.required=true;desc.minLength=3;desc.maxLength=2000;desc.required=true;b.type="submit";f.append(b,msg);let intento=null;f.addEventListener("input",()=>{if(!b.disabled)intento=null;});f.addEventListener("submit",async e=>{e.preventDefault();b.disabled=true;try{intento=intento||{id:crypto.randomUUID(),fecha_reporte:fecha.value,origen:o.value,titulo:t.value,descripcion:desc.value};await api(ruta,"POST",intento);await cargar();}catch(e){msg.textContent=e.message;b.disabled=false;}});
 }
 for(const q of d.items){
 const a=el("details",undefined,"proyecto-bloque"),c=el("div",undefined,"economica-panel");a.append(el("summary",q.titulo+" · "+est[q.estado]+" · "+cob[q.cobertura]),c);body.append(a);let loaded=false,busy=false;
 async function detalle(){if(busy)return;busy=true;try{const z=await api(ruta+"/"+q.id);if(!vigente()||!a.isConnected)return;loaded=true;const v=z.caso;c.replaceChildren(el("p",v.descripcion),el("p",v.fecha_reporte+" · "+origen[v.origen]+" · "+plazo[q.plazo],"metadatos"),el("p","Garantía registrada al reportar: "+(v.garantia_hasta_registrada||"Sin fecha")));
 if(d.entrega.estado!=="cancelado"){
 const f=el("form",undefined,"economica-form"),co=sel(f,"Cobertura",cob),estado=sel(f,"Estado",est),mot=campo(f,"Motivo de clasificación","textarea"),aut=campo(f,"Autorización del adicional"),sol=campo(f,"Solución o motivo de cierre","textarea"),min=campo(f,"Minutos acumulados de posventa"),b=el("button","Guardar evaluación"),msg=el("p",undefined,"metadatos");co.value=v.cobertura;estado.value=v.estado;mot.value=v.motivo;mot.maxLength=1000;aut.value=v.autorizacion;aut.maxLength=500;sol.value=v.solucion;sol.maxLength=2000;min.type="number";min.min=0;min.max=10080;min.step=1;min.required=true;min.value=v.minutos;b.type="submit";f.append(b,msg);c.append(f);const ajustar=()=>{mot.required=co.value!=="por_evaluar";mot.minLength=mot.required?3:0;aut.required=co.value==="adicional";aut.disabled=!aut.required;sol.required=["resuelto","cancelado"].includes(estado.value);sol.minLength=sol.required?3:0;};co.addEventListener("change",ajustar);estado.addEventListener("change",ajustar);ajustar();
 f.addEventListener("submit",async e=>{e.preventDefault();if(!confirm("¿Guardar evaluación de posventa? No se generará un cargo."))return;b.disabled=true;try{await api(ruta+"/"+v.id,"PATCH",{version:v.version,cobertura:co.value,estado:estado.value,motivo:mot.value,autorizacion:aut.value,solucion:sol.value,minutos:Number(min.value)});await cargar();}catch(e){msg.textContent=e.message;b.disabled=false;}});
 }
 const hist=el("details",undefined,"proyecto-bloque");hist.append(el("summary","Evaluaciones anteriores · "+z.historial.length));for(const h of z.historial){const item=el("article",undefined,"soporte-intervencion");item.append(el("strong","Versión "+h.version+" · "+cob[h.cobertura]+" · "+est[h.estado]),el("p",h.fecha_registro+" · "+h.minutos+" min","metadatos"),el("p",h.motivo||"Sin motivo"),el("p",h.solucion||"Sin solución"));if(h.autorizacion)item.append(el("p","Autorización: "+h.autorizacion));hist.append(item);}if(z.limitado)hist.append(el("p","Últimas 100 evaluaciones."));c.append(hist);
 }catch(e){if(vigente()&&a.isConnected){const b=boton("Reintentar");b.addEventListener("click",detalle);c.replaceChildren(el("p",e.message),b);}}finally{busy=false;}}
 a.addEventListener("toggle",()=>{if(a.open&&!loaded)detalle();});
 }
 if(!d.items.length)body.append(el("p","Sin casos de posventa registrados."));if(d.limitado)body.append(el("p","Vista limitada a 100 casos."));
 }
 panel.addEventListener("toggle",()=>{if(panel.open&&!listo)cargar();});
}
globalThis.LP_POSVENTA={agregar};
})();