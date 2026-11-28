// All monetary amounts are integer MXN cents. Cash-based management estimate, not tax accounting.
export function calcularRentabilidad(cobrado,costos,minutos,config){
 const ingreso=Math.round(cobrado*100/116),iva=cobrado-ingreso;
 const totalMinutos=minutos+(config?.minutos_extra||0);
 const manoObra=config?Math.round(totalMinutos*config.tarifa_hora/60):null;
 const saldo=manoObra===null?null:ingreso-costos-manoObra;
 return {cobrado,ingreso,iva,costos,minutos,total_minutos:totalMinutos,mano_obra:manoObra,saldo,margen:saldo!==null&&ingreso>0?Math.round(saldo/ingreso*1000)/10:null};
}

export function resumirRentabilidad(items){
 const t={servicios:items.length,con_costeo:0,sin_costeo:0,cobrado:0,ingreso:0,iva:0,costos:0,total_minutos:0,mano_obra_conocida:0,resultado_parcial:0,ingreso_con_costeo:0,negativos:0};
 for(const x of items){const r=x.resultado;for(const k of ["cobrado","ingreso","iva","costos","total_minutos"])t[k]+=r[k];if(r.saldo===null){t.sin_costeo++;continue;}t.con_costeo++;t.mano_obra_conocida+=r.mano_obra;t.resultado_parcial+=r.saldo;t.ingreso_con_costeo+=r.ingreso;if(r.saldo<0)t.negativos++;}
 return {...t,resultado:t.sin_costeo?null:t.resultado_parcial,margen:!t.sin_costeo&&t.ingreso>0?Math.round(t.resultado_parcial/t.ingreso*1000)/10:null};
}
