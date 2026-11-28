(()=>{"use strict";
const el=(t,v,c)=>{const n=document.createElement(t);if(v!==undefined)n.textContent=v;if(c)n.className=c;return n;};
async function api(url,d){const r=await fetch(url,{method:d?"POST":"GET",credentials:"same-origin",cache:"no-store",headers:d?{"Content-Type":"application/json"}:undefined,body:d?JSON.stringify(d):undefined});const z=await r.json().catch(()=>({}));if(!r.ok)throw Error(z.error||"Error "+r.status);return z;}
function agregar(a,ruta,q,vigente,refrescar){
 const p=el("details",undefined,"proyecto-bloque"),body=el("div",undefined,"economica-panel"),path=ruta+"/"+encodeURIComponent(q.id)+"/reconciliaciones";p.append(el("summary","Verificación y reconciliación"),body);a.append(p);let busy=false;
 async function cargar(){if(busy)return;busy=true;try{const d=await api(path);if(!vigente()||!p.isConnected)return;body.replaceChildren(el("p","Consulta la copia existente sin crear, descargar, borrar ni restaurar archivos. Ausencia o error no confirma que la ejecución haya terminado; permanece incierta.","metadatos"));
 for(const r of d.items){const z=el("article",undefined,"soporte-intervencion");z.append(el("strong",r.resultado),el("p",r.motivo),el("p",r.fecha_registro,"metadatos"));body.append(z);}
 if(d.limitado)body.append(el("p","Últimas 100 verificaciones."));
 if(d.estado!=="incierto"||!d.habilitada){body.append(el("p",d.estado!=="incierto"?"Solo se verifican ejecuciones inciertas.":"Adaptador o autorización no habilitados.","metadatos"));return;}
 const f=el("form",undefined,"economica-form"),label=el("label","Motivo de verificación"),mot=el("textarea"),b=el("button","Verificar copia existente"),msg=el("p",undefined,"metadatos");mot.required=true;mot.minLength=3;mot.maxLength=1000;label.append(mot);b.type="submit";f.append(label,b,msg);body.append(f);let id=null;mot.addEventListener("input",()=>{if(!b.disabled)id=null;});f.addEventListener("submit",async e=>{e.preventDefault();if(!confirm("¿Consultar la copia existente sin crear otra?"))return;b.disabled=true;try{id=id||crypto.randomUUID();const r=await api(path,{id,motivo:mot.value,confirmar:"VERIFICAR"});if(r.resultado==="verificada"){await refrescar();}else await cargar();}catch(e){msg.textContent=e.message;b.disabled=false;}});
 }catch(e){if(vigente()&&p.isConnected){const b=el("button","Reintentar","secundario");b.type="button";b.addEventListener("click",cargar);body.replaceChildren(el("p",e.message),b);}}finally{busy=false;}}
 p.addEventListener("toggle",()=>{if(p.open)cargar();});
}
globalThis.LP_RECONCILIACION={agregar};
})();