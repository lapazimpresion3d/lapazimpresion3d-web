// All monetary amounts are integer MXN cents. Cash-based management estimate, not tax accounting.
export function calcularRentabilidad(cobrado,costos,minutos,config){
 const ingreso=Math.round(cobrado*100/116),iva=cobrado-ingreso;
 const totalMinutos=minutos+(config?.minutos_extra||0);
 const manoObra=config?Math.round(totalMinutos*config.tarifa_hora/60):null;
 const saldo=manoObra===null?null:ingreso-costos-manoObra;
 return {cobrado,ingreso,iva,costos,minutos,total_minutos:totalMinutos,mano_obra:manoObra,saldo,margen:saldo!==null&&ingreso>0?Math.round(saldo/ingreso*1000)/10:null};
}
