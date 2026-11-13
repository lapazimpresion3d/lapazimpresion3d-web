(() => {
"use strict";
const configuraciones={
 llaveros:{nombre:"Llaveros personalizados",secciones:[
  ["datos_negocio","Diseño y logotipo","Nombre o logotipo que llevará el llavero. Describe el diseño, las letras y qué elementos deben conservarse."],
  ["servicios_productos","Cantidad, tamaño y colores","Cantidad de piezas, medidas aproximadas, colores de cada parte y preferencias de acabado."],
  ["horarios_contacto","Uso, entrega y NFC","¿Son para un negocio, evento o regalo? Indica fecha requerida y si deseas NFC, destino del enlace o argollas especiales."],
  ["indicaciones","Referencias e indicaciones adicionales","Indica cambios respecto a los ejemplos, distribución de colores, detalles de relieve y cualquier requisito especial."]
 ]},
 fdm_medida:{nombre:"Impresión 3D a medida",secciones:[
  ["datos_negocio","Descripción de la pieza","¿Qué pieza necesitas fabricar o reproducir? Explica su función."],
  ["servicios_productos","Dimensiones, cantidad y material","Medidas, número de piezas, tolerancias y material preferido (PLA, PETG, ABS u otro)."],
  ["horarios_contacto","Condiciones de uso y entrega","Esfuerzos, temperatura, humedad, exposición al sol y fecha requerida."],
  ["indicaciones","Modelos, planos e indicaciones","Archivos 3D o fotografías de referencia, ajustes y requisitos de montaje."]
 ]},
 resina:{nombre:"Figuras y miniaturas",secciones:[
  ["datos_negocio","Personaje o figura","Describe la figura, estilo, postura y el resultado esperado."],
  ["servicios_productos","Escala, cantidad y detalles","Altura o escala, cantidad de copias, nivel de detalle y acabado."],
  ["horarios_contacto","Uso y fecha de entrega","Maqueta, colección, decoración u otro uso; fecha requerida."],
  ["indicaciones","Referencias visuales","Indica qué partes deben mantenerse idénticas a las fotografías o bocetos."]
 ]},
 soporte_qr:{nombre:"Soportes QR/NFC",secciones:[
  ["datos_negocio","Logotipo y diseño del soporte","Nombre, logotipo, estilo y colores del soporte."],
  ["servicios_productos","Cantidad, tamaño y ubicación","Cantidad, dimensiones y si estarán en mesas, mostrador o recepción."],
  ["horarios_contacto","Contenido de QR y NFC","Dirección web, menú, catálogo o redes a enlazar; si se requiere NFC."],
  ["indicaciones","Referencias y fabricación","Forma deseada, base, relieve y otros detalles."]
 ]},
 web:{nombre:"Página web o servicio digital",secciones:[
  ["datos_negocio","Información del negocio","Nombre, descripción, historia, especialidad y mensaje principal."],
  ["servicios_productos","Productos y servicios","Catálogo, categorías, precios, descripciones, menú o tipos de reservación."],
  ["horarios_contacto","Horarios, dirección y contacto","Horarios, dirección, WhatsApp, redes sociales y zonas de servicio."],
  ["indicaciones","Preferencias y contenido adicional","Estilo, colores, páginas de referencia y otras funcionalidades."]
 ]}
};
// Mostrar lo que ya existe en la cotización; pedir solamente vacíos o ambigüedades.
function datosLlaveros(cotizacion){
 const f=cotizacion?.campos||{};
 const campos=[
  ["Cantidad",f.cantidad],["Tamaño",f.tamano],["Diseño existente",f.diseno],
  ["Colores",f.colores],["NFC",f.nfc],["Uso",f.uso],["Fecha deseada",cotizacion?.fecha_deseada]
 ];
 const conocido=valor=>valor!=null && String(valor).trim()!=="" && !["no especificado","no estoy seguro"].includes(String(valor).trim().toLowerCase());
 const grupos={
  datos_negocio:[["diseno","¿Ya tienes un logotipo o diseño?"]],
  servicios_productos:[["cantidad","¿Cuántas piezas necesitas?"],["tamano","¿De qué tamaño?"],["colores","¿Qué colores deseas?"]],
  horarios_contacto:[["uso","¿Para qué se usarán los llaveros?"],["nfc","¿Deseas NFC?"]]
 };
 const faltantes={};
 for(const [seccion,elementos] of Object.entries(grupos)){
  faltantes[seccion]=elementos.filter(([campo])=>!conocido(f[campo])).map(([,pregunta])=>pregunta);
 }
 if(f.nfc==="Sí")faltantes.horarios_contacto.push("¿A qué página o enlace debe dirigir el NFC?");
 // La fecha es opcional y no debe convertirse en una obligación.
 return {campos:campos.filter(([,valor])=>conocido(valor)),faltantes,descripcion:cotizacion?.detalles||""};
}
function resumenCotizacionLlaveros(cotizacion){
 const {campos,descripcion}=datosLlaveros(cotizacion);
 const caja=document.createElement("section");caja.className="bloque datos-cotizacion";
 const h=document.createElement("h2");h.textContent="Información que ya proporcionaste";
 const intro=document.createElement("p");intro.className="mensaje";intro.textContent="Estos datos vienen de tu cotización original. No necesitas escribirlos otra vez. Si algo cambió o requiere precisión, puedes aclararlo más abajo.";
 caja.append(h,intro);
 if(campos.length){
  const lista=document.createElement("dl");lista.className="resumen-cotizacion";
  for(const [titulo,valor] of campos){
   const dt=document.createElement("dt");dt.textContent=titulo;
   const dd=document.createElement("dd");dd.textContent=String(valor);
   lista.append(dt,dd);
  }caja.append(lista);
 }
 if(descripcion){
  const p=document.createElement("p");p.className="mensaje";p.textContent="Descripción original: "+descripcion;caja.append(p);
 }
 return caja;
}
const mensaje=document.querySelector("#mensaje-acceso"),panel=document.querySelector("#proyecto"),contenedor=document.querySelector("#secciones"),imagenes=document.querySelector("#imagenes-proyecto"),lista=document.querySelector("#lista-archivos"),estadoFotos=document.querySelector("#estado-archivos");
let estadoProyecto="",archivos=[];
async function api(path,method="GET",data){
 const r=await fetch(path,{method,credentials:"same-origin",headers:data?{"Content-Type":"application/json"}:undefined,body:data?JSON.stringify(data):undefined,cache:"no-store"});
 const value=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(value.error||"No fue posible completar la solicitud");
 return value;
}
function pintarArchivos(){
 lista.replaceChildren();
 if(!archivos.length){lista.textContent="Todavía no hay fotografías o logotipos.";return;}
 for(const a of archivos){
  const fila=document.createElement("li");fila.className="archivo";
  const nombre=document.createElement("span");nombre.textContent=a.nombre_original+" · "+(a.tamano_bytes/1024/1024).toFixed(2)+" MB";
  const ver=document.createElement("a");ver.textContent="Ver imagen";ver.href="/api/cliente/archivos/"+encodeURIComponent(a.id);ver.target="_blank";ver.rel="noopener noreferrer";
  fila.append(nombre,ver);
  if(!["finalizado","cancelado"].includes(estadoProyecto)){
   const borrar=document.createElement("button");borrar.type="button";borrar.className="secundario";borrar.textContent="Eliminar";
   borrar.addEventListener("click",async()=>{
    if(!confirm("¿Eliminar "+a.nombre_original+" del proyecto?"))return;
    borrar.disabled=true;
    try{await api("/api/cliente/archivos/"+encodeURIComponent(a.id),"DELETE");archivos=archivos.filter(f=>f.id!==a.id);pintarArchivos();estadoFotos.textContent="Imagen eliminada.";}
    catch(e){estadoFotos.textContent=e.message;borrar.disabled=false;}
   });
   fila.append(borrar);
  }
  lista.append(fila);
 }
}
async function iniciar(){
 try{
  const hash=new URLSearchParams(location.hash.slice(1)),token=hash.get("acceso");
  if(token){history.replaceState(null,"",location.pathname+location.search);await api("/api/cliente/iniciar","POST",{token});}
  const data=await api("/api/cliente/materiales"),p=data.proyecto;
  estadoProyecto=p.estado;
  const config=configuraciones[p.categoria]||configuraciones.web;
  document.querySelector("#folio").textContent=p.folio;
  document.querySelector("#nombre-proyecto").textContent=p.proyecto||"Proyecto de "+p.nombre;
  document.querySelector("#tipo-proyecto").textContent=config.nombre;
  const estados={preparacion:"Preparación",recabando_materiales:"Recabando materiales",en_desarrollo:"En desarrollo",en_revision:"En revisión",finalizado:"Finalizado",cancelado:"Cancelado"};
  document.querySelector("#estado-proyecto").textContent=estados[p.estado]||p.estado;
  contenedor.replaceChildren();
  const llaveros=p.categoria==="llaveros"&&data.cotizacion;
  const previo=llaveros?datosLlaveros(data.cotizacion):null;
  if(llaveros)contenedor.append(resumenCotizacionLlaveros(data.cotizacion));
  for(const [clave,titulo,ayuda] of config.secciones){
   const registro=data.secciones.find(s=>s.clave===clave);
   const pendientes=llaveros?(previo.faltantes[clave]||[]):[];
   const esOpcional=llaveros&&pendientes.length===0&&!registro?.contenido?.trim();
   const area=document.createElement("section");area.className="bloque";
   const encabezado=document.createElement("h2");encabezado.textContent=llaveros&&clave!=="indicaciones"?(pendientes.length?"Información por completar: "+titulo:"Aclaraciones: "+titulo):titulo;
   const descripcion=document.createElement("p");descripcion.className="mensaje";
   descripcion.textContent=llaveros
     ?(pendientes.length?"Solo necesitamos confirmar: "+pendientes.join(" · "):"La información básica ya está en tu cotización. Completa este apartado únicamente si hay cambios o detalles adicionales.")
     :ayuda;
   const label=document.createElement("label"),id="contenido-"+clave;label.htmlFor=id;label.textContent=llaveros?"Aclaraciones o información faltante":"Información para "+titulo.toLowerCase();
   const input=document.createElement("textarea");input.id=id;input.maxLength=10000;input.value=registro?.contenido||"";input.placeholder=llaveros?(pendientes.join("\n")||"Solo si deseas aclarar algo de lo cotizado"):ayuda;
   const controls=document.createElement("div");controls.className="controles";
   const button=document.createElement("button");button.type="button";button.textContent="Guardar apartado";
   const estado=document.createElement("span");estado.className="mensaje";estado.setAttribute("role","status");estado.textContent=registro?"Información recibida":"Pendiente";
   button.addEventListener("click",async()=>{
    button.disabled=true;estado.classList.remove("error");estado.textContent="Guardando…";
    try{await api("/api/cliente/secciones/"+clave,"PUT",{contenido:input.value});estado.textContent="Guardado correctamente";}
    catch(e){estado.textContent=e.message;estado.classList.add("error");}
    finally{button.disabled=false;}
   });
   if(["finalizado","cancelado"].includes(p.estado)){button.disabled=true;input.readOnly=true;}
   controls.append(button,estado);
   area.append(encabezado,descripcion,label,input,controls);
   if(esOpcional&&clave!=="indicaciones"){
     const detalle=document.createElement("details");
     const sum=document.createElement("summary");sum.textContent="Agregar una aclaración (opcional)";
     detalle.append(sum,area);contenedor.append(detalle);
   }else contenedor.append(area);
  }
  archivos=data.archivos||[];pintarArchivos();
  if(["finalizado","cancelado"].includes(p.estado)){document.querySelector("#subir-imagenes").disabled=true;imagenes.disabled=true;}
  mensaje.hidden=true;panel.hidden=false;
 }catch(e){panel.hidden=true;mensaje.hidden=false;mensaje.className="error";mensaje.textContent=e.message+". Solicita un nuevo enlace a Lapazimpresion3d si tu acceso venció.";}
}
document.querySelector("#subir-imagenes").addEventListener("click",async()=>{
 const files=Array.from(imagenes.files||[]),boton=document.querySelector("#subir-imagenes");
 if(!files.length){estadoFotos.textContent="Selecciona las fotografías que deseas entregar.";return;}
 if(archivos.length+files.length>30){estadoFotos.textContent="Máximo 30 imágenes por proyecto.";return;}
 if(files.some(f=>!["image/jpeg","image/png","image/webp"].includes(f.type)||f.size>4*1024*1024||!f.size)){estadoFotos.textContent="Solo JPG, PNG o WebP de hasta 4 MB por imagen.";return;}
 boton.disabled=true;
 let subidas=0;
 for(const f of files){
  estadoFotos.textContent="Subiendo "+(subidas+1)+" de "+files.length+": "+f.name;
  const body=new FormData();body.append("imagen",f);
  try{
   const resp=await fetch("/api/cliente/archivos",{method:"POST",body,credentials:"same-origin",cache:"no-store"});
   const d=await resp.json().catch(()=>({}));
   if(!resp.ok)throw Error(d.error||"Error en la carga");
   archivos.unshift(d.archivo);subidas++;pintarArchivos();
  }catch(e){estadoFotos.textContent="Se subieron "+subidas+" imágenes. Error con "+f.name+": "+e.message;boton.disabled=false;return;}
 }
 imagenes.value="";estadoFotos.textContent=subidas+" imagen(es) guardada(s) correctamente.";boton.disabled=false;
});
document.querySelector("#salir").addEventListener("click",async()=>{try{await api("/api/cliente/salir","POST");}finally{location.replace("/cliente/materiales/");}});
iniciar();
})();