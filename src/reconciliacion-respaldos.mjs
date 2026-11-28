export function clasificarReconciliacion(r,id){
 if(r?.ok===true&&r.estado==="no_encontrada")return "no_encontrada";
 if(r?.ok===true&&r.estado==="verificada"&&r.resultado==="parcial"&&r.referencia==="copia:"+id&&typeof r.observaciones==="string"&&r.observaciones.trim().length>=3&&r.observaciones.length<=2000)return "verificada";
 return "no_verificable";
}
