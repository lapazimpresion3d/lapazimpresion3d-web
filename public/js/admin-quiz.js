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
acceso.addEventListener("submit",async(e)=>{e.preventDefault();error.textContent="";try{await req("/api/admin/login",{method:"POST",body:JSON.stringify({password:document.querySelector("#password").value})});document.querySelector("#password").value="";acceso.hidden=true;panel.hidden=false;await Promise.all([cargar(),cargarPropuestas(),cargarProyectos()]);}catch(e){error.textContent=e.message;}});
document.querySelector("#actualizar").addEventListener("click",cargar);filtro.addEventListener("change",cargar);let ultimaConsulta="";
busqueda.addEventListener("input",()=>{
  const texto=busqueda.value.trim();
  const esReferencia=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(texto);
  if(esReferencia || (ultimaConsulta && !esReferencia)) { ultimaConsulta=esReferencia?texto:""; cargar(); }
  else filtrarBusqueda();
});document.querySelector("#salir").addEventListener("click",async()=>{await req("/api/admin/salir",{method:"POST",body:"{}"}).catch(()=>{});panel.hidden=true;acceso.hidden=false;lista.replaceChildren();listaPropuestas.replaceChildren();listaProyectos.replaceChildren();propuestasVisibles=[];});
req("/api/admin/sesion").then(()=>{acceso.hidden=true;panel.hidden=false;return Promise.all([cargar(),cargarPropuestas(),cargarProyectos()]);}).catch(()=>{});

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
async function cargarProyectos(){
 estadoProyectos.textContent="Cargando proyectos…";
 try {
  const d=await req("/api/admin/proyectos");
  listaProyectos.replaceChildren();
  estadoProyectos.textContent=`${d.items.length} proyecto(s) registrado(s). Los enlaces privados se generan individualmente.`;
  if(!d.items.length){listaProyectos.append(elem("p",null,"Todavía no hay proyectos aceptados."));return;}
  for(const p of d.items){
   const art=elem("article","registro");
   art.append(elem("h3",null,`${p.folio} · ${p.nombre}`),elem("p","metadatos",`Proyecto: ${p.proyecto||"Sin nombre"} · Actualizado: ${new Date(p.fecha_actualizacion).toLocaleString("es-MX")}`));
   const label=elem("label",null,"Estado del proyecto "),select=elem("select");
   select.setAttribute("aria-label",`Estado del proyecto ${p.folio}`);
   for(const [id,nombre] of Object.entries(estadosProyecto)){const option=elem("option",null,nombre);option.value=id;select.append(option);}
   select.value=p.estado;select.addEventListener("change",async()=>{select.disabled=true;try{await req(`/api/admin/proyectos/${encodeURIComponent(p.id)}`,{method:"PATCH",body:JSON.stringify({estado:select.value})});await cargarProyectos();}catch(e){estadoProyectos.textContent=e.message;select.value=p.estado;}finally{select.disabled=false;}});
   label.append(select);art.append(label);
   const acciones=elem("div","acciones");
   const generar=elem("button","secundario","Generar enlace privado");
   generar.type="button";
   generar.disabled=["finalizado","cancelado"].includes(p.estado);
   const revocar=elem("button","secundario","Revocar enlace");
   revocar.type="button";
   generar.addEventListener("click",async()=>{
     if(!confirm("¿Generar un nuevo enlace para "+p.folio+"? Cualquier enlace anterior dejará de funcionar."))return;
     generar.disabled=true;
     try{
       const resultado=await req("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/acceso",{method:"POST",body:"{}"});
       const caja=elem("div","enlace-cliente");
       caja.append(elem("p",null,"Enlace privado (válido hasta "+new Date(resultado.expira).toLocaleString("es-MX")+") · solo se mostrará esta vez:"));
       const url=elem("input");url.type="text";url.readOnly=true;url.value=resultado.url;url.setAttribute("aria-label","Enlace privado del cliente");
       const copiar=elem("button","secundario","Copiar enlace");copiar.type="button";
       copiar.addEventListener("click",async()=>{
         try{await navigator.clipboard.writeText(resultado.url);copiar.textContent="Copiado";}catch(e){url.focus();url.select();copiar.textContent="Seleccionado: usa Ctrl+C";}
       });
       caja.append(url,copiar);
       art.querySelector(".enlace-cliente")?.remove();
       art.append(caja);
       estadoProyectos.textContent="Enlace generado. Compártelo únicamente con el cliente. No se envía automáticamente.";
     }catch(e){estadoProyectos.textContent=e.message;}
     finally{generar.disabled=false;}
   });
   revocar.addEventListener("click",async()=>{
     if(!confirm("¿Revocar el acceso del cliente al proyecto "+p.folio+"?"))return;
     revocar.disabled=true;
     try{await req("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/acceso",{method:"DELETE",body:"{}"});art.querySelector(".enlace-cliente")?.remove();estadoProyectos.textContent="Acceso revocado. El cliente ya no podrá utilizar su enlace.";await cargarProyectos();}
     catch(e){estadoProyectos.textContent=e.message;}finally{revocar.disabled=false;}
   });
   const revisar=elem("button","secundario","Ver materiales recibidos");
   revisar.type="button";
   revisar.addEventListener("click",async()=>{
     revisar.disabled=true;
     try{
       const d=await req("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/materiales");
       art.querySelector(".materiales-administracion")?.remove();
       const caja=elem("section","materiales-administracion");
       caja.append(elem("h4",null,"Materiales del proyecto"));
       const secciones={datos_negocio:"Datos, descripción o diseño",servicios_productos:"Productos, servicios, cantidad o medidas",horarios_contacto:"Contacto, uso o entrega",indicaciones:"Indicaciones adicionales"};
       const nota=elem("div","apartado-recibido"),labelNota=elem("label",null,"Indicaciones para el cliente (visibles en su portal)"),txt=elem("textarea");
       txt.rows=4;txt.maxLength=2000;txt.value=d.instrucciones||"";labelNota.append(txt);
       const guardar=elem("button","secundario","Guardar indicaciones");guardar.type="button";
       const mensaje=elem("p","metadatos","");mensaje.setAttribute("role","status");
       guardar.disabled=txt.disabled=["finalizado","cancelado"].includes(p.estado);
       guardar.addEventListener("click",async()=>{guardar.disabled=true;mensaje.textContent="Guardando…";try{const r=await req("/api/admin/proyectos/"+encodeURIComponent(p.id)+"/materiales",{method:"PATCH",body:JSON.stringify({instrucciones:txt.value})});txt.value=r.instrucciones;mensaje.textContent="Indicaciones guardadas. El cliente podrá leerlas al abrir o actualizar su portal."; }catch(e){mensaje.textContent=e.message;}finally{guardar.disabled=false;}});
       nota.append(labelNota,guardar,mensaje);caja.append(nota);
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
       art.append(caja);
     }catch(e){estadoProyectos.textContent=e.message;}finally{revisar.disabled=false;}
   });
   acciones.append(generar,revocar,revisar);art.append(acciones);listaProyectos.append(art);
  }
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
async function cargarPropuestas(){
 estadoPropuestas.textContent="Cargando solicitudes…";
 try {
  const params=new URLSearchParams(); if(filtroPropuestas.value)params.set("estado",filtroPropuestas.value); if(buscarPropuestas.value.trim())params.set("buscar",buscarPropuestas.value.trim());
  const d=await req(`/api/admin/propuestas?${params}`);listaPropuestas.replaceChildren();
  propuestasVisibles=d.items;
  const conteo=d.items.reduce((acc,x)=>(acc[x.estado]=(acc[x.estado]||0)+1,acc),{});
  const resumen=Object.entries(conteo).map(([clave,n])=>`${estadosPropuestas[clave]||clave}: ${n}`).join(" · ");
  estadoPropuestas.textContent=`${d.items.length} solicitudes mostradas (máximo 100 por búsqueda). ${resumen}`;
  if(!d.items.length){listaPropuestas.append(elem("p",null,"No hay solicitudes con este filtro."));return;}
  for(const x of d.items){
   const art=elem("article","registro");
   art.append(elem("h2",null,`${x.nombre} · ${x.folio}`),elem("p","metadatos",`${new Date(x.fecha).toLocaleString("es-MX")} · ${estadosPropuestas[x.estado]||x.estado}`));
   const datos=elem("dl");
   for(const [t,v] of [["Proyecto",x.proyecto||"Sin indicar"],["WhatsApp",x.telefono],["Comentario",x.comentario||"Sin comentarios"]]){datos.append(elem("dt",null,t),elem("dd",null,v));}
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
   const borrar=elem("button","secundario","Eliminar");borrar.addEventListener("click",async()=>{if(!confirm(`¿Eliminar definitivamente ${x.folio}?`))return;try{await req(`/api/admin/propuestas/${encodeURIComponent(x.id)}`,{method:"DELETE"});await cargarPropuestas();}catch(e){estadoPropuestas.textContent=e.message;}});actions.append(borrar);
   art.append(actions);listaPropuestas.append(art);
  }
 }catch(e){estadoPropuestas.textContent=e.message;}
}
document.querySelector("#exportar-propuestas").addEventListener("click",exportarPropuestasCSV);
document.querySelector("#actualizar-propuestas").addEventListener("click",cargarPropuestas);
filtroPropuestas.addEventListener("change",cargarPropuestas);
buscarPropuestas.addEventListener("input",()=>{clearTimeout(solicitudBusquedaTimer);solicitudBusquedaTimer=setTimeout(cargarPropuestas,350)});
})();
