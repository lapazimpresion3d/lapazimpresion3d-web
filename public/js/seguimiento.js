(function(root){
"use strict";
const etapas=Object.freeze({
 fisica:Object.freeze(["Recopilación de referencias","Diseño y modelado","Revisión del cliente","Fabricación","Entrega","Posventa"]),
 web:Object.freeze(["Recopilación de contenido","Diseño","Desarrollo e implementación","Revisión y vista previa","Aprobación","Publicación","Entrega y garantía"]),
 combinada:Object.freeze(["Recopilación de referencias y contenido","Diseño y modelado","Desarrollo digital","Revisión y vista previa","Aprobación del cliente","Fabricación","Publicación","Entrega","Posventa y garantía"])
});
const simples=Object.freeze({
 fisica:Object.freeze(["Materiales recibidos","Diseño y aprobación","Fabricación","Entrega"]),
 web:Object.freeze(["Contenido recibido","Diseño y aprobación","Desarrollo y publicación","Entrega"]),
 combinada:Object.freeze(["Materiales y contenido recibidos","Diseño y aprobación","Fabricación y desarrollo digital","Publicación y entrega"])
});
const origenes=Object.freeze({portal:"Portal del cliente",whatsapp:"WhatsApp",correo:"Correo electrónico",personal:"Entrega personal",cotizacion:"Información de la cotización",mixto:"Varios medios",ninguno:"No requiere materiales adicionales"});
function etapasDe(s){return (s.formato==="simplificado"?simples:etapas)[s.modalidad];}
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
const api=Object.freeze({etapas,simples,origenes,etapasDe,estadoEtapa,resumenEntrega});
if(typeof module!=="undefined"&&module.exports)module.exports=api;else root.LP_SEGUIMIENTO=api;
})(globalThis);
