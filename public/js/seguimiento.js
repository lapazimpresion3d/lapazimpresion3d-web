(function(root){
"use strict";
const etapas=Object.freeze({
 fisica:Object.freeze(["Recopilación de referencias","Diseño y modelado","Revisión del cliente","Fabricación","Entrega","Posventa"]),
 web:Object.freeze(["Recopilación de contenido","Diseño","Desarrollo e implementación","Revisión y vista previa","Aprobación","Publicación","Entrega y garantía"]),
 combinada:Object.freeze(["Recopilación de referencias y contenido","Diseño y modelado","Desarrollo digital","Revisión y vista previa","Aprobación del cliente","Fabricación","Publicación","Entrega","Posventa y garantía"])
});
function estadoEtapa(s,i){return s.completadas.includes(i)?"Completada":s.actual===i?"En proceso":"Pendiente";}
// Evidencia de entrega independiente de las etapas publicadas manualmente.
function resumenEntrega(q){
 if(!q)return {estado:"sin_revision",titulo:"Sin revisión presentada",detalle:"Aún no hay una versión presentada para aprobación."};
 const version="Revisión "+q.version+" · "+q.revision;
 if(q.fecha_entrega)return {estado:"entregado",titulo:"Entrega registrada",detalle:version};
 if(q.decision==="aprobado")return {estado:"aprobado",titulo:"Revisión aprobada",detalle:version};
 if(q.decision==="requiere_cambios")return {estado:"cambios",titulo:"Cambios solicitados",detalle:version};
 return {estado:"pendiente",titulo:"Pendiente de aprobación",detalle:version};
}
const api=Object.freeze({etapas,estadoEtapa,resumenEntrega});
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.LP_SEGUIMIENTO=api;
})(globalThis);
