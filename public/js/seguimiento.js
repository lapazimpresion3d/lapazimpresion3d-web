(function(root){
"use strict";
const etapas=Object.freeze({
 fisica:Object.freeze(["Recopilación de referencias","Diseño y modelado","Revisión del cliente","Fabricación","Entrega","Posventa"]),
 web:Object.freeze(["Recopilación de contenido","Diseño","Desarrollo e implementación","Revisión y vista previa","Aprobación","Publicación","Entrega y garantía"])
});
function estadoEtapa(s,i){return s.completadas.includes(i)?"Completada":s.actual===i?"En proceso":"Pendiente";}
const api=Object.freeze({etapas,estadoEtapa});
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.LP_SEGUIMIENTO=api;
})(globalThis);
