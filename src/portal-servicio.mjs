// Private RPC aggregation. The originating Worker must authorize empresa.administrar.
export async function resumenPortal(env,empresa,ops){
 if(env.INTEGRACION_COMERCIAL_HABILITADA!=="si"||!env.QUIZ_DB)return {ok:false,error:"no_disponible"};
 const inicial=await ops.contexto(env,empresa);if(inicial.error)return {ok:false,error:inicial.error};
 const tareas=[["suscripcion",ops.suscripcion,"suscripcion"],["soporte",ops.soporte,"solicitudes"],["novedades",ops.novedades,"novedades"],["informes",ops.informes,"informes"]];
 const resultados=await Promise.allSettled(tareas.map(([,fn])=>fn(env,empresa)));
 if(!await ops.vigente(inicial.db,inicial.v,empresa))return {ok:false,error:"no_autorizado"};
 const secciones={};
 for(let i=0;i<tareas.length;i++){
  const [nombre,,campo]=tareas[i],r=resultados[i];
  if(r.status==="fulfilled"&&r.value?.error==="no_autorizado")return {ok:false,error:"no_autorizado"};
  if(r.status!=="fulfilled"||r.value?.ok!==true){secciones[nombre]={disponible:false};continue;}
  const dato=r.value[campo];secciones[nombre]={disponible:true,datos:dato,limitado:!!(r.value.limitado||r.value.historial_limitado)};
 }
 return {ok:true,version:1,secciones};
}
