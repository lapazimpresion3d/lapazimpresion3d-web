export function situacionGarantia(entrega,limite,reporte){
 if(!limite)return "sin_fecha";
 if(reporte<entrega)return "antes_entrega";
 return reporte<=limite?"dentro_plazo":"fuera_plazo";
}
export function decisionPosventaValida(d){
 const txt=(v,min,max)=>typeof v==="string"&&v.trim().length>=min&&v.length<=max;
 return !!d&&Number.isSafeInteger(d.version)&&d.version>0&&["por_evaluar","garantia","mantenimiento","adicional","sin_cargo","no_procede"].includes(d.cobertura)&&["abierto","en_proceso","espera_cliente","resuelto","cancelado"].includes(d.estado)&&txt(d.motivo,d.cobertura==="por_evaluar"?0:3,1000)&&txt(d.autorizacion,d.cobertura==="adicional"?3:0,500)&&txt(d.solucion,["resuelto","cancelado"].includes(d.estado)?3:0,2000)&&Number.isSafeInteger(d.minutos)&&d.minutos>=0&&d.minutos<=10080&&(d.estado!=="resuelto"||d.cobertura!=="por_evaluar");
}
