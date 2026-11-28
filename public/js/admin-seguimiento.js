(()=>{
"use strict";
const el=(tag,txt,cl)=>{const n=document.createElement(tag);if(txt!==undefined)n.textContent=txt;if(cl)n.className=cl;return n;};
function campo(f,nombre,tag){const l=el("label",nombre),n=el(tag);l.append(n);f.append(l);return n;}
function opcion(s,v,t){const o=el("option",t);o.value=v;s.append(o);}
async function api(path,body){const r=await fetch(path,{method:body?"PUT":"GET",credentials:"same-origin",cache:"no-store",headers:body?{"Content-Type":"application/json"}:undefined,body:body?JSON.stringify(body):undefined});const d=await r.json();if(!r.ok)throw Error(d.error||"Error "+r.status);return d.seguimiento;}
function agregar(art,p){
 const detalle=el("details",undefined,"seguimiento-admin"),caja=el("section",undefined,"economica-panel");detalle.append(el("summary","Seguimiento de Mi proyecto"),caja);art.append(detalle);
 const ruta="/api/admin/proyectos/"+encodeURIComponent(p.id)+"/seguimiento";
 let ocupado=false;
 async function cargar(){if(ocupado)return;ocupado=true;caja.replaceChildren(el("p","Cargando…"));try{pintar(await api(ruta));}catch(e){caja.replaceChildren(el("p",e.message));}finally{ocupado=false;}}
 function pintar(s){
  caja.replaceChildren(el("p","Publica solo avances confirmados. Esto no aprueba materiales, revisiones ni entregas."));
  const f=el("form",undefined,"economica-form"),modalidad=campo(f,"Modalidad","select");opcion(modalidad,"fisica","Fabricación física");opcion(modalidad,"web","Servicio digital");modalidad.value=s.modalidad;modalidad.disabled=!!s.version;
  const actual=campo(f,"Etapa actual","select"),lista=el("fieldset");lista.append(el("legend","Etapas completadas (confirmar individualmente)"));f.append(lista);
  const fecha=campo(f,"Fecha estimada de entrega (opcional)","input");fecha.type="date";fecha.value=s.fecha_estimada;
  const mensaje=campo(f,"Mensaje de actualización para el cliente (opcional)","textarea");mensaje.maxLength=2000;mensaje.rows=4;
  const boton=el("button","Publicar avance"),msg=el("p");msg.setAttribute("role","status");boton.type="submit";f.append(boton,msg);caja.append(f);
  let checks=[];
  function etapas(){actual.replaceChildren();lista.replaceChildren(el("legend","Etapas completadas (confirmar individualmente)"));opcion(actual,"","Sin etapa definida");checks=[];
   LP_SEGUIMIENTO.etapas[modalidad.value].forEach((nombre,i)=>{opcion(actual,String(i),nombre);const l=el("label",undefined,"seguimiento-check"),c=el("input");c.type="checkbox";c.checked=modalidad.value===s.modalidad&&s.completadas.includes(i);l.append(c,document.createTextNode(nombre));lista.append(l);checks.push(c);});
   actual.value=modalidad.value===s.modalidad&&s.actual!==null?String(s.actual):"";
  }
  etapas();modalidad.addEventListener("change",etapas);
  if(p.estado==="cancelado")for(const n of f.querySelectorAll("input,select,textarea,button"))n.disabled=true;
  f.addEventListener("submit",async e=>{e.preventDefault();if(ocupado)return;const a=actual.value===""?null:Number(actual.value),completadas=checks.flatMap((c,i)=>c.checked?[i]:[]);if(completadas.includes(a)){msg.textContent="La etapa actual no puede estar completada.";return;}if(!confirm("¿Publicar esta actualización en el portal privado del cliente?"))return;
   ocupado=true;boton.disabled=true;try{pintar(await api(ruta,{modalidad:modalidad.value,actual:a,completadas,fecha_estimada:fecha.value,mensaje:mensaje.value,version:s.version}));}catch(e){msg.textContent=e.message;}finally{ocupado=false;boton.disabled=false;}
  });
  caja.append(el("h4","Historial publicado"));
  if(!s.historial.length)caja.append(el("p","Sin avances publicados."));
  for(const h of s.historial)caja.append(el("p",new Date(h.fecha).toLocaleString("es-MX",{timeZone:"America/Mazatlan"})+" · "+(h.actual===null?"Sin etapa":LP_SEGUIMIENTO.etapas[s.modalidad][h.actual])+" · "+(h.mensaje||"Actualización de etapas/fecha"),"metadatos"));
 }
 detalle.addEventListener("toggle",()=>{if(detalle.open)cargar();});
}
globalThis.LP_ADMIN_SEGUIMIENTO={agregar};
})();
