(() => {
"use strict";
const etiquetas=[
  ["datos_negocio","Información del negocio","Historia del negocio, especialidad, descripción, mensaje principal y cualquier información que deseas mostrar."],
  ["servicios_productos","Productos y servicios","Lista de productos o servicios, precios, características, categorías y descripciones."],
  ["horarios_contacto","Horarios y contacto","Horarios, dirección, WhatsApp, redes sociales, enlaces y zonas de atención."],
  ["indicaciones","Indicaciones adicionales","Preferencias de estilo, ejemplos de páginas, cambios especiales y cualquier otra indicación."]
];
const mensaje=document.querySelector("#mensaje-acceso"),panel=document.querySelector("#proyecto"),contenedor=document.querySelector("#secciones");
async function api(path,method="GET",data){
 const r=await fetch(path,{method,credentials:"same-origin",headers:data?{"Content-Type":"application/json"}:undefined,body:data?JSON.stringify(data):undefined,cache:"no-store"});
 const value=await r.json().catch(()=>({}));
 if(!r.ok)throw Error(value.error||"No fue posible completar la solicitud");
 return value;
}
async function iniciar(){
 try{
  const hash=new URLSearchParams(location.hash.slice(1));
  const token=hash.get("acceso");
  if(token){
   history.replaceState(null,"",location.pathname+location.search);
   await api("/api/cliente/iniciar","POST",{token});
  }
  const data=await api("/api/cliente/materiales");
  const p=data.proyecto;
  document.querySelector("#folio").textContent=p.folio;
  document.querySelector("#nombre-proyecto").textContent=p.proyecto||"Proyecto de "+p.nombre;
  const estados={preparacion:"Preparación",recabando_materiales:"Recabando materiales",en_desarrollo:"En desarrollo",en_revision:"En revisión",finalizado:"Finalizado",cancelado:"Cancelado"};
  document.querySelector("#estado-proyecto").textContent=estados[p.estado]||p.estado;
  contenedor.replaceChildren();
  for(const [clave,titulo,ayuda] of etiquetas){
   const registro=data.secciones.find(s=>s.clave===clave);
   const area=document.createElement("section");area.className="bloque";
   const encabezado=document.createElement("h2");encabezado.textContent=titulo;
   const descripcion=document.createElement("p");descripcion.className="mensaje";descripcion.textContent=ayuda;
   const label=document.createElement("label");const id="contenido-"+clave;label.htmlFor=id;label.textContent="Tu información";
   const input=document.createElement("textarea");input.id=id;input.maxLength=10000;input.value=registro?.contenido||"";
   const controls=document.createElement("div");controls.className="controles";
   const button=document.createElement("button");button.type="button";button.textContent="Guardar apartado";
   const estado=document.createElement("span");estado.className="mensaje";estado.setAttribute("role","status");estado.textContent=registro?"Información recibida":"Pendiente";
   button.addEventListener("click",async()=>{
     button.disabled=true;estado.textContent="Guardando…";
     try{await api("/api/cliente/secciones/"+clave,"PUT",{contenido:input.value});estado.textContent="Guardado correctamente";}catch(e){estado.textContent=e.message;estado.classList.add("error");}
     finally{button.disabled=false;}
   });
   if(p.estado==="finalizado"){button.disabled=true;input.readOnly=true;}
   controls.append(button,estado);area.append(encabezado,descripcion,label,input,controls);contenedor.append(area);
  }
  mensaje.hidden=true;panel.hidden=false;
 }catch(e){panel.hidden=true;mensaje.hidden=false;mensaje.className="error";mensaje.textContent=e.message+". Solicita un nuevo enlace a Lapazimpresion3d si tu acceso venció.";}
}
document.querySelector("#salir").addEventListener("click",async()=>{try{await api("/api/cliente/salir","POST");}finally{location.replace("/cliente/materiales/");}});
iniciar();
})();