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
  presupuesto:"¿Qué presupuesto tienes pensado destinar a tu proyecto?"
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
async function cargarProyectos(){
 estadoProyectos.textContent="Cargando proyectos…";
 try {
  const d=await req("/api/admin/proyectos");
  listaProyectos.replaceChildren();
  estadoProyectos.textContent=`${d.items.length} proyecto(s) registrado(s). Los enlaces de cliente todavía no están habilitados.`;
  if(!d.items.length){listaProyectos.append(elem("p",null,"Todavía no hay proyectos aceptados."));return;}
  for(const p of d.items){
   const art=elem("article","registro");
   art.append(elem("h3",null,`${p.folio} · ${p.nombre}`),elem("p","metadatos",`Proyecto: ${p.proyecto||"Sin nombre"} · Actualizado: ${new Date(p.fecha_actualizacion).toLocaleString("es-MX")}`));
   const label=elem("label",null,"Estado del proyecto "),select=elem("select");
   select.setAttribute("aria-label",`Estado del proyecto ${p.folio}`);
   for(const [id,nombre] of Object.entries(estadosProyecto)){const option=elem("option",null,nombre);option.value=id;select.append(option);}
   select.value=p.estado;select.addEventListener("change",async()=>{select.disabled=true;try{await req(`/api/admin/proyectos/${encodeURIComponent(p.id)}`,{method:"PATCH",body:JSON.stringify({estado:select.value})});await cargarProyectos();}catch(e){estadoProyectos.textContent=e.message;select.value=p.estado;}finally{select.disabled=false;}});
   label.append(select);art.append(label,elem("p","metadatos","Acceso del cliente: aún no habilitado"));listaProyectos.append(art);
  }
 }catch(e){estadoProyectos.textContent="Proyectos no disponibles: "+e.message+". Comprueba que la migración 0004 esté aplicada a D1.";}
}
document.querySelector("#actualizar-proyectos").addEventListener("click",cargarProyectos);
const listaPropuestas=document.querySelector("#lista-propuestas"),estadoPropuestas=document.querySelector("#estado-propuestas"),filtroPropuestas=document.querySelector("#filtro-propuestas"),buscarPropuestas=document.querySelector("#buscar-propuestas");
const etiquetasPresupuesto={menos_500:"Menos de $500",500_1500:"$500 a $1,500",1500_3000:"$1,500 a $3,000",3000_6000:"$3,000 a $6,000",mas_6000:"Más de $6,000",sin_definir:"Necesita orientación"};
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
 const cabeceras=["Folio","Fecha","Estado","Nombre","Proyecto","WhatsApp","Comentario","Recomendación","Complemento","Origen","Tipo de página","Giro","Funciones","Complementos","Servicio","Presupuesto","Detalles específicos","Tipo de solicitud","Trabajo académico","Institución educativa","Descuento académico sugerido"];
 const filas=propuestasVisibles.map(x=>[x.folio,x.fecha,x.estado,x.nombre,x.proyecto,x.telefono,x.comentario,x.ficha?.recomendacion?.titulo,x.ficha?.recomendacion?.complemento_sugerido,x.ficha?.origen||"cuestionario",x.ficha?.tipo_pagina||"",x.ficha?.giro||"",(x.ficha?.funciones||[]).join("; "),(x.ficha?.complementos||[]).join("; "),x.ficha?.titulo_servicio||x.ficha?.tipo_pagina||x.ficha?.recomendacion?.titulo||"",etiquetasPresupuesto[x.ficha?.presupuesto||x.ficha?.respuestas?.presupuesto]||"",JSON.stringify(x.ficha?.campos||{}),etiquetasContexto[x.ficha?.contexto]||"",tiposAcademicos[x.ficha?.tipo_trabajo_academico]||"",x.ficha?.institucion_academica||"",x.ficha?.contexto==="academico"?"5% sujeto a verificación, no aplicado":""]);
 const csv="\uFEFF"+[cabeceras,...filas].map(f=>f.map(celdaCSV).join(",")).join("\r\n")+"\r\n";
 const url=URL.createObjectURL(new Blob([csv],{type:"text/csv;charset=utf-8"}));
 const a=document.createElement("a");a.href=url;a.download="solicitudes-lapazimpresion3d.csv";document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1000);
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
     box.append(elem("p","resultado-etiqueta","COTIZACIÓN WEB · SOLICITUD DIRECTA"),elem("h3",null,x.ficha.tipo_pagina));
     const detWeb=elem("dl");
     for(const [t,v] of [["Giro",x.ficha.giro],["Presupuesto",etiquetasPresupuesto[x.ficha.presupuesto]||"Sin indicar"],["Funciones solicitadas",(x.ficha.funciones||[]).join(" · ")||"Ninguna"],["Complementos",(x.ficha.complementos||[]).join(" · ")||"Ninguno"]]) detWeb.append(elem("dt",null,t),elem("dd",null,v));
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
