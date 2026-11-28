export function correccionCostoValida(d){
 const txt=(v,min,max)=>typeof v==="string"&&v.trim().length>=min&&v.length<=max;
 return !!d&&Number.isSafeInteger(d.version)&&d.version>=0&&["editar","anular"].includes(d.accion)&&txt(d.motivo,3,1000)&&(d.accion==="anular"||["alojamiento","dominio","almacenamiento","licencias","comisiones","otros"].includes(d.categoria)&&Number.isSafeInteger(d.importe)&&d.importe>=1&&d.importe<=100000000&&txt(d.descripcion,3,500));
}
