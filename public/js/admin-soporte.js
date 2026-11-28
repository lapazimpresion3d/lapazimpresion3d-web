(()=>{"use strict";
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
const campo=(f,t,tag="input")=>{const l=el("label",t),n=el(tag);l.append(n);f.append(l);return n;};
const opciones={tipo:{incidencia:"Incidencia técnica",mantenimiento:"Mantenimiento preventivo",cambio_menor:"Cambio menor solicitado",adicional:"Trabajo adicional"},prioridad:{baja:"Baja",normal:"Normal",alta:"Alta",critica:"Crítica"},estado:{abierto:"Abierto",en_proceso:"En proceso",espera_cliente:"Esperando al cliente",resuelto:"Resuelto",cancelado:"Cancelado"},origen:{whatsapp:"WhatsApp",correo:"Correo",telefono:"Teléfono",presencial:"Presencial",interno:"Interno",otro:"Otro"},clasificacion:{soporte:"Soporte técnico",mantenimiento:"Mantenimiento",bolsa:"Bolsa de cambios menores",adicional:"Adicional autorizado",sin_cargo:"Sin cargo"}};
function select(f,t,k){const n=campo(f,t,"select");for(const [v,l] of Object.entries(opciones[k])){const o=el("option",l);o.value=v;n.append(o);}return n;}
function boton(t){const n=el("button",t,"secundario");n.type="button";return n;}
async function api(ruta,method="GET",data){const r=await fetch(ruta,{method,credentials:"same-origin",cache:"no-store",headers:data?{"Content-Type":"application/json"}:undefined,body:data?JSON.stringify(data):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Error "+r.status);return d;}
function conversacion(body,ruta,q,vigente){
 const panel=el("details",undefined,"proyecto-bloque soporte-conversacion"),head=el("summary","Conversación para el cliente"),caja=el("div",undefined,"economica-panel");panel.append(head,caja);body.append(panel);
 let cargado=false,ocupado=false;
 async function cargar(){if(ocupado)return;ocupado=true;try{
  const d=await api(ruta+"/mensajes");if(!vigente()||!panel.isConnected)return;
  cargado=true;const lista=el("div",undefined,"soporte-mensajes"),ref=boton("Actualizar conversación");
  ref.addEventListener("click",()=>{if(confirm("¿Actualizar conversación? Se perderá el borrador no guardado."))cargar();});
  caja.replaceChildren(el("p","Mensajes destinados al cliente. La conexión con su panel aún no está habilitada: guardar aquí no envía una notificación ni confirma recepción. No incluyas contraseñas, notas internas ni costos operativos.","metadatos"),ref,lista);
  if(d.limitado)lista.append(el("p","Se muestran los últimos 200 mensajes.","metadatos"));
  if(!d.mensajes.length)lista.append(el("p","Sin mensajes registrados."));
  for(const m of d.mensajes){const a=el("article",undefined,"soporte-mensaje");a.dataset.autor=m.autor;a.append(el("strong",m.autor==="cliente"?"Cliente":"Lapazimpresion3d"),el("p",m.texto),el("p",new Date(m.fecha_registro).toLocaleString("es-MX",{timeZone:"America/Mazatlan"}),"metadatos"));lista.append(a);}
  if(q.estado==="cancelado")return;
  const form=el("form",undefined,"economica-form"),texto=campo(form,"Respuesta destinada al cliente","textarea"),b=el("button","Guardar respuesta"),msg=el("p",undefined,"metadatos");texto.required=true;texto.maxLength=3000;texto.rows=4;b.type="submit";msg.setAttribute("role","status");form.append(b,msg);caja.append(form);let intento=null;
  form.addEventListener("input",()=>{if(!b.disabled)intento=null;});
  form.addEventListener("submit",async ev=>{ev.preventDefault();if(!confirm("¿Guardar esta respuesta destinada al cliente? No se enviará una notificación externa."))return;b.disabled=true;intento=intento||{id:crypto.randomUUID(),texto:texto.value};try{await api(ruta+"/mensajes","POST",intento);if(vigente()&&panel.isConnected)await cargar();}catch(e){msg.textContent=e.message;b.disabled=false;}});
 }catch(e){if(vigente()&&panel.isConnected){const retry=boton("Reintentar");retry.addEventListener("click",cargar);caja.replaceChildren(el("p",e.message),retry);}}finally{ocupado=false;}}
 panel.addEventListener("toggle",()=>{if(panel.open&&!cargado)cargar();});
}
function agregar(art,x){
 const ruta="/api/admin/servicios/"+encodeURIComponent(x.propuesta_id)+"/soporte",detalle=el("details",undefined,"proyecto-bloque soporte-servicio"),sum=el("summary","Soporte técnico y mantenimiento"),caja=el("section",undefined,"economica-panel");detalle.append(sum,caja);art.append(detalle);
 let cargado=false,ocupado=false;
 const vigente=()=>art.isConnected&&!document.getElementById("panel").hidden;
 async function cargar(){if(ocupado)return;ocupado=true;caja.replaceChildren(el("p","Consultando soporte…"));try{const d=await api(ruta);if(vigente()){pintar(d);cargado=true;}}catch(e){if(vigente()){const b=boton("Reintentar");b.addEventListener("click",cargar);caja.replaceChildren(el("p",e.message),b);}}finally{ocupado=false;}}
 function pintar(d){
  sum.textContent="Soporte técnico y mantenimiento · "+d.resumen.pendientes+" pendientes";
  const cab=el("div",undefined,"soporte-resumen"),total=d.mes.reduce((n,i)=>n+i.minutos,0),bolsa=d.mes.find(i=>i.clasificacion==="bolsa")?.minutos||0,referencia={"presencia-digital":15,"negocio-interactivo":30,"gestion-comercial":45,"gestion-profesional":60}[x.paquete];
  for(const [t,v] of [["Pendientes",d.resumen.pendientes],["Registros",d.resumen.total],["Minutos trabajados este mes",total],["Cambios menores este mes",bolsa]]){const item=el("div");item.append(el("strong",String(v)),el("span",t,"metadatos"));cab.append(item);}
  const refresh=boton("Actualizar soporte");refresh.addEventListener("click",()=>{if(confirm("¿Actualizar? Se perderán borradores no guardados."))cargar();});
  caja.replaceChildren(cab,el("p","Mes calendario "+d.hoy.slice(0,7)+" · "+(referencia?"Bolsa comercial de referencia: "+referencia+" min. ":"")+"Los minutos no generan cobros ni modifican contratos. Verifica el alcance acordado.","metadatos"),refresh);
  const nuevo=el("details",undefined,"proyecto-bloque"),f=el("form",undefined,"economica-form");nuevo.append(el("summary","+ Registrar solicitud o mantenimiento"),f);caja.append(nuevo);
  const titulo=campo(f,"Asunto"),descripcion=campo(f,"Descripción","textarea"),tipo=select(f,"Tipo","tipo"),prioridad=select(f,"Prioridad","prioridad"),origen=select(f,"Origen","origen");titulo.required=descripcion.required=true;titulo.maxLength=120;descripcion.maxLength=2000;descripcion.rows=3;prioridad.value="normal";
  const guardar=el("button","Registrar solicitud"),msg=el("p",undefined,"metadatos");guardar.type="submit";msg.setAttribute("role","status");f.append(guardar,msg);let intento=null;
  f.addEventListener("input",()=>{if(!guardar.disabled)intento=null;});
  f.addEventListener("submit",async ev=>{ev.preventDefault();guardar.disabled=true;intento=intento||{id:crypto.randomUUID(),titulo:titulo.value,descripcion:descripcion.value,tipo:tipo.value,prioridad:prioridad.value,origen:origen.value};try{await api(ruta,"POST",intento);if(vigente())await cargar();}catch(e){msg.textContent=e.message;guardar.disabled=false;}});
  if(d.limitado)caja.append(el("p","Se muestran hasta 100 solicitudes, priorizando pendientes.","metadatos"));
  if(!d.items.length)caja.append(el("p","Sin solicitudes registradas."));
  for(const t of d.items){const panel=el("details",undefined,"proyecto-bloque soporte-ticket"),head=el("summary",(t.desde_panel?"[Panel del negocio] ":"")+t.titulo+" · "+opciones.estado[t.estado]+" · "+opciones.prioridad[t.prioridad]),body=el("div",undefined,"economica-panel");panel.dataset.prioridad=t.prioridad;panel.append(head,body);caja.append(panel);let cargadoTicket=false;
   panel.addEventListener("toggle",()=>{if(panel.open&&!cargadoTicket)ver();});
   async function ver(){body.replaceChildren(el("p","Cargando…"));try{const v=await api(ruta+"/"+t.id);if(!vigente()||!panel.isConnected)return;cargadoTicket=true;const q=v.solicitud;
    body.replaceChildren(el("p",q.descripcion),el("p",opciones.tipo[q.tipo]+" · "+opciones.origen[q.origen]+" · "+new Date(q.fecha_registro).toLocaleString("es-MX",{timeZone:"America/Mazatlan"}),"metadatos"),el("p",t.minutos+" minutos registrados","metadatos"));
    if(v.cliente){const categorias={funcionamiento:"Problema de funcionamiento",ayuda:"Ayuda de uso",modificacion:"Modificación",suscripcion:"Suscripción",nueva_funcion:"Nueva funcionalidad",mejora:"Propuesta de mejora",otro:"Otro"},impactos={bajo:"Bajo",parcial:"Parcial",bloqueante:"Bloqueante"};body.append(el("p","Origen: panel del negocio · "+(categorias[v.cliente.categoria]||v.cliente.categoria),"metadatos"),el("p","Módulo: "+(v.cliente.modulo||"No indicado")+" · Impacto indicado por el cliente: "+(impactos[v.cliente.impacto]||v.cliente.impacto),"metadatos"));}
    conversacion(body,ruta+"/"+t.id,q,vigente);
    const form=el("form",undefined,"economica-form"),estado=select(form,"Estado","estado"),pri=select(form,"Prioridad","prioridad");estado.value=q.estado;pri.value=q.prioridad;const b=el("button","Guardar estado"),av=el("p",undefined,"metadatos");b.type="submit";av.setAttribute("role","status");form.append(b,av);body.append(form);
    form.addEventListener("submit",async ev=>{ev.preventDefault();b.disabled=true;try{await api(ruta+"/"+t.id,"PATCH",{estado:estado.value,prioridad:pri.value,version:q.version});if(vigente())await cargar();}catch(e){av.textContent=e.message;b.disabled=false;}});
    if(q.estado!=="cancelado"){const nf=el("form",undefined,"economica-form"),texto=campo(nf,"Trabajo realizado / resultado","textarea"),min=campo(nf,"Minutos de trabajo"),fecha=campo(nf,"Fecha de trabajo"),clase=select(nf,"Clasificación","clasificacion"),aut=campo(nf,"Referencia de autorización del trabajo adicional"),g=el("button","Registrar intervención"),m=el("p",undefined,"metadatos");texto.required=true;texto.maxLength=2000;texto.rows=3;min.type="number";min.min="0";min.max="1440";min.step="1";min.required=true;min.value="0";fecha.type="date";fecha.max=v.hoy;fecha.value=v.hoy;fecha.required=true;aut.maxLength=500;const ajustar=()=>{aut.required=clase.value==="adicional";aut.disabled=!aut.required;if(aut.disabled)aut.value="";};clase.addEventListener("change",ajustar);ajustar();g.type="submit";m.setAttribute("role","status");nf.append(el("p","Solo registra el trabajo; no crea factura, deuda ni cargo.","metadatos"),g,m);body.append(el("h4","Registrar intervención interna"),el("p","Registro privado de administración; no se comparte con el cliente.","metadatos"),nf);let intento=null;nf.addEventListener("input",()=>{if(!g.disabled)intento=null;});nf.addEventListener("submit",async ev=>{ev.preventDefault();if(clase.value==="adicional"&&!confirm("¿Confirmas que el cliente autorizó este trabajo adicional?"))return;g.disabled=true;intento=intento||{id:crypto.randomUUID(),descripcion:texto.value,minutos:Number(min.value),fecha_trabajo:fecha.value,clasificacion:clase.value,autorizacion:aut.value};try{await api(ruta+"/"+t.id+"/intervenciones","POST",intento);if(vigente())await cargar();}catch(e){m.textContent=e.message;g.disabled=false;}});}
    body.append(el("h4","Historial de intervenciones internas"));if(!v.intervenciones.length)body.append(el("p","Sin intervenciones registradas."));if(v.limitado)body.append(el("p","Últimas 200 intervenciones.","metadatos"));for(const i of v.intervenciones){const r=el("article",undefined,"soporte-intervencion");r.append(el("strong",i.fecha_trabajo+" · "+i.minutos+" min · "+opciones.clasificacion[i.clasificacion]),el("p",i.descripcion));if(i.autorizacion)r.append(el("p","Autorización: "+i.autorizacion,"metadatos"));body.append(r);}
   }catch(e){const b=boton("Reintentar");b.addEventListener("click",ver);body.replaceChildren(el("p",e.message),b);}}
  }
 }
 detalle.addEventListener("toggle",()=>{if(detalle.open&&!cargado)cargar();});
}
globalThis.LP_SOPORTE={agregar};
})();