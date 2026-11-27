(()=>{"use strict";
// Abrir tanto el servicio como cualquier desplegable anidado de un enlace interno.
function abrirDestino(destino){
 if(!destino)return false;
 let cambio=false;
 for(let n=destino;n;n=n.parentElement){if(n.tagName==="DETAILS"&&!n.open){n.open=true;cambio=true;}}
 const servicio=destino.closest(".servicio-colapsable");
 const detalle=servicio?.querySelector(":scope > .servicio-desplegable");
 if(detalle&&!detalle.open){detalle.open=true;cambio=true;}
 return cambio;
}
function porHash(hash){
 if(!hash||hash==="#")return null;
 try{return document.getElementById(decodeURIComponent(hash.slice(1)));}catch{return null;}
}
function abrirHash(){
 const destino=porHash(location.hash);
 if(abrirDestino(destino))requestAnimationFrame(()=>destino.scrollIntoView({block:"start"}));
}
document.addEventListener("click",evento=>{
 if(evento.defaultPrevented||evento.button!==0||evento.ctrlKey||evento.metaKey||evento.altKey||evento.shiftKey)return;
 const enlace=evento.target.closest("a[href]");
 if(!enlace||enlace.target&&enlace.target!=="_self"||enlace.hasAttribute("download"))return;
 if(enlace.origin!==location.origin||enlace.pathname!==location.pathname||enlace.search!==location.search)return;
 abrirDestino(porHash(enlace.hash));
},true);
window.addEventListener("hashchange",abrirHash);
window.addEventListener("pageshow",abrirHash);
abrirHash();
})();
