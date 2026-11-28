(()=>{"use strict";
const $=id=>document.getElementById(id),lista=$("lista-alertas"),avisos=$("avisos-alertas"),estado=$("estado-alertas"),filtro=$("filtro-alertas"),actualizar=$("actualizar-alertas"),correo=$("correo-alertas");
const e=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
async function api(path,method="GET",body){const r=await fetch(path,{method,credentials:"same-origin",cache:"no-store",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Error "+r.status);return d;}
let datos=null,generacion=0,ocupado=false,ocultarAvisos=false;
const descartadas=new Set(),clave=x=>JSON.stringify([x.folio,x.tipo,x.fecha]);
const borrarTodas=$("descartar-alertas"),restaurar=$("restaurar-alertas"),ocultar=$("ocultar-avisos");
function visibles(){return (datos?.items||[]).filter(x=>!descartadas.has(clave(x)));}
function guardar(){try{localStorage.setItem("lp_admin_alertas_descartadas_v1",JSON.stringify([...descartadas].slice(-5000)));}catch{}}
try{const previo=JSON.parse(localStorage.getItem("lp_admin_alertas_descartadas_v1")||"[]");if(Array.isArray(previo))for(const k of previo.slice(-5000))if(typeof k==="string")descartadas.add(k);}catch{}
borrarTodas?.addEventListener("click",()=>{if(!datos||!confirm("¿Descartar todas las alertas comerciales actuales? No se eliminarán solicitudes ni proyectos."))return;for(const x of datos.items)descartadas.add(clave(x));guardar();pintar();});
restaurar?.addEventListener("click",()=>{descartadas.clear();guardar();ocultarAvisos=false;pintar();});
ocultar?.addEventListener("click",()=>{ocultarAvisos=!ocultarAvisos;pintar();});
const mensajes={nueva:"Te contactamos para revisar tu solicitud y preparar una propuesta.",seguimiento:"Queremos dar seguimiento a tu solicitud y confirmar los detalles.",cotizacion:"¿Pudiste revisar la cotización? Estamos disponibles para aclarar dudas.",materiales:"Te recordamos que puedes entregar los materiales desde tu portal privado. Si necesitas ayuda, avísanos.",corregir_materiales:"Hay materiales que requieren corrección. Consulta las indicaciones en tu portal privado.",aprobar:"Tu revisión está disponible en el portal privado. Puedes aprobarla o indicar los cambios que necesitas.",renovacion:"Tu periodo de servicio requiere renovación si deseas continuar. Podemos confirmar contigo los detalles.",vence:"Se acerca la fecha de renovación de tu servicio. Avísanos si deseas continuar.",primer_pago:"Queremos confirmar el primer periodo de servicio y su pago acordado."};
function pintar(){
 lista.replaceChildren();avisos.replaceChildren();if(!datos)return;
 const activas=visibles();
 const filas=activas.filter(x=>!filtro.value||x.prioridad===filtro.value||x.seccion===filtro.value);
 estado.textContent=filas.length+" de "+activas.length+" alertas · "+datos.hoy+" · "+activas.filter(x=>x.prioridad==="alta").length+" prioritarias";
 if(datos.avisos.length){avisos.append(e("p",datos.avisos.length+" avisos técnicos de D1"+(ocultarAvisos?" (detalles ocultos)":"")+". No son alertas comerciales.","metadatos"));if(!ocultarAvisos)for(const a of datos.avisos)avisos.append(e("p",a,"metadatos"));}
 if(ocultar){ocultar.disabled=!datos.avisos.length;ocultar.textContent=ocultarAvisos?"Mostrar avisos técnicos":"Ocultar avisos técnicos";}
 if(borrarTodas)borrarTodas.disabled=!activas.length;
 if(restaurar)restaurar.disabled=!descartadas.size&&!ocultarAvisos;
 for(const x of filas){
  const art=e("article",undefined,"registro alerta-registro");art.dataset.prioridad=x.prioridad;
  art.append(e("h3",x.titulo+(x.servicio?" · "+x.servicio:"")),e("p",x.folio+" · "+x.nombre+(x.proyecto?" · "+x.proyecto:"")),e("p",(x.prioridad==="alta"?"Prioritaria · ":"")+x.fecha,"metadatos"));
  const acciones=e("div",undefined,"acciones"),ir=e("button","Ver solicitud","secundario");ir.type="button";
  ir.addEventListener("click",()=>{$("filtro-propuestas").value="";$("buscar-propuestas").value=x.folio;$("actualizar-propuestas").click();globalThis.LP_ADMIN_NAVEGACION?.abrirSeccion("titulo-solicitudes");});acciones.append(ir);
  if(x.seccion!=="solicitudes"){const link=e("a",x.seccion==="proyectos"?"Ir a proyectos":"Ir a mensualidades","boton-enlace");link.href=x.seccion==="proyectos"?"#titulo-proyectos":"#titulo-mensualidades";link.addEventListener("click",e=>{e.preventDefault();globalThis.LP_ADMIN_NAVEGACION?.abrirSeccion(link.hash.slice(1));});acciones.append(link);}
  const tel=String(x.telefono||"").replace(/\D/g,"");if(Object.hasOwn(mensajes,x.tipo)&&/^\d{10}$/.test(tel)){
   const wa=e("a","Preparar mensaje por WhatsApp","boton-enlace");wa.href="https://wa.me/52"+tel+"?text="+encodeURIComponent("Hola "+x.nombre+", te escribimos de Lapazimpresion3d sobre "+x.folio+". "+mensajes[x.tipo]);wa.target="_blank";wa.rel="noopener noreferrer";acciones.append(wa);
  }
  const descartar=e("button","Descartar alerta","secundario");descartar.type="button";descartar.addEventListener("click",()=>{descartadas.add(clave(x));guardar();pintar();});acciones.append(descartar);
  art.append(acciones);lista.append(art);
 }
 if(!filas.length)lista.append(e("p",datos.avisos.length?"No hay alertas visibles en la consulta parcial.":"No hay pendientes en este filtro."));
 correo.disabled=!datos.items.length;
}
async function cargar(){
 if(ocupado)return;ocupado=true;const g=++generacion;actualizar.disabled=correo.disabled=true;estado.textContent="Consultando pendientes…";
 try{const d=await api("/api/admin/alertas");if(g!==generacion||$("panel").hidden)return;datos=d;ocultarAvisos=false;pintar();}
 catch(err){if(g===generacion){datos=null;lista.replaceChildren();avisos.replaceChildren();estado.textContent=err.message;}}
 finally{if(g===generacion){ocupado=false;actualizar.disabled=false;}}
}
correo.addEventListener("click",async()=>{if(!datos||!confirm("¿Enviar el resumen al correo administrativo configurado? Incluye todos los pendientes reales, incluso los descartados en esta vista. No se enviará a los clientes."))return;const g=generacion;correo.disabled=true;try{const d=await api("/api/admin/alertas/resumen","POST",{confirmar:true});if(g===generacion)estado.textContent="Proveedor de correo confirmó la solicitud del resumen de "+d.total+" alertas.";}catch(err){if(g===generacion)estado.textContent=err.message;}finally{if(g===generacion)correo.disabled=!datos?.items.length;}});
actualizar.addEventListener("click",cargar);filtro.addEventListener("change",pintar);$("salir").addEventListener("click",()=>{generacion++;datos=null;ocupado=false;lista.replaceChildren();avisos.replaceChildren();estado.textContent="";correo.disabled=true;actualizar.disabled=false;});
globalThis.LP_ADMIN_ALERTAS=Object.freeze({cargar});
})();
