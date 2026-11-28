(()=>{"use strict";
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
const campo=(f,t,tag="input")=>{const l=el("label",t),n=el(tag);l.append(n);f.append(l);return n;};
const boton=t=>{const n=el("button",t,"secundario");n.type="button";return n;};
async function api(ruta,method="GET",data){const r=await fetch(ruta,{method,credentials:"same-origin",cache:"no-store",headers:data?{"Content-Type":"application/json"}:undefined,body:data?JSON.stringify(data):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Error "+r.status);return d;}
function agregar(art,x){
 const ruta="/api/admin/servicios/"+encodeURIComponent(x.propuesta_id)+"/vinculos",panel=el("details",undefined,"proyecto-bloque vinculo-servicio"),head=el("summary","Vinculación del negocio"),caja=el("section",undefined,"economica-panel");panel.append(head,caja);art.append(panel);
 let cargado=false,ocupado=false;const vigente=()=>panel.isConnected&&!document.getElementById("panel").hidden;
 async function cargar(){if(ocupado)return;ocupado=true;try{const d=await api(ruta);if(vigente()){pintar(d);cargado=true;}}catch(e){if(vigente()){const b=boton("Reintentar");b.addEventListener("click",cargar);caja.replaceChildren(el("p",e.message),b);}}finally{ocupado=false;}}
 function pintar(d){
  const activo=d.items.find(i=>i.estado==="registrado");
  head.textContent="Vinculación del negocio · "+(activo?"Registrada":"Sin vincular");
  caja.replaceChildren(el("p","Registro administrativo únicamente. No habilita acceso, no verifica la identidad externa y no conecta el sitio. Usa el identificador estable real asignado por la plataforma, no el nombre comercial ni un dominio.","metadatos"));
  const refresh=boton("Actualizar vinculación");refresh.addEventListener("click",()=>{if(confirm("¿Actualizar? Se perderán borradores no guardados."))cargar();});caja.append(refresh);
  if(activo){
   const box=el("div",undefined,"vinculo-actual");box.append(el("strong","Asociación registrada · conexión pendiente"),el("p","Plataforma: "+activo.plataforma),el("p","ID externo: "+activo.negocio_externo),el("p","Registro: "+fecha(activo.fecha_registro),"metadatos"));caja.append(box);
   const form=el("form",undefined,"economica-form"),motivo=campo(form,"Motivo de revocación","textarea"),confirmar=campo(form,"Escribe REVOCAR para confirmar"),b=el("button","Revocar asociación"),msg=el("p",undefined,"metadatos");motivo.required=true;motivo.minLength=3;motivo.maxLength=500;confirmar.required=true;confirmar.pattern="REVOCAR";b.type="submit";msg.setAttribute("role","status");form.append(b,msg);const sub=el("details",undefined,"proyecto-bloque");sub.append(el("summary","Revocar vinculación"),form);caja.append(sub);
   form.addEventListener("submit",async e=>{e.preventDefault();if(!confirm("¿Revocar la asociación? Se conserva el historial. No cambia la suscripción ni el sitio."))return;b.disabled=true;try{await api(ruta+"/"+activo.id,"PATCH",{motivo:motivo.value,confirmar:confirmar.value});if(vigente())await cargar();}catch(e){msg.textContent=e.message;b.disabled=false;}});
  }else{
   const form=el("form",undefined,"economica-form"),plataforma=campo(form,"Identificador de plataforma"),negocio=campo(form,"Identificador externo del negocio"),b=el("button","Registrar vinculación"),msg=el("p",undefined,"metadatos");plataforma.required=negocio.required=true;plataforma.maxLength=80;negocio.maxLength=128;plataforma.pattern="[a-z0-9][a-z0-9_\\-]{0,79}";negocio.pattern="[a-z0-9][a-z0-9._:\\-]{0,127}";plataforma.placeholder="Identificador acordado con el otro sistema";negocio.placeholder="ID estable del negocio";b.type="submit";msg.setAttribute("role","status");form.append(b,msg);caja.append(form);let intento=null;
   form.addEventListener("input",()=>{if(!b.disabled)intento=null;});
   form.addEventListener("submit",async e=>{e.preventDefault();if(!confirm("¿Confirmas que verificaste el identificador del negocio correspondiente a "+(x.proyecto||x.nombre)+"? Esto no habilita acceso."))return;b.disabled=true;intento=intento||{id:crypto.randomUUID(),plataforma:plataforma.value.trim(),negocio_externo:negocio.value.trim(),confirmar:true};try{await api(ruta,"POST",intento);if(vigente())await cargar();}catch(e){msg.textContent=e.message;b.disabled=false;}});
  }
  const historial=el("details",undefined,"proyecto-bloque");historial.append(el("summary","Historial de vinculaciones revocadas"));const anteriores=d.items.filter(i=>i.estado==="revocado");if(!anteriores.length)historial.append(el("p","Sin revocaciones."));for(const i of anteriores){const a=el("article",undefined,"soporte-intervencion");a.append(el("strong",i.plataforma+" · "+i.negocio_externo),el("p","Registrada: "+fecha(i.fecha_registro)+" · Revocada: "+fecha(i.fecha_revocacion),"metadatos"),el("p",i.motivo_revocacion));historial.append(a);}if(d.limitado)historial.append(el("p","Vista limitada a 100 registros.","metadatos"));caja.append(historial);
 }
 const fecha=v=>v?new Date(v).toLocaleString("es-MX",{timeZone:"America/Mazatlan"}):"—";
 panel.addEventListener("toggle",()=>{if(panel.open&&!cargado)cargar();});
}
globalThis.LP_VINCULOS={agregar};
})();