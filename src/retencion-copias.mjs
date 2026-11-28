export function evaluarRetencion(c,hoy){
 if(c.protegida||c.pendientes>0)return {estado:"protegida",vence:null};
 if(c.resultado==="fallido")return {estado:"sin_copia_confirmada",vence:null};
 if(!c.habilitada||!Number.isSafeInteger(c.retencion_dias)||c.retencion_dias<1||c.fecha_respaldo<c.inicio)return {estado:"sin_politica_aplicable",vence:null};
 const d=new Date(c.fecha_respaldo+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+c.retencion_dias);
 const vence=d.toISOString().slice(0,10);
 return {estado:vence<=hoy?"revisar_retencion":"vigente",vence};
}
