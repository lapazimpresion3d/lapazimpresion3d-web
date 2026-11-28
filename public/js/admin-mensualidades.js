(()=>{"use strict";
const $=id=>document.getElementById(id),lista=$("lista-mensualidades"),msg=$("estado-mensualidades"),filtro=$("filtro-mensualidades"),actualizar=$("actualizar-mensualidades");
const etiquetas={sin_iniciar:"Sin iniciar",pendiente:"Primer pago pendiente",al_corriente:"Al corriente",vencido:"Renovación pendiente",suspendido:"Suspendido",cancelado:"Cancelado"};
const money=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n/100);
const el=(tag,t,cls)=>{const e=document.createElement(tag);if(t!==undefined)e.textContent=t;if(cls)e.className=cls;return e;};
const boton=t=>{const e=el("button",t,"secundario");e.type="button";return e;};
const campo=(padre,t,tag="input")=>{const l=el("label",t),e=el(tag);l.append(e);padre.append(l);return e;};
async function api(path,method="GET",body){const res=await fetch(path,{method,credentials:"same-origin",cache:"no-store",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const d=await res.json().catch(()=>({}));if(!res.ok)throw Error(d.error||"Error "+res.status);return d;}
const resumen=$("servicios-resumen"),aviso=$("servicios-aviso"),buscar=$("buscar-servicios"),paqueteFiltro=$("filtro-paquete-servicios");
const planes={"presencia-digital":["P1 — Presencia digital",1,1],"negocio-interactivo":["P2 — Negocio interactivo",3,1],"gestion-comercial":["P3 — Gestión comercial",5,2],"gestion-profesional":["P4 — Gestión profesional",10,3],"a-medida":["A medida",null,null]};
const normalizar=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
let items=[],hoy="",generacion=0,ocupado=false,limitado=false,entregasDisponibles=false,cargado=false;
function limpiar(){generacion++;items=[];hoy="";ocupado=false;cargado=false;limitado=false;entregasDisponibles=false;lista.replaceChildren();resumen.replaceChildren();aviso.textContent="";msg.textContent="";buscar.value="";paqueteFiltro.value="";filtro.value="";actualizar.disabled=false;}
$("salir").addEventListener("click",limpiar);
async function cargar(){
 if(ocupado)return;ocupado=true;const g=++generacion;actualizar.disabled=true;msg.textContent="Consultando mensualidades…";
 try{const d=await api("/api/admin/mensualidades");if(g!==generacion||$("panel").hidden)return;items=d.items;hoy=d.hoy;limitado=d.limitado;entregasDisponibles=d.entregas_disponibles;cargado=true;pintar();}
 catch(e){if(g===generacion){items=[];cargado=false;lista.replaceChildren();resumen.replaceChildren();aviso.textContent="";msg.textContent="No se pudo consultar: "+e.message+". Comprueba la migración 0006."}}
 finally{if(g===generacion){ocupado=false;actualizar.disabled=false;}}
}
function pintar(){
 lista.replaceChildren();
 if(!cargado)return;
 resumen.replaceChildren();
 for(const [label,n,k] of [["Contratados",items.length,""],["Al corriente",items.filter(x=>x.situacion==="al_corriente").length,"al_corriente"],["Renovación pendiente",items.filter(x=>x.situacion==="vencido").length,"vencido"],["Sin iniciar",items.filter(x=>x.situacion==="sin_iniciar").length,"sin_iniciar"]]){
  const b=boton("");b.className="proyectos-metrica";b.append(el("strong",String(n)),el("span",label));b.setAttribute("aria-pressed",String(filtro.value===k));b.addEventListener("click",()=>{filtro.value=k;pintar();});resumen.append(b);
 }
 const base=items.filter(x=>x.estado==="activo").reduce((n,x)=>n+(x.mensualidad??x.tarifa_acordada),0);
 aviso.textContent="Tarifa mensual acordada de suscripciones administrativamente activas: "+money(base)+" antes de IVA. No representa ingresos cobrados. "+(limitado?"Vista limitada a los 200 registros recientes. ":"")+(!entregasDisponibles?"Información de entrega no disponible. ":"");
 const q=normalizar(buscar.value.trim());
 const visibles=items.filter(x=>(!filtro.value||x.situacion===filtro.value)&&(!paqueteFiltro.value||x.paquete===paqueteFiltro.value)&&(!q||normalizar([x.nombre,x.folio,x.proyecto].join(" ")).includes(q)));
 msg.textContent=visibles.length+" de "+items.length+" servicios mostrados · máximo 200 · "+hoy;
 for(const x of visibles){
  const art=el("article",undefined,"registro");
  art.classList.add("servicio-contratado");
  const plan=planes[x.paquete]||[x.paquete,null,null],cab=el("div",undefined,"servicio-contratado-cab"),id=el("div"),precio=el("div");
  id.append(el("h3",x.proyecto||x.nombre),el("p",x.folio+" · "+x.nombre,"metadatos"),el("strong",plan[0]));
  precio.append(el("strong",money(x.total_mensual??x.total_acordado)+" / mes"),el("p","Con IVA · importe acordado","metadatos"),el("p",etiquetas[x.situacion],"servicio-situacion"));
  cab.append(id,precio);art.append(cab);
  const info=el("div",undefined,"servicio-contratado-info");
  info.append(el("p",x.proxima?"Próximo periodo desde "+x.proxima:"Servicio aún no iniciado"),el("p",x.fecha_entrega?"Entrega registrada: "+x.fecha_entrega:entregasDisponibles?"Sin entrega registrada":"Entrega no disponible"));
  if(plan[1])info.append(el("p","Capacidad de referencia (no contrato): "+plan[1]+" usuario(s) · "+plan[2]+" sucursal(es)"));
  if(x.garantia_hasta)info.append(el("p","Garantía registrada hasta "+x.garantia_hasta));
  if(x.url_final){try{const u=new URL(x.url_final);if(u.protocol==="https:"&&!u.username&&!u.password){const a=el("a","Abrir sitio registrado","boton-enlace");a.href=u.href;a.target="_blank";a.rel="noopener noreferrer";info.append(a);}}catch{}}
  art.append(info);
  const b=boton("Gestionar renovación"),caja=el("section",undefined,"economica-panel");caja.hidden=true;
  b.addEventListener("click",()=>{if(!caja.hidden){caja.hidden=true;return;}detalle(x,caja,b);});
  art.append(b,caja);globalThis.LP_VINCULOS?.agregar(art,x);globalThis.LP_SOPORTE?.agregar(art,x);lista.append(art);
 }
 if(!visibles.length)lista.append(el("p","No hay servicios con este filtro."));
}
async function detalle(x,caja,b){
 const ruta="/api/admin/mensualidades/"+encodeURIComponent(x.propuesta_id),g=generacion;
 caja.hidden=false;b.disabled=true;caja.replaceChildren(el("p","Cargando…"));
 try{
  const d=await api(ruta);if(g!==generacion||$("panel").hidden)return;
  caja.replaceChildren(el("h4","Control del servicio"));
  const q=d.suscripcion,estado=el("p","","metadatos");estado.setAttribute("role","status");
  const ejecutar=async(btn,path,method,data)=>{btn.disabled=true;estado.textContent="Guardando…";try{await api(path,method,data);if(g===generacion)await cargar();}catch(e){estado.textContent=e.message;btn.disabled=false;}};
  if(!q){
   const f=el("form",undefined,"economica-form"),inicio=campo(f,"Fecha de inicio del servicio");inicio.type="date";inicio.min=d.acuerdo.fecha_aceptacion;inicio.max=d.hoy;inicio.value=d.hoy;inicio.required=true;
   const guardar=el("button","Registrar inicio");guardar.type="submit";f.append(guardar);
   f.addEventListener("submit",e=>{e.preventDefault();if(confirm("¿Registrar el inicio del servicio? No se cobrará nada."))ejecutar(guardar,ruta,"POST",{inicio:inicio.value});});
   caja.append(el("p","Tarifa acordada: "+money(d.acuerdo.total_mensual)+" mensuales con IVA."),f,estado);return;
  }
  caja.append(el("p","Inicio: "+q.inicio+" · Estado administrativo: "+etiquetas[q.estado==="activo"?d.situacion:q.estado]),el("p","Mensualidad: "+money(q.total_mensual)+" con IVA · "+(d.pagos.length?"Cubierto hasta antes del "+d.proxima:"Primer periodo desde "+q.inicio)));
  if(q.estado!=="cancelado"){
   const f=el("div",undefined,"economica-form"),sel=campo(f,"Estado administrativo","select");
   for(const [k,t] of [["activo","Activo"],["suspendido","Suspendido"],["cancelado","Cancelado (definitivo)"]]){const o=el("option",t);o.value=k;sel.append(o);}sel.value=q.estado;
   const gbtn=boton("Guardar estado");f.append(gbtn);gbtn.addEventListener("click",()=>{if(sel.value===q.estado)return;if(confirm("¿Cambiar estado administrativo? No modifica el sitio real. Cancelar impide nuevas renovaciones de este registro."))ejecutar(gbtn,ruta,"PATCH",{estado:sel.value,version:q.version});});
   caja.append(f);
  }
  if(q.estado==="activo"){
   const f=el("form",undefined,"economica-form"),modo=campo(f,"Periodo a renovar","select");
   const cont=el("option","Continuar desde "+d.proxima);cont.value="continuar";modo.append(cont);
   if(d.proxima<d.hoy){const rein=el("option","Reiniciar desde hoy, sin cobrar el intervalo");rein.value="reiniciar";modo.append(rein);}
   const fecha=campo(f,"Fecha de pago recibido");fecha.type="date";fecha.min=d.acuerdo.fecha_aceptacion;fecha.max=d.hoy;fecha.value=d.hoy;fecha.required=true;
   const metodo=campo(f,"Método","select");for(const k of ["transferencia","efectivo","otro"]){const o=el("option",k);o.value=k;metodo.append(o);}
   const ref=campo(f,"Referencia opcional");ref.maxLength=160;
   const pagar=el("button","Registrar mensualidad recibida");pagar.type="submit";f.append(pagar,el("p","Importe fijo por periodo: "+money(q.total_mensual)+". No se realiza ningún cargo.","metadatos"));
   let intento=null;f.addEventListener("input",()=>{if(!pagar.disabled)intento=null;});
   f.addEventListener("submit",e=>{e.preventDefault();if(!intento){if(!confirm("¿Confirmas que recibiste "+money(q.total_mensual)+" para este periodo?"))return;intento={id:crypto.randomUUID(),esperada:d.proxima,modo:modo.value,fecha:fecha.value,metodo:metodo.value,referencia:ref.value};}ejecutar(pagar,ruta+"/pagos","POST",intento);});
   caja.append(f);
  }
  caja.append(estado,el("h4","Historial de mensualidades"));
  if(!d.pagos.length)caja.append(el("p","Sin pagos registrados."));
  for(const p of d.pagos)caja.append(el("p",p.inicio+" a "+p.fin+" (fin no incluido) · "+money(p.importe)+" · Recibido "+p.fecha+" · "+p.metodo+(p.referencia?" · "+p.referencia:""),"pago-economico"));
 }catch(e){if(g===generacion)caja.replaceChildren(el("p",e.message));}finally{b.disabled=false;}
}
actualizar.addEventListener("click",cargar);filtro.addEventListener("change",pintar);buscar.addEventListener("input",pintar);paqueteFiltro.addEventListener("change",pintar);$("titulo-mensualidades").closest("details").addEventListener("toggle",e=>{if(e.currentTarget.open&&!cargado&&!$("panel").hidden)cargar();});
})();
