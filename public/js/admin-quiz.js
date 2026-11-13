(() => { "use strict";
const acceso=document.querySelector("#acceso"),panel=document.querySelector("#panel"),lista=document.querySelector("#lista"),estado=document.querySelector("#estado"),error=document.querySelector("#error-login"),filtro=document.querySelector("#filtro");
const busqueda=document.querySelector("#busqueda");
let ultimosItems=[];
const nombres={
  objetivo:"¿Qué te gustaría conseguir principalmente con este proyecto?",
  situacion:"¿En qué situación te encuentras ahora mismo?",
  contacto_actual:"¿Cómo es el contacto principal con las personas a las que quieres llegar?",
  mejora_deseada:"¿Qué te gustaría mejorar o añadir en esa experiencia?",
  preparacion:"¿Qué tan avanzado tienes tu proyecto o material de apoyo?"
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
  cotizando:"Por ahora solo estoy cotizando y viendo posibilidades."
};
async function req(path,options={}){const r=await fetch(path,{...options,credentials:"same-origin",headers:{...(options.body?{"Content-Type":"application/json"}:{}),...options.headers}});const d=await r.json().catch(()=>({}));if(!r.ok)throw Error(d.error||`Error ${r.status}`);return d;}
function elem(tag,cls,text){const e=document.createElement(tag);if(cls)e.className=cls;if(text!==undefined)e.textContent=text;return e;}
function descargar(ficha){const blob=new Blob([JSON.stringify(ficha,null,2)+"\n"],{type:"application/json"}),u=URL.createObjectURL(blob),a=document.createElement("a");a.href=u;a.download=`ficha-quiz-${ficha.id_diagnostico}.json`;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000);}
const descripciones={
  R1:"Recuerdos, regalos o piezas promocionales personalizados en impresión 3D.",
  R2:"Soportes impresos en 3D para conectar la atención presencial con información digital mediante QR y NFC opcional.",
  R3:"Una página, menú o catálogo para presentar productos y servicios desde el teléfono.",
  R4:"Funciones de pedidos, reservaciones o administración adaptadas a las necesidades del negocio.",
  R5:"Una solución que combina artículos o soportes físicos personalizados con servicios digitales."
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
    const details=elem("details"),summary=elem("summary",null,"Ver cinco respuestas"),dl=elem("dl");
    for(const [campo,label] of Object.entries(nombres)){
      dl.append(elem("dt",null,label),elem("dd",null,etiquetas[f.respuestas?.[campo]]||f.respuestas?.[campo]||"Sin respuesta"));
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
acceso.addEventListener("submit",async(e)=>{e.preventDefault();error.textContent="";try{await req("/api/admin/login",{method:"POST",body:JSON.stringify({password:document.querySelector("#password").value})});document.querySelector("#password").value="";acceso.hidden=true;panel.hidden=false;await cargar();}catch(e){error.textContent=e.message;}});
document.querySelector("#actualizar").addEventListener("click",cargar);filtro.addEventListener("change",cargar);let ultimaConsulta="";
busqueda.addEventListener("input",()=>{
  const texto=busqueda.value.trim();
  const esReferencia=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(texto);
  if(esReferencia || (ultimaConsulta && !esReferencia)) { ultimaConsulta=esReferencia?texto:""; cargar(); }
  else filtrarBusqueda();
});document.querySelector("#salir").addEventListener("click",async()=>{await req("/api/admin/salir",{method:"POST",body:"{}"}).catch(()=>{});panel.hidden=true;acceso.hidden=false;lista.replaceChildren();});
req("/api/admin/sesion").then(()=>{acceso.hidden=true;panel.hidden=false;return cargar();}).catch(()=>{});
})();
