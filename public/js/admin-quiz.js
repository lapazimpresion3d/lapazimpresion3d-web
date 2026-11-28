(() => { "use strict";
const acceso=document.querySelector("#acceso"),panel=document.querySelector("#panel"),lista=document.querySelector("#lista"),estado=document.querySelector("#estado"),error=document.querySelector("#error-login"),filtro=document.querySelector("#filtro");
const busqueda=document.querySelector("#busqueda");
let ultimosItems=[];
const nombres={
  objetivo:"¿Qué te gustaría conseguir principalmente con este proyecto?",
  situacion:"¿En qué situación te encuentras ahora mismo?",
  contacto_actual:"¿Cómo se utilizará o compartirá el resultado de tu proyecto?",
  mejora_deseada:"¿Qué es lo más importante para tu proyecto?",
  preparacion:"¿Qué tan avanzado tienes tu proyecto o material de apoyo?",
  presupuesto:"Presupuesto o inversión de referencia (12 meses para nuevos rangos digitales)"
};
const etiquetas={
  dar_a_conocer:"Que más personas conozcan mi negocio o proyecto.",
  mejorar_experiencia:"Ofrecer una experiencia más fluida y profesional a mis clientes.",
  celebracion:"Preparar algo único y memorable para una celebración o evento.",
  automatizar:"Automatizar tareas repetitivas o gestión de pedidos y citas.",
  destacar:"Destacar frente a la competencia con algo original y diferente.",
  comenzando:"Estoy comenzando algo nuevo desde cero.",
  negocio_existente:"Ya tengo un negocio en marcha y quiero mejorarlo.",
  organizando_evento:"Estoy organizando un evento especial.",
  regalo_detalle:"Quiero preparar un regalo o detalle personalizado.",
  explorando:"Estoy explorando posibilidades para el futuro.",
  en_persona:"Principalmente en persona: en un local, oficina, stand o cara a cara.",
  internet:"A través de internet: redes sociales, WhatsApp o mensajería digital.",
  reservas_pedidos:"Recibo reservas, pedidos o citas recurrentes.",
  fecha_fija:"Voy a reunir a varias personas o entregar detalles en una fecha fija.",
  sin_canal:"Todavía no tengo un canal definido.",
  recuerdo_fisico:"Que recuerden mi marca o mi evento por un buen detalle físico.",
  acceso_inmediato:"Que accedan a mi menú, catálogo o información al instante.",
  menos_mensajes:"Que puedan solicitar o comprar algo sin depender de tantos mensajes manuales.",
  producto_personalizado:"Ofrecer un producto físico original y personalizado.",
  organizar_trabajo:"Organizar mejor mi tiempo, atención o flujo de trabajo.",
  logo_diseno:"Ya tengo mi logo, diseño o idea bien clara.",
  fotos_referencias:"Tengo fotografías, referencias o un manual básico.",
  presencia_existente:"Ya tengo presencia (redes/web), pero quiero dar el siguiente salto.",
  ayuda_desde_cero:"Necesito que me ayuden a aterrizar la solución desde cero.",
  cotizando:"Por ahora solo estoy cotizando y viendo posibilidades.",
  pieza_funcional:"Crear, reemplazar o mejorar una pieza física que cumpla una función.",
  figura_detallada:"Crear una figura u objeto con muchos detalles visuales.",
  pieza_reproducir:"Tengo una pieza que necesito reproducir o adaptar.",
  modelo_fabricar:"Tengo un modelo o diseño que quiero convertir en un objeto físico.",
  uso_funcional:"Se instalará, ensamblará o utilizará como parte de otro objeto.",
  pieza_visual:"Será una figura, maqueta o pieza para exhibir y apreciar de cerca.",
  ajuste_resistencia:"Que una pieza tenga las medidas, el ajuste o la resistencia adecuados.",
  detalle_acabado:"Que una figura o pieza tenga detalles finos y buen acabado visual.",
  medidas_modelo:"Tengo medidas, planos, una pieza de muestra o un archivo 3D.",
  referencia_figura:"Tengo una imagen, escultura o referencia de la figura que quiero."
};
async function req(path,options={}){const r=await fetch(path,{...options,credentials:"same-origin",headers:{...(options.body?{"Content-Type":"application/json"}:{}),...options.headers}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`Error ${r.status}`);return d;}
function elem(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
const seccionesPanel=()=>Array.from(panel.querySelectorAll(".admin-seccion"));
function abrirSeccion(id,desplazar=true){const titulo=document.getElementById(id),detalle=titulo?.closest(".admin-seccion");if(!detalle)return;detalle.open=true;if(desplazar)titulo.scrollIntoView({block:"start"});}
globalThis.LP_ADMIN_NAVEGACION=Object.freeze({abrirSeccion});
panel.querySelectorAll(".admin-nav a").forEach(a=>a.addEventListener("click",e=>{e.preventDefault();const id=a.hash.slice(1);history.replaceState(null,"",a.hash);abrirSeccion(id);}));
document.querySelector("#expandir-secciones").addEventListener("click",()=>seccionesPanel().forEach(d=>d.open=true));
document.querySelector("#colapsar-secciones").addEventListener("click",()=>seccionesPanel().forEach(d=>d.open=false));
panel.querySelectorAll("[data-expandir-registros],[data-colapsar-registros]").forEach(b=>b.addEventListener("click",()=>{const id=b.dataset.expandirRegistros||b.dataset.colapsarRegistros;document.getElementById(id)?.querySelectorAll(".registro-desplegable").forEach(d=>d.open=!!b.dataset.expandirRegistros);}));
function abiertosRegistros(lista){return new Set(Array.from(lista.querySelectorAll(".registro-desplegable[open]"),d=>d.dataset.registro));}
function plegarRegistro(art,id,titulo,subtitulo,estado,abierto,controles=[]){
 const detalle=elem("details","registro-desplegable");detalle.dataset.registro=id;detalle.open=abierto;
 const resumen=elem("summary","registro-resumen"),identidad=elem("span","registro-identidad");
 identidad.append(elem("strong",null,titulo),elem("span","registro-subtitulo",subtitulo));
 resumen.append(identidad,elem("span","registro-estado",estado));
 const cuerpo=elem("div","registro-cuerpo");
 for(const nodo of Array.from(art.childNodes))if(!controles.includes(nodo))cuerpo.append(nodo);
 detalle.append(resumen,cuerpo);art.prepend(detalle);
 if(controles.length){const barra=elem("div","registro-controles");barra.append(...controles);art.append(barra);}
}
function descargar(ficha){const blob=new Blob([JSON.stringify(ficha,null,2)+"\n"],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=`ficha-quiz-${ficha.id_diagnostico}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
const descripciones={
  R1:"Recuerdos, regalos o piezas promocionales personalizados en impresión 3D.",
  R2:"Soportes impresos en 3D para conectar la atención presencial con información digital mediante QR y NFC opcional.",
  R3:"Una página, menú o catálogo para presentar productos y servicios desde el teléfono.",
  R4:"Funciones de pedidos, reservaciones o administración adaptadas a las necesidades del negocio.",
  R5:"Una solución que combina artículos o soportes físicos personalizados con servicios digitales.",
  R6:"Piezas a medida, repuestos y prototipos sujetos a revisión de dimensiones, materiales y viabilidad.",
  R7:"Miniaturas, figuras y modelos detallados sujetos a evaluación de material, acabado y uso."
};
function pintar(items){
  lista.replaceChildren();
  if(!items.length){lista.append(elem("p",null,"No hay diagnósticos con este filtro."));return;}
  for(const item of items){
    const f=item.ficha||{}, rec=f.recomendacion||{}, art=elem("article","registro");
    const heading=elem("h2",null,`Diagnóstico ${item.id.slice(0,8)}`);
    const meta=elem("div","metadatos",`${new Date(item.fecha).toLocaleString("es-MX")} · ${item.estado} · ${item.id}`);
    const resultado=elem("section","resultado-diagnostico");
    resultado.append(elem("p","resultado-etiqueta","RECOMENDACIÓN MOSTRADA AL VISITANTE"));
    resultado.append(elem("h3",null,rec.titulo||"Recomendación no disponible"));
    if(descripciones[rec.id])resultado.append(elem("p",null,descripciones[rec.id]));
    if(rec.complemento_sugerido){
      resultado.append(elem("p","resultado-etiqueta","COMPLEMENTO SUGERIDO"));
      resultado.append(elem("p",null,rec.complemento_sugerido));
    }
    const details=elem("details"),summary=elem("summary",null,"Ver respuestas"),dl=elem("dl");
    if(f.version_esquema === "4.0") {
      dl.append(elem("dt",null,"Nota"),elem("dd",null,"Las preguntas 3 y 4 se actualizaron para incluir fabricación y piezas físicas."));
    }
    for(const [campo,label] of Object.entries(nombres)){
      dl.append(elem("dt",null,label),elem("dd",null,etiquetasPresupuesto[f.respuestas?.[campo]]||etiquetas[f.respuestas?.[campo]]||f.respuestas?.[campo]||"Sin respuesta"));
    }
    details.append(summary,dl);
    const acciones=elem("div","acciones"),boton=elem("button",null,"Descargar ficha JSON"),marcar=elem("button","secundario",item.estado==="nuevo"?"Marcar revisado":"Marcar nuevo");
    boton.type="button";marcar.type="button";
    boton.addEventListener("click",()=>descargar(f));
    marcar.addEventListener("click",async()=>{marcar.disabled=true;try{await req(`/api/admin/diagnosticos/${encodeURIComponent(item.id)}`,{method:"PATCH",body:JSON.stringify({estado:item.estado==="nuevo"?"revisado":"nuevo"})});await cargar();}catch(e){estado.textContent=e.message;}finally{marcar.disabled=false;}});
    const borrar=elem("button","secundario","Eliminar");borrar.type="button";
    borrar.addEventListener("click",async()=>{if(!confirm("¿Eliminar definitivamente este diagnóstico? Esta acción no se puede deshacer."))return;borrar.disabled=true;try{await req(`/api/admin/diagnosticos/${encodeURIComponent(item.id)}`,{method:"DELETE"});await cargar();}catch(e){estado.textContent=e.message;}finally{borrar.disabled=false;}});
    acciones.append(boton,marcar,borrar);
    art.append(heading,meta,resultado,details,acciones);lista.append(art);
  }
}
function filtrarBusqueda(){const termino=busqueda.value.trim().toLowerCase();const encontrados=termino?ultimosItems.filter(x=>x.id.toLowerCase().includes(termino)):ultimosItems;pintar(encontrados);estado.textContent=`${encontrados.length} diagnósticos mostrados de ${ultimosItems.length} cargados (máximo 100 recientes, o búsqueda exacta por referencia).`; }
async function cargar(){estado.textContent="Cargando diagnósticos...";try{const params=filtro.value?`?estado=${encodeURIComponent(filtro.value)}`:"";const query=busqueda.value.trim();
    const ref=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(query) ? query : "";
    const sep=params?"&":"?";
    const d=await req(`/api/admin/diagnosticos${params}${ref?sep+"referencia="+encodeURIComponent(ref):""}`);
    ultimosItems=d.items;filtrarBusqueda();}catch(e){estado.textContent=e.message;if(e.message==="Acceso restringido"){panel.hidden=true;acceso.hidden=false;}}}
acceso.addEventListener("submit",async(e)=>{
 e.preventDefault();const boton=acceso.querySelector('button[type="submit"]');if(boton.disabled)return;
 boton.disabled=true;error.textContent="";
 try{
  const config=await req("/api/admin/login/config");
  const headers={};
  if(config.turnstile){error.textContent="Comprobando seguridad…";headers["X-Turnstile-Token"]=await globalThis.LP_Turnstile.token("admin_login",boton);}
  await req("/api/admin/login",{method:"POST",headers,body:JSON.stringify({password:document.querySelector("#password").value})});
  document.querySelector("#password").value="";error.textContent="";acceso.hidden=true;panel.hidden=false;abrirSeccion(location.hash.slice(1),false);
  await Promise.all([cargar(),cargarPropuestas(),cargarProyectos(),globalThis.LP_ADMIN_ALERTAS?.cargar()]);
 }catch(e){error.textContent=e.message;}finally{boton.disabled=false;}
});
document.querySelector("#actualizar").addEventListener("click",cargar);filtro.addEventListener("change",cargar);let ultimaConsulta="";
busqueda.addEventListener("input",()=>{
  const texto=busqueda.value.trim();
  const esReferencia=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(texto);
  if(esReferencia || (ultimaConsulta && !esReferencia)) { ultimaConsulta=esReferencia?texto:""; cargar(); }
  else filtrarBusqueda();
});document.querySelector("#salir").addEventListener("click",async()=>{await req("/api/admin/salir",{method:"POST",body:"{}"}).catch(()=>{});panel.hidden=true;acceso.hidden=false;lista.replaceChildren();listaPropuestas.replaceChildren();listaProyectos.replaceChildren();resumenProyectos.replaceChildren();resultadosProyectos.textContent="";buscarProyectos.value="";filtroProyectos.value="";propuestasVisibles=[];actualizarSeleccion();});
req("/api/admin/sesion").then(()=>{acceso.hidden=true;panel.hidden=false;abrirSeccion(location.hash.slice(1),false);return Promise.all([cargar(),cargarPropuestas(),cargarProyectos(),globalThis.LP_ADMIN_ALERTAS?.cargar()]);}).catch(()=>{});

const listaProyectos=document.querySelector("#lista-proyectos"),estadoProyectos=document.querySelector("#estado-proyectos");
const estadosProyecto={preparacion:"Preparación",recabando_materiales:"Recabando materiales",en_desarrollo:"En desarrollo",en_revision:"En revisión",finalizado:"Finalizado",cancelado:"Cancelado"};
const estadosMaterial={pendiente:"Pendiente",recibido:"Recibido · por revisar",requiere_correccion:"Requiere corrección",aprobado:"Aprobado"};
function controlRevisionMaterial(p,a,tipo){
 const fila=elem("div","revision-material"),label=elem("label",null,"Estado de revisión "),sel=elem("select"),msg=elem("span","metadatos","");
 msg.setAttribute("role","status");
 for(const [k,v] of Object.entries(estadosMaterial)){if(k==="pendiente"&&a.estado!=="pendiente")continue;const o=elem("option",null,v);o.value=k;sel.append(o);}
 sel.value=a.estado||"recibido";
 sel.disabled=["finalizado","cancelado"].includes(p.estado);
 label.append(sel);fila.append(label,msg);
 sel.addEventListener("change",async()=>{
   if(sel.value==="pendiente"){sel.value=a.estado;return;}
   sel.disabled=true;msg.textContent="Guardando…";
   const clave=tipo==="secciones"?a.clave:a.id;
   try{
     const d=await req("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/materiales/"+tipo+"/"+encodeURIComponent(clave),{method:"PATCH",body:JSON.stringify({estado:sel.value,...(tipo==="secciones"?{version:a.fecha_actualizacion}:{})})});
     a.estado=d.estado;if(tipo==="secciones")a.fecha_actualizacion=d.fecha_actualizacion;
     msg.textContent="Estado guardado.";
   }catch(e){sel.value=a.estado;msg.textContent=e.message;}finally{sel.disabled=false;}
 });
 return fila;
}
const buscarProyectos=document.querySelector("#buscar-proyectos"),filtroProyectos=document.querySelector("#filtro-proyectos"),resumenProyectos=document.querySelector("#resumen-proyectos"),resultadosProyectos=document.querySelector("#proyectos-resultados");
const normalizarProyecto=v=>String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
function filtrarProyectos(){
 const q=normalizarProyecto(buscarProyectos.value.trim()),estado=filtroProyectos.value,tarjetas=[...listaProyectos.querySelectorAll(".proyecto-ficha")];let visibles=0;
 for(const art of tarjetas){const coincide=(!q||art.dataset.busqueda.includes(q))&&(!estado||(estado==="activos"?!["cancelado","finalizado"].includes(art.dataset.estado):art.dataset.estado===estado));art.hidden=!coincide;if(coincide)visibles++;}
 resultadosProyectos.textContent=visibles+" de "+tarjetas.length+" proyectos visibles"+(tarjetas.length&&!visibles?" · Sin coincidencias":"");
 for(const b of resumenProyectos.querySelectorAll("button"))b.setAttribute("aria-pressed",String(b.dataset.filtro===estado));
}
buscarProyectos.addEventListener("input",filtrarProyectos);filtroProyectos.addEventListener("change",filtrarProyectos);
function pintarResumenProyectos(items){
 resumenProyectos.replaceChildren();
 for(const [f,t,n] of [["","Total",items.length],["activos","Activos",items.filter(p=>!["finalizado","cancelado"].includes(p.estado)).length],["en_revision","En revisión",items.filter(p=>p.estado==="en_revision").length],["finalizado","Finalizados",items.filter(p=>p.estado==="finalizado").length]]){
  const b=elem("button","proyectos-metrica");b.type="button";b.dataset.filtro=f;b.append(elem("strong",null,String(n)),elem("span",null,t));b.addEventListener("click",()=>{filtroProyectos.value=f;filtrarProyectos();});resumenProyectos.append(b);
 }
}
async function cargarProyectos(){
 estadoProyectos.textContent="Cargando proyectos…";
 try {
  const d=await req("/api/admin/proyectos");
  const abiertos=abiertosRegistros(listaProyectos);listaProyectos.replaceChildren();
  estadoProyectos.textContent=`${d.items.length} proyecto(s) registrado(s). Los enlaces privados se generan individualmente.`;
  pintarResumenProyectos(d.items);
  if(!d.items.length){listaProyectos.append(elem("p",null,"Todavía no hay proyectos aceptados."));filtrarProyectos();return;}
  for(const p of d.items){
   const art=elem("article","registro proyecto-ficha");art.dataset.estado=p.estado;art.dataset.busqueda=normalizarProyecto([p.folio,p.nombre,p.proyecto].join(" "));
   const cabeceraProyecto=elem("div","proyecto-cabecera");const identidadProyecto=elem("div");identidadProyecto.append(elem("h3",null,p.nombre||"Cliente"),elem("p","metadatos",`Folio: ${p.folio} · Actualizado: ${new Date(p.fecha_actualizacion).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})}`));cabeceraProyecto.append(identidadProyecto);art.append(cabeceraProyecto);
   const label=elem("label",null,"Estado del proyecto "),select=elem("select");
   select.setAttribute("aria-label",`Estado del proyecto ${p.folio}`);
   for(const [id,nombre] of Object.entries(estadosProyecto)){const option=elem("option",null,nombre);option.value=id;select.append(option);}
   select.value=p.estado;select.addEventListener("change",async()=>{select.disabled=true;try{await req(`/api/admin/proyectos/${encodeURIComponent(p.id)}`,{method:"PATCH",body:JSON.stringify({estado:select.value})});await cargarProyectos();}catch(e){estadoProyectos.textContent=e.message;select.value=p.estado;}finally{select.disabled=false;}});
   label.className="proyecto-estado-control";label.append(select);cabeceraProyecto.append(label);
   const accesoDetalle=elem("details","proyecto-bloque acceso-proyecto"),accesoResumen=elem("summary",null,"Acceso privado del cliente");const acceso=elem("section","materiales-administracion proyecto-bloque-cuerpo");accesoDetalle.append(accesoResumen,acceso);
   const estadoAcceso=elem("p","metadatos"),detalleAcceso=elem("p","metadatos");
   const generar=elem("button","secundario"),revocar=elem("button","secundario","Revocar enlace");
   const prorrogar=elem("button","secundario","Prorrogar enlace"),dias=elem("select");
   dias.setAttribute("aria-label","Días adicionales de acceso");
   for(const n of [30,60,90]){const o=elem("option",null,n+" días adicionales");o.value=String(n);dias.append(o);}
   dias.value="90";
   generar.type=revocar.type=prorrogar.type="button";
   let ocupado=false;
   function pintarAcceso(){
     const cerrado=["finalizado","cancelado"].includes(p.estado);
     const vigente=!!p.tiene_acceso&&!p.acceso_revocado&&Date.parse(p.acceso_expira)>Date.now();
     const nombre=p.estado==="cancelado"?"Bloqueado por cancelación":p.acceso_revocado?"Revocado":!p.tiene_acceso?"Sin generar":vigente?"Activo":"Vencido";
     accesoResumen.textContent="Acceso privado del cliente · "+nombre;
     estadoAcceso.textContent="Acceso privado: "+nombre+(p.estado==="finalizado"&&vigente?" · solo consulta":"");
     detalleAcceso.textContent=p.acceso_expira?"Vencimiento: "+new Date(p.acceso_expira).toLocaleString("es-MX"):"No hay fecha de vencimiento.";
     generar.textContent=p.tiene_acceso&&!p.acceso_revocado?"Regenerar enlace (invalida el anterior)":"Generar enlace privado";
     generar.disabled=ocupado||cerrado;revocar.disabled=ocupado||!p.tiene_acceso||!!p.acceso_revocado;
     prorrogar.disabled=dias.disabled=ocupado||cerrado||!vigente;
   }
   const normales=elem("div","acciones");normales.append(dias,prorrogar);
   const seguridad=elem("details"),resumen=elem("summary",null,"Administrar enlace: generar, sustituir o revocar");
   const sensibles=elem("div","acciones");sensibles.append(generar,revocar);
   seguridad.append(resumen,elem("p","metadatos","No sustituyas el enlace si el cliente ya lo tiene. Prorrogar conserva el mismo enlace. Revocar impide el acceso."),sensibles);
   if(!p.tiene_acceso||p.acceso_revocado)seguridad.open=true;
   acceso.append(estadoAcceso,detalleAcceso,normales,seguridad);pintarAcceso();
   const rutaAcceso="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/acceso";
   generar.addEventListener("click",async()=>{
     const sustituir=!!p.tiene_acceso&&!p.acceso_revocado;
     if(!confirm(sustituir?"El enlace anterior dejará de funcionar. ¿Continuar?":"¿Generar enlace privado por 90 días?"))return;
     if(sustituir&&prompt("Para invalidar el enlace anterior, escribe REGENERAR")!=="REGENERAR")return;
     ocupado=true;pintarAcceso();
     try{
       const resultado=await req(rutaAcceso,{method:"POST",body:JSON.stringify(sustituir?{confirmacion:"REGENERAR"}:{})});
       p.tiene_acceso=1;p.acceso_revocado=0;p.acceso_expira=resultado.expira;
       const caja=elem("div","enlace-cliente");
       caja.append(elem("p",null,"Copia y conserva este enlace privado. Solo se muestra al generarlo."));
       const url=elem("input");url.type="text";url.readOnly=true;url.value=resultado.url;url.setAttribute("aria-label","Enlace privado del cliente");
       const copiar=elem("button","secundario","Copiar enlace");copiar.type="button";
       copiar.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(resultado.url);copiar.textContent="Copiado";}catch(e){url.focus();url.select();copiar.textContent="Seleccionado: usa Ctrl+C";}});
       caja.append(url,copiar);acceso.querySelector(".enlace-cliente")?.remove();acceso.append(caja);
       estadoProyectos.textContent="Enlace generado. Compártelo únicamente con el cliente.";
     }catch(e){estadoProyectos.textContent=e.message;}finally{ocupado=false;pintarAcceso();}
   });
   prorrogar.addEventListener("click",async()=>{
     if(!confirm("¿Añadir "+dias.value+" días al vencimiento actual sin cambiar el enlace?"))return;
     ocupado=true;pintarAcceso();
     try{const d=await req(rutaAcceso,{method:"PATCH",body:JSON.stringify({dias:Number(dias.value)})});p.acceso_expira=d.expira;estadoProyectos.textContent="Acceso prorrogado. El mismo enlace sigue funcionando.";}
     catch(e){estadoProyectos.textContent=e.message;}finally{ocupado=false;pintarAcceso();}
   });
   revocar.addEventListener("click",async()=>{
     if(!confirm("¿Revocar el acceso del cliente al proyecto "+p.folio+"?"))return;
     if(prompt("Para impedir el acceso, escribe REVOCAR")!=="REVOCAR")return;
     ocupado=true;pintarAcceso();
     try{await req(rutaAcceso,{method:"DELETE",body:JSON.stringify({confirmacion:"REVOCAR"})});p.acceso_revocado=1;p.tiene_acceso=0;acceso.querySelector(".enlace-cliente")?.remove();estadoProyectos.textContent="Acceso revocado. El cliente ya no podrá utilizar su enlace.";}
     catch(e){estadoProyectos.textContent=e.message;}finally{ocupado=false;pintarAcceso();}
   });
   const materiales=elem("details","materiales-desplegables proyecto-bloque"), resumenMateriales=elem("summary",null,"Materiales del proyecto");
   const caja=elem("section","materiales-administracion materiales-recibidos");
   materiales.append(resumenMateriales,caja);
   let materialesCargados=false,materialesCargando=false;
   const revisar=elem("button","secundario","Actualizar materiales");
   revisar.type="button";
   async function cargarMateriales(){
     if(materialesCargando)return;
     materialesCargando=true;revisar.disabled=true;
     if(!materialesCargados)caja.replaceChildren(elem("p","metadatos","Cargando materiales…"));
     try{
       const d=await req("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/materiales");
       caja.replaceChildren();
       caja.append(revisar);
       const secciones={datos_negocio:"Datos, descripción o diseño",servicios_productos:"Productos, servicios, cantidad o medidas",horarios_contacto:"Contacto, uso o entrega",indicaciones:"Indicaciones adicionales"};
       const nota=elem("section","apartado-recibido indicaciones-editor"),filas=elem("div","indicaciones-filas");
       const colores={rojo:"Rojo · Importante / corrección",amarillo:"Amarillo · Duda / pendiente",verde:"Verde · Confirmación / correcto",azul:"Azul · Información / avance"};
       const cerrado=["finalizado","cancelado"].includes(p.estado);
       const agregar=elem("button","secundario","Agregar indicación"),guardar=elem("button",null,"Guardar indicaciones"),mensaje=elem("p","metadatos","");
       agregar.type=guardar.type="button";mensaje.setAttribute("role","status");
       let guardando=false;
       function controlesNotas(){agregar.disabled=cerrado||guardando||filas.children.length>=10;guardar.disabled=cerrado||guardando;for(const el of filas.querySelectorAll("button,textarea,select"))el.disabled=cerrado||guardando;}
       function agregarNota(item={color:"rojo",texto:""}){
        if(filas.children.length>=10)return;
        const fila=elem("div","indicacion-edicion"),labelColor=elem("label",null,"Tipo de indicación"),color=elem("select"),labelTexto=elem("label",null,"Mensaje para el cliente"),txt=elem("textarea"),quitar=elem("button","secundario","Quitar indicación");
        for(const [k,v] of Object.entries(colores)){const o=elem("option",null,v);o.value=k;color.append(o);}
        color.value=Object.hasOwn(colores,item.color)?item.color:"rojo";fila.dataset.color=color.value;color.addEventListener("change",()=>fila.dataset.color=color.value);
        txt.rows=3;txt.maxLength=2000;txt.value=item.texto||"";txt.placeholder="Escribe el mensaje...";
        labelColor.append(color);labelTexto.append(txt);quitar.type="button";quitar.addEventListener("click",()=>{if(txt.value.trim()&&!confirm("¿Quitar esta indicación? Se aplicará al guardar."))return;fila.remove();controlesNotas();});
        fila.append(labelColor,labelTexto,quitar);filas.append(fila);controlesNotas();
       }
       const previas=Array.isArray(d.indicaciones)?d.indicaciones:(d.instrucciones?[{color:"rojo",texto:d.instrucciones}]:[]);
       for(const item of previas)agregarNota(item);
       if(!previas.length&&!cerrado)agregarNota();
       agregar.addEventListener("click",()=>{agregarNota();filas.lastElementChild?.querySelector("textarea")?.focus();});
       guardar.addEventListener("click",async()=>{
        const items=Array.from(filas.children,f=>({color:f.querySelector("select").value,texto:f.querySelector("textarea").value.trim()})).filter(x=>x.texto);
        if(items.reduce((n,x)=>n+x.texto.length,0)>10000){mensaje.textContent="Máximo 10,000 caracteres en total.";return;}
        if(!items.length&&!confirm("¿Guardar sin indicaciones? Se quitarán los mensajes anteriores del portal."))return;
        guardando=true;controlesNotas();mensaje.textContent="Guardando…";
        try{const r=await req("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/materiales",{method:"PATCH",body:JSON.stringify({indicaciones:items})});filas.replaceChildren();for(const item of r.indicaciones)agregarNota(item);if(!r.indicaciones.length)agregarNota();mensaje.textContent="Indicaciones guardadas. El cliente podrá leerlas al abrir o actualizar su portal.";}
        catch(e){mensaje.textContent=e.message;}finally{guardando=false;controlesNotas();}
       });
       nota.append(elem("h4",null,"Indicaciones para el cliente"),elem("p","metadatos","Añade mensajes independientes y selecciona su color. Todos serán visibles en el portal cuando guardes."),filas,agregar,guardar,mensaje);caja.append(nota);controlesNotas();
       const pendientes=d.secciones.filter(a=>a.estado==="requiere_correccion").length+d.archivos.filter(a=>a.estado==="requiere_correccion").length;
       caja.append(elem("p","metadatos",pendientes+" material(es) requieren corrección al abrir esta revisión."));
       if(!d.secciones.length)caja.append(elem("p",null,"El cliente aún no ha entregado textos."));
       for(const a of d.secciones){
         const bloque=elem("div","apartado-recibido");
         bloque.append(elem("strong",null,secciones[a.clave]||a.clave),elem("p",null,a.contenido||"(Sin texto)"));
         bloque.append(controlRevisionMaterial(p,a,"secciones"));
         caja.append(bloque);
       }
       caja.append(elem("h4",null,"Imágenes recibidas ("+d.archivos.length+")"));
       if(!d.archivos.length)caja.append(elem("p",null,"Aún no hay imágenes."));
       for(const a of d.archivos){
         const link=elem("a","boton-enlace",a.nombre_original||"Ver imagen");
         link.href="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/archivos/"+encodeURIComponent(a.id);
         link.target="_blank";link.rel="noopener noreferrer";const bloque=elem("div","apartado-recibido");bloque.append(link,controlRevisionMaterial(p,a,"archivos"));caja.append(bloque);
       }
       materialesCargados=true;
       resumenMateriales.textContent="Materiales del proyecto · "+d.secciones.length+" apartados · "+d.archivos.length+" imágenes";
     }catch(e){estadoProyectos.textContent=e.message;if(!materialesCargados)caja.replaceChildren(elem("p","metadatos",e.message),revisar);}finally{materialesCargando=false;revisar.disabled=false;}
   }
   revisar.addEventListener("click",()=>{if(!materialesCargados||confirm("¿Actualizar materiales? Se descartarán las indicaciones que no hayas guardado."))cargarMateriales();});
   materiales.addEventListener("toggle",()=>{if(materiales.open&&!materialesCargados)cargarMateriales();});
   const atajos=elem("nav","proyecto-atajos");atajos.setAttribute("aria-label","Acciones del proyecto "+p.folio);art.append(atajos);
   globalThis.LP_ADMIN_SEGUIMIENTO?.agregar(art,p);art.append(materiales);globalThis.LP_ADMIN_ENTREGA?.agregar(art,p);art.append(accesoDetalle);
   for(const [texto,selector] of [["Seguimiento",".seguimiento-admin"],["Materiales",".materiales-desplegables"],["Entrega",".entrega-admin"],["Acceso",".acceso-proyecto"]]){const b=elem("button","secundario",texto);b.type="button";b.addEventListener("click",()=>{const d=art.querySelector(selector);if(!d)return;d.open=true;d.querySelector("summary")?.focus({preventScroll:true});d.scrollIntoView({block:"nearest"});});atajos.append(b);}
   plegarRegistro(art,p.id,p.proyecto||p.nombre,p.folio+" · "+p.nombre,estadosProyecto[p.estado]||p.estado,abiertos.has(p.id));listaProyectos.append(art);
  }
  filtrarProyectos();
 }catch(e){estadoProyectos.textContent="Proyectos no disponibles: "+e.message+". Comprueba que la migración 0004 esté aplicada a D1.";}
}
document.querySelector("#actualizar-proyectos").addEventListener("click",cargarProyectos);
const listaPropuestas=document.querySelector("#lista-propuestas"),estadoPropuestas=document.querySelector("#estado-propuestas"),filtroPropuestas=document.querySelector("#filtro-propuestas"),buscarPropuestas=document.querySelector("#buscar-propuestas");
const etiquetasPresupuesto={...{"quiz_total_hasta_500":"Hasta $500 MXN","quiz_total_500_1500":"De $500 a $1,500 MXN","quiz_total_1500_3500":"De $1,500 a $3,500 MXN","quiz_total_3500_7000":"De $3,500 a $7,000 MXN","quiz_total_7000_10000":"De $7,000 a $10,000 MXN","quiz_total_10000_15000":"De $10,000 a $15,000 MXN","quiz_total_mas_15000":"Más de $15,000 MXN"},...{"quiz_web_p1":"Presencia digital — implementación desde $750 MXN · $149 MXN al mes + IVA","quiz_web_p2":"Negocio interactivo — implementación desde $1,500 MXN · $249 MXN al mes + IVA","quiz_web_p3":"Gestión comercial — implementación desde $2,500 MXN · $349 MXN al mes + IVA","quiz_web_p4":"Gestión profesional — implementación desde $3,500 MXN · $499 MXN al mes + IVA","quiz_web_medida":"Necesito una solución digital a medida; quiero conocer los costos","quiz_web_combinado":"Proyecto combinado: cotizar fabricación 3D y servicio digital por separado"},menos_500:"Menos de $500",500_1500:"$500 a $1,500",1500_3000:"$1,500 a $3,000",3000_6000:"$3,000 a $6,000",mas_6000:"Más de $6,000",1500_3500:"$1,500 a $3,500",3500_8000:"$3,500 a $8,000",8000_15000:"$8,000 a $15,000",mas_15000:"Más de $15,000",sin_definir:"Necesita orientación",prefiero_no_indicar:"Prefiere no indicarlo",...{"web_precios_publicados":"Los precios publicados se ajustan a mi presupuesto","web_ajustar_alcance":"Quiero ajustar el alcance a mi presupuesto","web_presupuesto_propio":"Tengo otro presupuesto (lo indicaré en los detalles)"}};
const tiposAcademicos={proyecto_escolar:"Proyecto escolar o universitario",prototipo:"Prototipo o pieza funcional",maqueta:"Maqueta o modelo a escala",investigacion:"Investigación o tesis",otro:"Otro proyecto académico"};
const etiquetasContexto={negocio:"Negocio",evento:"Evento",personal:"Personal",academico:"Escolar / Académico"};
const nombresServicio={llaveros:"Llaveros",fdm_medida:"Impresión FDM",resina:"Resina",soporte_qr:"Soportes QR"};
const estadosPropuestas={nueva:"Nueva",en_revision:"En revisión",contactado:"Contactado",cotizado:"Cotizado",cerrado:"Cerrado"};
let solicitudBusquedaTimer;
let propuestasVisibles=[];
function celdaCSV(valor) {
 const texto=String(valor??"");
 // Evitar que Excel/LibreOffice interprete valores como fórmulas.
 const seguro=/^[\s]*[=+@-]/.test(texto) ? "'"+texto : texto;
 return '"'+seguro.replace(/"/g,'""')+'"';
}
function exportarPropuestasCSV(){
 if(!propuestasVisibles.length){estadoPropuestas.textContent="No hay resultados visibles para exportar.";return;}
 const cabeceras=["Folio","Fecha","Estado","Nombre","Proyecto","WhatsApp","Comentario","Recomendación","Complemento","Origen","Tipo de página","Paquete de interés","Giro","Funciones","Complementos","Servicio","Presupuesto","Detalles específicos","Tipo de solicitud","Trabajo académico","Institución educativa","Descuento académico sugerido"];
 const filas=propuestasVisibles.map(x=>[x.folio,x.fecha,x.estado,x.nombre,x.proyecto,x.telefono,x.comentario,x.ficha?.recomendacion?.titulo,x.ficha?.recomendacion?.complemento_sugerido,x.ficha?.origen||"cuestionario",x.ficha?.tipo_pagina||"",x.ficha?.paquete||"",x.ficha?.giro||"",(x.ficha?.funciones||[]).join("; "),(x.ficha?.complementos||[]).join("; "),x.ficha?.titulo_servicio||x.ficha?.tipo_pagina||x.ficha?.recomendacion?.titulo||"",etiquetasPresupuesto[x.ficha?.presupuesto||x.ficha?.respuestas?.presupuesto]||"",JSON.stringify(x.ficha?.campos||{}),etiquetasContexto[x.ficha?.contexto]||"",tiposAcademicos[x.ficha?.tipo_trabajo_academico]||"",x.ficha?.institucion_academica||"",x.ficha?.contexto==="academico"?"5% sujeto a verificación, no aplicado":""]);
 const csv="\uFEFF"+[cabeceras,...filas].map(f=>f.map(celdaCSV).join(",")).join("\r\n")+"\r\n";
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="solicitudes-lapazimpresion3d.csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
}

// Control comercial: no envía propuestas ni realiza cargos.
const paquetesEconomicos={"solo_fisico":"Solo productos físicos (pago único)","presencia-digital":"Presencia digital","negocio-interactivo":"Negocio interactivo","gestion-comercial":"Gestión comercial","gestion-profesional":"Gestión profesional","a-medida":"Proyecto a medida"};
const dineroEconomico=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n/100);
function centavosEconomicos(v){
 if(!/^\d{1,7}(?:\.\d{1,2})?$/.test(v))throw Error("Escribe importes positivos con hasta dos decimales, sin comas.");
 const [a,b=""]=v.split(".");return Number(a)*100+Number(b.padEnd(2,"0"));
}
function fechaLocalEconomica(){const d=new Date();return d.getFullYear()+"-"+String(d.getMonth()+1).padStart(2,"0")+"-"+String(d.getDate()).padStart(2,"0");}
function agregarEconomica(art,x){
 const abrir=elem("button","secundario","Propuesta económica y pagos");abrir.type="button";
 const panel=elem("section","economica-panel");panel.hidden=true;
 const ruta="/api/admin/propuestas/"+encodeURIComponent(x.id)+"/economica";
 let cargando=false;
 async function cargar(){
  if(cargando)return;cargando=true;abrir.disabled=true;panel.hidden=false;panel.replaceChildren(elem("p","metadatos","Cargando propuesta…"));
  try{const d=await req(ruta);pintar(d);}catch(e){panel.replaceChildren(elem("p",null,"No se pudo cargar el control económico: "+e.message+". Comprueba la migración 0005 en D1."));}
  finally{cargando=false;abrir.disabled=false;}
 }
 function pintar(d){
  panel.replaceChildren(elem("h3",null,"Propuesta económica · "+x.folio));
  const q=d.propuesta,aceptada=!!q?.fecha_aceptacion;
  panel.append(elem("p","metadatos",aceptada?"Aceptada el "+q.fecha_aceptacion+" · importes bloqueados":"Borrador · no enviado al cliente"));
  const form=elem("form","economica-form");
  function campo(etiqueta,tag="input"){const l=elem("label",null,etiqueta),v=elem(tag);l.append(v);form.append(l);return v;}
  const paquete=campo("Paquete acordado","select");
  for(const [k,v] of Object.entries(paquetesEconomicos)){const o=elem("option",null,v);o.value=k;paquete.append(o);}
  const interes={"Presencia digital":"presencia-digital","Negocio interactivo":"negocio-interactivo","Gestión comercial":"gestion-comercial","Gestión profesional":"gestion-profesional"};
  paquete.value=q?.paquete||(x.ficha?.tipo_documento==="solicitud_web"?(interes[x.ficha.paquete]||"a-medida"):x.ficha?.tipo_documento==="solicitud_servicio"?"solo_fisico":"a-medida");
  const alcance=campo("Alcance y funciones acordadas","textarea");alcance.rows=5;alcance.maxLength=4000;alcance.required=true;
  alcance.value=q?.alcance||"";
  const importes={};for(const [k,t] of [["implementacion","Implementación web"],["fabricacion","Fabricación / productos físicos"],["extras","Extras de pago único"],["mensualidad","Mensualidad"]]){
    const v=campo(t+" (MXN antes de IVA)");v.type="number";v.min="0";v.max="1000000";v.step="0.01";v.required=true;v.value=((q?.[k]||0)/100).toFixed(2);importes[k]=v;
  }
  const resumen=elem("p","economica-total");
  function actualizar(){
    const fisico=paquete.value==="solo_fisico";
    for(const k of ["implementacion","mensualidad"]){if(fisico&&!aceptada)importes[k].value="0.00";importes[k].disabled=fisico||aceptada;}
    try{const n=Object.fromEntries(Object.entries(importes).map(([k,v])=>[k,centavosEconomicos(v.value)]));const subtotal=n.implementacion+n.fabricacion+n.extras,iva=Math.floor((subtotal*16+50)/100),m=n.mensualidad+Math.floor((n.mensualidad*16+50)/100);resumen.textContent="Subtotal inicial: "+dineroEconomico(subtotal)+" · IVA 16%: "+dineroEconomico(iva)+" · Total inicial: "+dineroEconomico(subtotal+iva)+" · Mensualidad con IVA: "+dineroEconomico(m);}catch{resumen.textContent="Completa los importes para calcular el total.";}
  }
  form.append(resumen,elem("p","metadatos","Sin cobro automático. La mensualidad se informa por separado; los pagos registrados aquí corresponden únicamente al total inicial. IVA general del 16%."));
  const msg=elem("p","metadatos","");msg.setAttribute("role","status");
  if(!aceptada){
    const guardar=elem("button",null,"Guardar borrador");guardar.type="submit";form.append(guardar,msg);
    form.addEventListener("submit",async e=>{e.preventDefault();guardar.disabled=true;try{const payload={paquete:paquete.value,alcance:alcance.value,version:q?.version||0,...Object.fromEntries(Object.entries(importes).map(([k,v])=>[k,centavosEconomicos(v.value)]))};await req(ruta,{method:"PUT",body:JSON.stringify(payload)});await cargar();}catch(e){msg.textContent=e.message;guardar.disabled=false;}});
    paquete.addEventListener("change",actualizar);form.addEventListener("input",actualizar);
  }else{paquete.disabled=alcance.readOnly=true;for(const v of Object.values(importes))v.readOnly=true;}
  actualizar();panel.append(form);
  if(q){
    const imprimir=elem("button","secundario","Ver cotización / guardar PDF");imprimir.type="button";
    const notaPDF=elem("p","metadatos","El documento utiliza únicamente la última versión guardada. Guarda tus cambios antes de imprimir. No se envía automáticamente.");
    const avisoPDF=elem("p","metadatos","");avisoPDF.setAttribute("role","status");
    imprimir.addEventListener("click",async()=>{
      if(!globalThis.LP_COTIZACION_DOCUMENTO){avisoPDF.textContent="No se cargó el módulo de documentos. Actualiza el panel.";return;}
      const vista=window.open("","_blank");if(!vista){avisoPDF.textContent="Permite ventanas emergentes para abrir la cotización.";return;}
      vista.opener=null;vista.document.title="Preparando cotización";vista.document.body.textContent="Consultando la versión guardada…";imprimir.disabled=true;avisoPDF.textContent="";
      try{const actual=await req(ruta);if(vista.closed)return;const m=LP_COTIZACION_DOCUMENTO.modelo(x,actual);LP_COTIZACION_DOCUMENTO.pintar(vista.document,m,location.origin,{imprimir:()=>vista.print(),cerrar:()=>vista.close()});}
      catch(e){if(!vista.closed)vista.close();avisoPDF.textContent=e.message;}finally{imprimir.disabled=false;}
    });panel.append(imprimir,notaPDF,avisoPDF);
  }
  if(q&&!aceptada){
    const f=elem("div","economica-aceptar"),l=elem("label",null,"Fecha en que el cliente aceptó la propuesta"),fecha=elem("input");fecha.type="date";fecha.value=fechaLocalEconomica();fecha.max=fechaLocalEconomica();l.append(fecha);
    const btn=elem("button","secundario","Registrar aceptación");btn.type="button";
    const estado=elem("p","metadatos","");estado.setAttribute("role","status");
    btn.addEventListener("click",async()=>{if(!fecha.value||!fecha.checkValidity())return;if(!confirm("¿Confirmas que el cliente aceptó el último borrador guardado? Los importes quedarán bloqueados. Los cambios sin guardar no se incluyen."))return;btn.disabled=true;try{await req(ruta+"/aceptar",{method:"POST",body:JSON.stringify({fecha:fecha.value,version:q.version})});await cargarPropuestas();}catch(e){estado.textContent=e.message;btn.disabled=false;}});
    f.append(l,btn,estado);panel.append(f);
  }
  if(aceptada){
    const saldos=elem("dl","economica-saldos");for(const [t,n] of [["Total inicial con IVA",q.total_inicial],["Pagado",d.pagado],["Saldo pendiente",d.saldo],["Mensualidad con IVA",q.total_mensual]])saldos.append(elem("dt",null,t),elem("dd",null,dineroEconomico(n)));panel.append(saldos,elem("h4",null,"Pagos recibidos"));
    if(!d.pagos.length)panel.append(elem("p","metadatos","Aún no hay pagos registrados."));
    for(const p of d.pagos)panel.append(elem("p","pago-economico",p.fecha+" · "+dineroEconomico(p.importe)+" · "+p.metodo+(p.referencia?" · "+p.referencia:"")));
    if(d.saldo>0){
      const pf=elem("form","economica-form"),pl=elem("label",null,"Importe recibido (MXN, IVA incluido)"),pi=elem("input");pi.type="number";pi.min=".01";pi.step=".01";pi.max=(d.saldo/100).toFixed(2);pi.required=true;pl.append(pi);
      const fl=elem("label",null,"Fecha del pago"),fi=elem("input");fi.type="date";fi.required=true;fi.value=fechaLocalEconomica();fi.max=fechaLocalEconomica();fl.append(fi);
      const ml=elem("label",null,"Método"),mi=elem("select");for(const [k,t] of [["transferencia","Transferencia"],["efectivo","Efectivo"],["otro","Otro"]]){const o=elem("option",null,t);o.value=k;mi.append(o);}ml.append(mi);
      const rl=elem("label",null,"Referencia o nota (opcional)"),ri=elem("input");ri.maxLength=160;rl.append(ri);
      const pb=elem("button",null,"Registrar pago recibido"),pm=elem("p","metadatos","");pb.type="submit";pm.setAttribute("role","status");pf.append(pl,fl,ml,rl,pb,pm);
      let intento=null;
      pf.addEventListener("input",()=>{intento=null;});
      pf.addEventListener("submit",async e=>{e.preventDefault();try{if(!intento){if(!confirm("¿Registrar este pago ya recibido? No se realizará ningún cargo. Revisa el importe antes de confirmar."))return;intento={id:crypto.randomUUID(),importe:centavosEconomicos(pi.value),fecha:fi.value,metodo:mi.value,referencia:ri.value};}pb.disabled=true;await req(ruta+"/pagos",{method:"POST",body:JSON.stringify(intento)});await cargar();}catch(e){pm.textContent=e.message;pb.disabled=false;}});
      panel.append(pf);
    }
    panel.append(elem("p","metadatos","Registro interno de pagos iniciales; no sustituye CFDI ni conciliación bancaria. No permite eliminar pagos desde esta versión."));
  }
 }
 abrir.addEventListener("click",()=>{if(!panel.hidden){panel.hidden=true;return;}cargar();});
 art.append(abrir,panel);
}
const seleccionarVisibles=document.querySelector("#seleccionar-propuestas"),borrarSeleccion=document.querySelector("#borrar-seleccion"),borrarTodas=document.querySelector("#borrar-todas"),estadoBorrado=document.querySelector("#estado-borrado");
const controlesBorrado=Boolean(seleccionarVisibles&&borrarSeleccion&&borrarTodas&&estadoBorrado);
let borrando=false;
function casillasPropuestas(){return Array.from(listaPropuestas.querySelectorAll("input[data-propuesta-id]"));}
function actualizarSeleccion(){
 if(!controlesBorrado)return;
 const cajas=casillasPropuestas().filter(c=>c.dataset.protegida!=="1"),n=cajas.filter(c=>c.checked).length;
 for(const c of casillasPropuestas())c.disabled=borrando||c.dataset.protegida==="1";
 for(const c of listaPropuestas.querySelectorAll("[data-candado]"))c.disabled=borrando;
 seleccionarVisibles.checked=cajas.length>0&&n===cajas.length;
 seleccionarVisibles.indeterminate=n>0&&n<cajas.length;
 seleccionarVisibles.disabled=borrando||!cajas.length;
 borrarSeleccion.disabled=borrando||!n;
 borrarSeleccion.textContent="Eliminar seleccionadas ("+n+")";
 borrarTodas.disabled=borrando;
}
seleccionarVisibles?.addEventListener("change",()=>{for(const c of casillasPropuestas())c.checked=c.dataset.protegida!=="1"&&seleccionarVisibles.checked;actualizarSeleccion();});
async function borrarGrupo(todas){
 if(borrando)return;
 borrando=true;actualizarSeleccion();estadoBorrado.textContent="";
 let eliminadas=0,omitidas=0,pendientes=0;
 try{
  const inventario= todas?await req("/api/admin/propuestas/eliminables"):null;
  const ids=todas?inventario.ids:casillasPropuestas().filter(c=>c.checked&&c.dataset.protegida!=="1").map(c=>c.dataset.propuestaId);
  if(!ids.length){estadoBorrado.textContent="No hay solicitudes eliminables."+ (todas?" Protegidas: "+inventario.protegidas+".":"");return;}
  const mensaje=todas?"Eliminar "+ids.length+" solicitudes de toda la base, sin importar filtros. Se conservarán "+inventario.protegidas+" protegidas.":"Eliminar "+ids.length+" solicitudes seleccionadas. Las protegidas con candado se conservarán.";
  if(!confirm(mensaje+" También se eliminarán los proyectos, archivos, cotizaciones y pagos asociados. Esta acción es definitiva. ¿Continuar?"))return;
  if(prompt("Para confirmar, escribe ELIMINAR")!=="ELIMINAR")return;
  for(const id of ids){
   estadoBorrado.textContent="Procesando "+(eliminadas+omitidas+1)+" de "+ids.length+"…";
   try{const d=await req("/api/admin/propuestas/"+encodeURIComponent(id),{method:"DELETE"});if(d.ok){eliminadas++;pendientes+=d.imagenes_pendientes||0;}else omitidas++;}catch(e){omitidas++;}
  }
  estadoBorrado.textContent="Eliminadas: "+eliminadas+". No eliminadas: "+omitidas+"."+(todas?" Protegidas inicialmente: "+inventario.protegidas+".":"")+(pendientes?" Imágenes pendientes de limpieza: "+pendientes+".":"");
  await Promise.all([cargarPropuestas(),cargarProyectos(),globalThis.LP_ADMIN_ALERTAS?.cargar()]);
 }catch(e){estadoBorrado.textContent=e.message;}finally{borrando=false;actualizarSeleccion();}
}
borrarSeleccion?.addEventListener("click",()=>borrarGrupo(false));
borrarTodas?.addEventListener("click",()=>borrarGrupo(true));
actualizarSeleccion();
const canalesManual={whatsapp:"WhatsApp",presencial:"Visita presencial",instagram:"Instagram",facebook:"Facebook",telefono:"Teléfono",correo:"Correo electrónico",otro:"Otro"};
function iniciarRegistroManual(){
 const host=document.querySelector("#registro-manual"),det=elem("details","manual-solicitud"),sum=elem("summary",null,"+ Nueva solicitud manual"),f=elem("form","economica-form");det.append(sum,f);host.append(det);
 const campo=(t,tag="input")=>{const l=elem("label",null,t),n=elem(tag);l.append(n);f.append(l);return n;};
 const opciones=(n,o)=>{for(const [k,v] of Object.entries(o)){const a=elem("option",null,v);a.value=k;n.append(a);}};
 const canal=campo("Origen del contacto","select");opciones(canal,canalesManual);
 const nombre=campo("Nombre del cliente");nombre.required=true;nombre.maxLength=100;
 const telefono=campo("Teléfono (10 dígitos)");telefono.type="tel";telefono.required=true;telefono.pattern="[0-9]{10}";telefono.maxLength=10;
 const proyecto=campo("Nombre del proyecto");proyecto.required=true;proyecto.maxLength=120;
 const servicio=campo("Servicio","select");opciones(servicio,{llaveros:"Llaveros personalizados",soporte_qr:"Soportes QR / NFC",fdm_medida:"Impresión FDM",resina:"Resina",web:"Servicios web",combinado:"Proyecto combinado",otro:"Otro"});
 const descripcion=campo("Descripción del pedido","textarea");descripcion.required=true;descripcion.maxLength=1200;descripcion.rows=4;
 const fotos=campo("Referencias opcionales (máx. 3 imágenes de 4 MB)");fotos.type="file";fotos.accept="image/jpeg,image/png,image/webp";fotos.multiple=true;
 const privacidad=campo("El cliente aceptó el aviso de privacidad (solo si consta)");privacidad.type="checkbox";
 const aceptada=campo("La cotización ya fue aceptada por el cliente");aceptada.type="checkbox";
 const econ=elem("fieldset","manual-economica");econ.hidden=true;econ.append(elem("legend",null,"Importes acordados sin IVA · MXN"));f.append(econ);
 const ec=(t,tag="input")=>{const l=elem("label",null,t),n=elem(tag);l.append(n);econ.append(l);return n;};
 const paquete=ec("Paquete","select");opciones(paquete,{"solo_fisico":"Fabricación física","presencia-digital":"Presencia digital","negocio-interactivo":"Negocio interactivo","gestion-comercial":"Gestión comercial","gestion-profesional":"Gestión profesional","a-medida":"A medida"});
 const importes={};for(const [k,t] of Object.entries({implementacion:"Implementación web",fabricacion:"Fabricación",extras:"Extras",mensualidad:"Mensualidad"})){const n=ec(t);n.type="number";n.min="0";n.max="1000000";n.step="0.01";n.value="0";importes[k]=n;}
 const fecha=ec("Fecha real de aceptación");fecha.type="date";const total=elem("p","metadatos");econ.append(total);
 const aviso=elem("p","metadatos","El registro rápido crea solicitud, cotización aceptada y proyecto. No registra pagos ni genera acceso privado.");f.append(aviso);
 const boton=elem("button",null,"Registrar solicitud"),msg=elem("p","metadatos");boton.type="submit";msg.setAttribute("role","status");f.append(boton,msg);
 let id=null;
 function ajustar(){econ.hidden=!aceptada.checked;fecha.required=aceptada.checked;const fisica=["llaveros","soporte_qr","fdm_medida","resina"].includes(servicio.value);if(fisica)paquete.value="solo_fisico";else if(paquete.value==="solo_fisico")paquete.value="a-medida";paquete.disabled=fisica;for(const k of ["implementacion","mensualidad"]){if(paquete.value==="solo_fisico")importes[k].value="0";importes[k].disabled=paquete.value==="solo_fisico";}const n=k=>Math.round(Number(importes[k].value||0)*100),a=n("implementacion")+n("fabricacion")+n("extras"),m=n("mensualidad");total.textContent="Total inicial con IVA: "+((a+Math.floor((a*16+50)/100))/100).toFixed(2)+" MXN · Mensualidad con IVA: "+((m+Math.floor((m*16+50)/100))/100).toFixed(2)+" MXN";boton.textContent=aceptada.checked?"Registrar pedido aceptado y crear proyecto":"Registrar solicitud";}
 aceptada.addEventListener("change",ajustar);servicio.addEventListener("change",ajustar);paquete.addEventListener("change",ajustar);econ.addEventListener("input",ajustar);ajustar();
 f.addEventListener("submit",async e=>{e.preventDefault();if(boton.disabled)return;const archivos=[...fotos.files];if(archivos.length>3||archivos.some(a=>a.size>4*1024*1024)){msg.textContent="Máximo 3 imágenes de 4 MB.";return;}if(aceptada.checked&&!confirm("¿Confirmas que el cliente aceptó los importes indicados en esa fecha?"))return;
  id=id||crypto.randomUUID();const d={id,origen:canal.value,nombre:nombre.value,telefono:telefono.value,proyecto:proyecto.value,servicio:servicio.value,detalles:descripcion.value,privacidad:privacidad.checked,aceptada:aceptada.checked};
  if(d.aceptada){d.fecha_aceptacion=fecha.value;d.economica={version:0,paquete:paquete.value,alcance:descripcion.value,...Object.fromEntries(Object.entries(importes).map(([k,n])=>[k,Math.round(Number(n.value||0)*100)]))};}
  const body=new FormData();body.append("solicitud",JSON.stringify(d));for(const a of archivos)body.append("imagenes",a);boton.disabled=true;msg.textContent="Guardando…";
  try{const r=await fetch("/api/admin/propuestas/manual",{method:"POST",credentials:"same-origin",body}),v=await r.json();if(!r.ok)throw Error(v.error||"No se pudo registrar");id=null;f.reset();ajustar();filtroPropuestas.value="";buscarPropuestas.value=v.folio;await cargarPropuestas();if(v.proyecto_id)await cargarProyectos();msg.textContent="Registrado: "+v.folio+(v.proyecto_id?" · Proyecto creado. Registra los pagos por separado.":" · Prepara la cotización.");}
  catch(e){msg.textContent=e.message;}finally{boton.disabled=false;}
 });
}
iniciarRegistroManual();
async function cargarPropuestas(){
 estadoPropuestas.textContent="Cargando solicitudes…";
 try {
  const params=new URLSearchParams(); if(filtroPropuestas.value)params.set("estado",filtroPropuestas.value); if(buscarPropuestas.value.trim())params.set("buscar",buscarPropuestas.value.trim());
  const d=await req(`/api/admin/propuestas?${params}`);const abiertos=abiertosRegistros(listaPropuestas);listaPropuestas.replaceChildren();
  propuestasVisibles=d.items;actualizarSeleccion();
  const conteo=d.items.reduce((acc,x)=>(acc[x.estado]=(acc[x.estado]||0)+1,acc),{});
  const resumen=Object.entries(conteo).map(([clave,n])=>`${estadosPropuestas[clave]||clave}: ${n}`).join(" · ");
  estadoPropuestas.textContent=`${d.items.length} solicitudes mostradas (máximo 100 por búsqueda). ${resumen}`;
  if(!d.items.length){listaPropuestas.append(elem("p",null,"No hay solicitudes con este filtro."));return;}
  for(const x of d.items){
   const art=elem("article","registro");
   const seleccion=elem("label","seleccion-solicitud"),casilla=elem("input");casilla.type="checkbox";casilla.dataset.propuestaId=x.id;casilla.disabled=borrando;casilla.addEventListener("change",actualizarSeleccion);seleccion.append(casilla,document.createTextNode(" Seleccionar "+x.folio));art.append(seleccion);
   const candado=elem("button","secundario");candado.type="button";candado.dataset.candado="1";
   let protegida=x.ficha?.proteccion_borrado===1;
   function mostrarCandado(){candado.textContent=protegida?"🔒 Protegida":"🔓 Sin protección";candado.setAttribute("aria-pressed",String(protegida));candado.title=protegida?"Desbloquear solicitud":"Proteger solicitud";casilla.dataset.protegida=protegida?"1":"0";if(protegida)casilla.checked=false;casilla.disabled=protegida||borrando;}
   mostrarCandado();candado.addEventListener("click",async()=>{if(borrando)return;candado.disabled=true;try{const d=await req("/api/admin/propuestas/"+encodeURIComponent(x.id)+"/proteccion",{method:"PATCH",body:JSON.stringify({protegida:!protegida})});protegida=d.protegida;mostrarCandado();actualizarSeleccion();}catch(e){estadoPropuestas.textContent=e.message;}finally{candado.disabled=borrando;}});
   art.append(candado);
   art.append(elem("h2",null,`${x.nombre} · ${x.folio}`),elem("p","metadatos",`${new Date(x.fecha).toLocaleString("es-MX")} · ${estadosPropuestas[x.estado]||x.estado}`));
   const datos=elem("dl");
   for(const [t,v] of [["Proyecto",x.proyecto||"Sin indicar"],["WhatsApp",x.telefono],["Comentario",x.comentario||"Sin comentarios"],...(x.ficha?.origen==="registro_manual"?[["Origen",canalesManual[x.ficha.canal_contacto]||"Manual"],["Aviso de privacidad",x.ficha.privacidad_registrada?"Aceptación registrada":"Sin aceptación registrada"]]:[])]){datos.append(elem("dt",null,t),elem("dd",null,v));}
   art.append(datos);
   const esWeb=x.ficha?.tipo_documento==="solicitud_web";
   const esFisica=x.ficha?.tipo_documento==="solicitud_servicio";
   const box=elem("section","resultado-diagnostico");
   if(esFisica){
     box.append(elem("p","resultado-etiqueta","COTIZACIÓN DE IMPRESIÓN 3D · SOLICITUD DIRECTA"),elem("h3",null,x.ficha.titulo_servicio||nombresServicio[x.ficha.servicio]||"Servicio"));
     const dl=elem("dl");
     for(const [k,v] of Object.entries(x.ficha.campos||{})) if(v)dl.append(elem("dt",null,k.replace(/_/g," ")),elem("dd",null,v));
     for(const [k,v] of [["Presupuesto",etiquetasPresupuesto[x.ficha.presupuesto]||"Sin indicar"],["Fecha deseada",x.ficha.fecha_deseada||"Sin indicar"],["Tipo de solicitud",etiquetasContexto[x.ficha.contexto]||"Sin indicar"],...(x.ficha.contexto==="academico"?[["Trabajo académico",tiposAcademicos[x.ficha.tipo_trabajo_academico]||"Sin indicar"],["Institución",x.ficha.institucion_academica||"Sin indicar"],["Descuento académico","5% sugerido, sujeto a revisión y comprobación; no aplicado automáticamente"]]:[])])dl.append(elem("dt",null,k),elem("dd",null,v));
     box.append(dl);
   } else if(esWeb){
     box.append(elem("p","resultado-etiqueta","COTIZACIÓN WEB · SOLICITUD DIRECTA"),elem("h3",null,x.ficha.paquete||x.ficha.tipo_pagina||"Proyecto a medida"));
     const detWeb=elem("dl");
     for(const [t,v] of [["Paquete de interés",x.ficha.paquete||"Proyecto a medida"],...(x.ficha.tipo_pagina?[["Tipo de página (solicitud anterior)",x.ficha.tipo_pagina]]:[]),["Giro",x.ficha.giro],["Preferencia de inversión / presupuesto",etiquetasPresupuesto[x.ficha.presupuesto]||"Sin indicar"],["Funciones solicitadas",(x.ficha.funciones||[]).join(" · ")||"Ninguna"],["Complementos",(x.ficha.complementos||[]).join(" · ")||"Ninguno"]]) detWeb.append(elem("dt",null,t),elem("dd",null,v));
     box.append(detWeb);
   } else {
     const rec=x.ficha?.recomendacion||{};
     box.append(elem("p","resultado-etiqueta","RECOMENDACIÓN DEL CUESTIONARIO"),elem("h3",null,rec.titulo||"Sin recomendación"));
     if(rec.complemento_sugerido)box.append(elem("p",null,rec.complemento_sugerido));
     const det=elem("details");det.append(elem("summary",null,"Ver respuestas"));const dl=elem("dl");
     for(const [c,t] of Object.entries(nombres)){dl.append(elem("dt",null,t),elem("dd",null,etiquetasPresupuesto[x.ficha?.respuestas?.[c]]||etiquetas[x.ficha?.respuestas?.[c]]||x.ficha?.respuestas?.[c]||"Sin respuesta"));}det.append(dl);box.append(det);
   }
   if(Array.isArray(x.ficha?.imagenes)&&x.ficha.imagenes.length){
     const imagenesPanel=elem('section','adjuntos-panel'),heading=elem('h4',null,'Imágenes de referencia');imagenesPanel.append(heading);
     x.ficha.imagenes.forEach((foto,i)=>{
       const enlace=elem('a','boton-enlace',`Ver imagen ${i+1}: ${foto.nombre||'Referencia'}`);
       enlace.href=`/api/admin/propuestas/${encodeURIComponent(x.id)}/imagen/${i}`;
       enlace.target='_blank';enlace.rel='noopener noreferrer';imagenesPanel.append(enlace);
     });box.append(imagenesPanel);
   }
   art.append(box);
   agregarEconomica(art,x);
   const actions=elem("div","acciones");
   const wa=elem("a","boton-enlace","Contactar por WhatsApp");wa.href=`https://wa.me/52${x.telefono}?text=${encodeURIComponent(`Hola ${x.nombre}, te contactamos de Lapazimpresion3d sobre tu solicitud ${x.folio}.`)}`;wa.target="_blank";wa.rel="noopener noreferrer";actions.append(wa);
   const select=elem("select");select.setAttribute("aria-label",`Estado de ${x.folio}`);
   for(const [valor,titulo] of Object.entries(estadosPropuestas)){const op=document.createElement("option");op.value=valor;op.textContent=titulo;select.append(op);}select.value=x.estado;
   select.addEventListener("change",async()=>{select.disabled=true;try{await req(`/api/admin/propuestas/${encodeURIComponent(x.id)}`,{method:"PATCH",body:JSON.stringify({estado:select.value})});await cargarPropuestas();}catch(e){estadoPropuestas.textContent=e.message;select.value=x.estado;}finally{select.disabled=false;}});actions.append(select);
   if(["cotizado","cerrado"].includes(x.estado)){
     const crearProyecto=elem("button","secundario","Crear proyecto (cotización aceptada)");
     crearProyecto.type="button";
     crearProyecto.addEventListener("click",async()=>{
       if(!confirm(`¿Confirmas que el cliente aceptó la cotización ${x.folio} y deseas crear su proyecto privado? Aún no se generará enlace para el cliente.`))return;
       crearProyecto.disabled=true;
       try{
         const d=await req(`/api/admin/propuestas/${encodeURIComponent(x.id)}/proyecto`,{method:"POST",body:JSON.stringify({aceptado:true})});
         estadoPropuestas.textContent=d.creado?`Proyecto creado para ${x.folio}.`:`Ya existía un proyecto para ${x.folio}.`;
         await cargarProyectos();
       }catch(e){estadoPropuestas.textContent=e.message+" (comprueba que la migración 0004 esté aplicada)";}
       finally{crearProyecto.disabled=false;}
     });
     actions.append(crearProyecto);
   }
   const jsonBoton=elem("button","secundario","Descargar JSON");jsonBoton.addEventListener("click",()=>descargar({...x.ficha,contacto:{nombre:x.nombre,proyecto:x.proyecto,telefono:x.telefono,comentario:x.comentario},folio:x.folio,estado_solicitud:x.estado}));actions.append(jsonBoton);
   const borrar=elem("button","secundario","Eliminar");borrar.addEventListener("click",async()=>{if(borrando)return;if(protegida){estadoPropuestas.textContent="Desbloquea el candado antes de eliminar.";return;}if(!confirm(`¿Eliminar definitivamente ${x.folio}, incluidos sus proyectos, cotizaciones, pagos y archivos asociados?`))return;if(prompt("Para confirmar, escribe ELIMINAR")!=="ELIMINAR")return;try{const d=await req(`/api/admin/propuestas/${encodeURIComponent(x.id)}`,{method:"DELETE"});await cargarPropuestas(); (estadoBorrado||estadoPropuestas).textContent=d.imagenes_pendientes?"Solicitud eliminada; imágenes pendientes de limpieza: "+d.imagenes_pendientes+".":"Solicitud eliminada.";await globalThis.LP_ADMIN_ALERTAS?.cargar();}catch(e){estadoPropuestas.textContent=e.message;}});actions.append(borrar);
   art.append(actions);const servicio=x.ficha?.origen==="registro_manual"?(x.ficha.titulo_servicio+" · "+(canalesManual[x.ficha.canal_contacto]||"Manual")):esFisica?(x.ficha.titulo_servicio||nombresServicio[x.ficha.servicio]||"Impresión 3D"):esWeb?(x.ficha.paquete||x.ficha.tipo_pagina||"Proyecto web a medida"):(x.ficha?.recomendacion?.titulo||"Cuestionario de orientación");plegarRegistro(art,x.id,x.nombre+" · "+x.folio,servicio+" · "+new Date(x.fecha).toLocaleDateString("es-MX"),estadosPropuestas[x.estado]||x.estado,abiertos.has(x.id)||buscarPropuestas.value.trim().toUpperCase()===x.folio.toUpperCase(),[seleccion,candado]);listaPropuestas.append(art);
  }
  actualizarSeleccion();
 }catch(e){estadoPropuestas.textContent=e.message;}
}
document.querySelector("#exportar-propuestas").addEventListener("click",exportarPropuestasCSV);
document.querySelector("#actualizar-propuestas").addEventListener("click",cargarPropuestas);
filtroPropuestas.addEventListener("change",cargarPropuestas);
buscarPropuestas.addEventListener("input",()=>{clearTimeout(solicitudBusquedaTimer);solicitudBusquedaTimer=setTimeout(cargarPropuestas,350)});
})();
