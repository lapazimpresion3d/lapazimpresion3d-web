(()=>{"use strict";
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
const campo=(f,t,tag="input")=>{const l=el("label",t),n=el(tag);l.append(n);f.append(l);return n;};
const boton=t=>{const b=el("button",t,"secundario");b.type="button";return b;};
const alcance={datos:"Datos",archivos:"Archivos",completo:"Completo",configuracion:"Configuración"},resultados={correcto:"Correcto",parcial:"Parcial",fallido:"Fallido"},metodos={manual:"Manual",automatizado:"Automatizado",proveedor:"Proveedor"};
function sel(f,t,o){const n=campo(f,t,"select");for(const [k,v] of Object.entries(o)){const a=el("option",v);a.value=k;n.append(a);}return n;}
async function api(url,datos){const r=await fetch(url,{method:datos?"POST":"GET",credentials:"same-origin",cache:"no-store",headers:datos?{"Content-Type":"application/json"}:undefined,body:datos?JSON.stringify(datos):undefined});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||"Error "+r.status);return d;}
function formGuardar(f,b,msg,datos,guardar){let intento=null;f.addEventListener("input",()=>{if(!b.disabled)intento=null;});f.addEventListener("submit",async e=>{e.preventDefault();if(!confirm("¿Confirmas que esta operación ya se realizó y que los datos son correctos?"))return;b.disabled=true;try{intento=intento||{id:crypto.randomUUID(),...datos()};await guardar(intento);msg.textContent="Registro guardado.";f.reset();intento=null;}catch(e){msg.textContent=e.message;}finally{b.disabled=false;}});}
function agregar(art,x){
 const ruta="/api/admin/servicios/"+encodeURIComponent(x.propuesta_id)+"/respaldos",p=el("details",undefined,"proyecto-bloque"),head=el("summary","Respaldos y recuperación"),c=el("div",undefined,"economica-panel");p.append(head,c);art.append(p);let cargado=false,ocupado=false;
 const vigente=()=>art.isConnected&&!document.getElementById("panel").hidden;
 async function cargar(){if(ocupado)return;ocupado=true;try{const d=await api(ruta);if(!vigente())return;cargado=true;pintar(d);}catch(e){if(vigente()){const b=boton("Reintentar");b.addEventListener("click",cargar);c.replaceChildren(el("p",e.message),b);}}finally{ocupado=false;}}
 function pintar(d){
 const r=d.resumen;head.textContent="Respaldos y recuperación · "+r.total+" registros";
 const met=el("div",undefined,"soporte-resumen");for(const [k,v] of [["Último respaldo correcto",r.ultimo_correcto],["Último completo correcto",r.ultimo_completo],["Último intento",r.ultimo_intento],["Última prueba de recuperación",d.ultima_prueba?d.ultima_prueba.fecha_prueba+" · "+resultados[d.ultima_prueba.resultado]:""]]){const a=el("div");a.append(el("strong",v||"Sin registro"),el("span",k,"metadatos"));met.append(a);}
 const ref=boton("Actualizar registros");ref.addEventListener("click",()=>{if(confirm("¿Actualizar? Se perderán borradores no guardados."))cargar();});c.replaceChildren(el("p","Bitácora administrativa de operaciones realizadas. No crea, descarga ni restaura respaldos. No registra credenciales ni enlaces privados.","metadatos"),met,ref);
 politicas(c,x,vigente);
 const f=el("form",undefined,"economica-form"),fecha=campo(f,"Fecha del respaldo"),a=sel(f,"Alcance",alcance),res=sel(f,"Resultado",resultados),m=sel(f,"Método",metodos),referencia=campo(f,"Referencia interna (sin credenciales ni URL privada)"),obs=campo(f,"Observaciones","textarea"),b=el("button","Registrar respaldo realizado"),msg=el("p",undefined,"metadatos");fecha.type="date";fecha.required=true;fecha.max=d.hoy;fecha.value=d.hoy;referencia.maxLength=200;obs.maxLength=2000;b.type="submit";msg.setAttribute("role","status");f.append(b,msg);
 const nuevo=el("details",undefined,"proyecto-bloque");nuevo.append(el("summary","+ Registrar respaldo"),f);c.append(nuevo);formGuardar(f,b,msg,()=>({fecha_respaldo:fecha.value,alcance:a.value,resultado:res.value,metodo:m.value,referencia:referencia.value,observaciones:obs.value}),async datos=>{await api(ruta,datos);if(vigente())await cargar();});
 if(d.limitado)c.append(el("p","Últimos 100 respaldos.","metadatos"));if(!d.items.length)c.append(el("p","Sin respaldos registrados. Esto no demuestra que no existan copias."));
 for(const x of d.items){const p=el("details",undefined,"proyecto-bloque"),body=el("div",undefined,"economica-panel");p.append(el("summary",x.fecha_respaldo+" · "+alcance[x.alcance]+" · "+resultados[x.resultado]+" · "+x.pruebas+" pruebas"),body);c.append(p);let listo=false,ocup=false;
 async function pruebas(){if(ocup)return;ocup=true;try{const d2=await api(ruta+"/"+x.id+"/pruebas");if(!vigente()||!p.isConnected)return;listo=true;body.replaceChildren(el("p","Método: "+metodos[x.metodo]),el("p",x.referencia||"Sin referencia"),el("p",x.observaciones||"Sin observaciones"));if(d2.limitado)body.append(el("p","Últimas 100 pruebas.","metadatos"));if(!d2.items.length)body.append(el("p","Sin pruebas de recuperación registradas."));for(const q of d2.items){const z=el("article",undefined,"soporte-intervencion");z.append(el("strong",q.fecha_prueba+" · "+resultados[q.resultado]+" · "+q.minutos+" min"),el("p",q.observaciones));body.append(z);}
 if(x.resultado==="fallido")return;
 const f=el("form",undefined,"economica-form"),fecha=campo(f,"Fecha de prueba"),res=sel(f,"Resultado",resultados),min=campo(f,"Duración en minutos"),obs=campo(f,"Comprobaciones realizadas y resultado","textarea"),b=el("button","Registrar prueba realizada"),msg=el("p",undefined,"metadatos");fecha.type="date";fecha.min=x.fecha_respaldo;fecha.max=d.hoy;fecha.value=d.hoy;fecha.required=true;min.type="number";min.min=0;min.max=10080;min.step=1;min.value=0;min.required=true;obs.required=true;obs.minLength=3;obs.maxLength=2000;b.type="submit";msg.setAttribute("role","status");f.append(el("p","Registra únicamente una prueba ya efectuada en un entorno aislado; no se ejecuta una restauración aquí.","metadatos"),b,msg);body.append(f);formGuardar(f,b,msg,()=>({fecha_prueba:fecha.value,resultado:res.value,minutos:Number(min.value),observaciones:obs.value}),async datos=>{await api(ruta+"/"+x.id+"/pruebas",datos);if(vigente())await cargar();});
 }catch(e){if(vigente()&&p.isConnected){const b=boton("Reintentar");b.addEventListener("click",pruebas);body.replaceChildren(el("p",e.message),b);}}finally{ocup=false;}}
 p.addEventListener("toggle",()=>{if(p.open&&!listo)pruebas();});
 }
 }
 p.addEventListener("toggle",()=>{if(p.open&&!cargado)cargar();});
}
function politicas(c,x,vigente){
 const ruta="/api/admin/servicios/"+encodeURIComponent(x.propuesta_id)+"/politicas-respaldos",p=el("details",undefined,"proyecto-bloque"),body=el("div",undefined,"economica-panel");p.append(el("summary","Políticas y calendario de respaldos"),body);c.append(p);let listo=false,ocupado=false;
 const etiquetas={pausada:"Pausada",programada:"Programada",incidencia:"Último intento parcial o fallido",pendiente:"Pendiente de registro",al_corriente:"Al corriente según registros"};
 async function cargar(){if(ocupado)return;ocupado=true;try{const d=await api(ruta);if(!vigente()||!p.isConnected)return;listo=true;pintar(d);}catch(e){if(vigente()&&p.isConnected){const b=boton("Reintentar");b.addEventListener("click",cargar);body.replaceChildren(el("p",e.message),b);}}finally{ocupado=false;}}
 function pintar(d){
 body.replaceChildren(el("p","Calendario administrativo. No ejecuta respaldos ni elimina copias. La retención es una meta acordada, no una regla de borrado. Cada alcance se evalúa por separado.","metadatos"));
 for(const [k,t] of Object.entries(alcance)){
 const q=d.items.find(z=>z.alcance===k),art=el("details",undefined,"proyecto-bloque"),f=el("form",undefined,"economica-form");art.append(el("summary",t+" · "+(q?etiquetas[q.estado]:"Sin configurar")),f);body.append(art);
 if(q)f.append(el("p","Próxima fecha según registros: "+q.proxima+" · Último correcto: "+(q.ultimo_correcto||"Sin registro"),"metadatos"));
 const freq=campo(f,"Frecuencia (días)"),ret=campo(f,"Retención objetivo (días)"),inicio=campo(f,"Primera fecha programada"),hab=campo(f,"Activar recordatorios"),b=el("button","Guardar política"),msg=el("p",undefined,"metadatos");
 for(const [n,min,max,v] of [[freq,1,365,q?.frecuencia_dias??7],[ret,1,3650,q?.retencion_dias??30]]){n.type="number";n.min=min;n.max=max;n.step=1;n.value=v;n.required=true;}
 inicio.type="date";inicio.required=true;inicio.value=q?.inicio||d.hoy;hab.type="checkbox";hab.checked=q?!!q.habilitada:false;b.type="submit";msg.setAttribute("role","status");f.append(b,msg);
 f.addEventListener("submit",async e=>{e.preventDefault();if(!confirm("¿Guardar política administrativa? No se ejecutarán copias ni borrados."))return;b.disabled=true;try{const r=await fetch(ruta,{method:"PUT",credentials:"same-origin",headers:{"Content-Type":"application/json"},body:JSON.stringify({alcance:k,frecuencia_dias:Number(freq.value),retencion_dias:Number(ret.value),inicio:inicio.value,habilitada:hab.checked,version:q?.version||0})});const z=await r.json();if(!r.ok)throw Error(z.error||"Error "+r.status);if(vigente()&&p.isConnected){await cargar();globalThis.LP_ADMIN_ALERTAS?.cargar();}}catch(e){msg.textContent=e.message;b.disabled=false;}});
 }
 }
 p.addEventListener("toggle",()=>{if(p.open&&!listo)cargar();});
}
globalThis.LP_RESPALDOS={agregar};
})();