// Scheduler only. Actual data access and backup creation belong to an independently authorized private adapter.
export function respaldosHabilitados(env){
 return env.RESPALDOS_AUTOMATICOS_HABILITADOS==="si"&&!!env.QUIZ_DB&&typeof env.RESPALDOS_EJECUTOR?.crearRespaldo==="function";
}
export function resultadoRespaldoValido(r){
 return !!r&&r.ok===true&&["correcto","parcial","fallido"].includes(r.resultado)&&typeof r.referencia==="string"&&r.referencia.length<=200&&/^[a-zA-Z0-9._:-]*$/.test(r.referencia)&&typeof r.observaciones==="string"&&r.observaciones.length<=2000&&(r.resultado==="fallido"||r.referencia.length>0)&&(r.resultado==="correcto"||r.observaciones.trim().length>=3);
}
export function fechaLocalRespaldo(ahora){
 const p=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Mazatlan",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(new Date(ahora));return ["year","month","day"].map(k=>p.find(x=>x.type===k).value).join("-");
}
export function proximaCopia(p){
 if(!p.ultimo_correcto)return p.inicio;
 const d=new Date(p.ultimo_correcto+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+p.frecuencia_dias);return d.toISOString().slice(0,10);
}
export async function ejecutarRespaldos(env){
 if(!respaldosHabilitados(env))return {habilitado:false,ejecutados:0};
 const db=env.QUIZ_DB,ahora=new Date().toISOString(),hoy=fechaLocalRespaldo(ahora);
 // An uncertain outcome never gets retried automatically. The operator must reconcile the adapter's durable job ID.
 await db.prepare("UPDATE servicio_ejecuciones_respaldos SET estado='incierto',fecha_actualizacion=?1,observaciones='Ejecución interrumpida; verificar resultado en el ejecutor antes de repetir.' WHERE estado='en_proceso' AND fecha_actualizacion<?2").bind(ahora,new Date(Date.now()-3600000).toISOString()).run();
 const rows=await db.prepare("SELECT p.*,v.id AS vinculo_id,v.negocio_externo,(SELECT MAX(r.fecha_respaldo) FROM servicio_respaldos r WHERE r.propuesta_id=p.propuesta_id AND r.alcance=p.alcance AND r.resultado='correcto' AND r.fecha_respaldo>=p.inicio AND r.fecha_respaldo<=?1) AS ultimo_correcto FROM servicio_politicas_respaldos p JOIN propuestas_economicas e ON e.propuesta_id=p.propuesta_id JOIN servicio_vinculos v ON v.propuesta_id=p.propuesta_id JOIN suscripciones_cliente s ON s.propuesta_id=p.propuesta_id WHERE p.habilitada=1 AND p.inicio<=?1 AND e.fecha_aceptacion IS NOT NULL AND e.mensualidad>0 AND e.paquete<>'solo_fisico' AND v.estado='registrado' AND v.plataforma='lapaz-comercios' AND s.estado='activo' AND NOT EXISTS(SELECT 1 FROM servicio_ejecuciones_respaldos x WHERE x.propuesta_id=p.propuesta_id AND x.alcance=p.alcance AND x.estado IN ('en_proceso','incierto')) ORDER BY p.propuesta_id,p.alcance LIMIT 500").bind(hoy).all();
 let ejecutados=0;
 for(const p of rows.results){
  if(ejecutados>=5)break;
  const fecha=proximaCopia(p);if(fecha>hoy)continue;
  // Independent deployment allowlist; a policy that only enables reminders cannot authorize data access.
  let lista;try{lista=JSON.parse(env.RESPALDOS_NEGOCIOS_AUTORIZADOS||"[]");}catch{continue;}
  if(!Array.isArray(lista)||lista.length>100||!lista.includes(p.negocio_externo))continue;
  const id=crypto.randomUUID();
  const claim=await db.prepare("INSERT INTO servicio_ejecuciones_respaldos(id,propuesta_id,vinculo_id,alcance,fecha_programada,version_politica,estado,intentos,fecha_creacion,fecha_actualizacion) SELECT ?1,p.propuesta_id,v.id,p.alcance,?2,p.version,'en_proceso',1,?3,?3 FROM servicio_politicas_respaldos p JOIN servicio_vinculos v ON v.propuesta_id=p.propuesta_id JOIN suscripciones_cliente s ON s.propuesta_id=p.propuesta_id WHERE p.propuesta_id=?4 AND p.alcance=?5 AND p.version=?6 AND p.habilitada=1 AND v.id=?7 AND v.estado='registrado' AND v.plataforma='lapaz-comercios' AND s.estado='activo' AND NOT EXISTS(SELECT 1 FROM servicio_ejecuciones_respaldos x WHERE x.propuesta_id=p.propuesta_id AND x.alcance=p.alcance AND x.estado IN ('en_proceso','incierto')) ON CONFLICT(propuesta_id,alcance,fecha_programada,version_politica) DO NOTHING").bind(id,fecha,ahora,p.propuesta_id,p.alcance,p.version,p.vinculo_id).run();
  if(claim.meta.changes!==1)continue;
  ejecutados++;
  let r;try{r=await env.RESPALDOS_EJECUTOR.crearRespaldo({id,empresa:p.negocio_externo,alcance:p.alcance,fecha_programada:fecha});}catch{}
  const fin=new Date().toISOString();
  if(!resultadoRespaldoValido(r)){
   await db.prepare("UPDATE servicio_ejecuciones_respaldos SET estado='incierto',fecha_actualizacion=?1,observaciones='Respuesta no verificable del ejecutor. Reconciliar antes de repetir.' WHERE id=?2 AND estado='en_proceso'").bind(fin,id).run();continue;
  }
  // Record result atomically with the execution, only while its original link is still active.
  const guard="EXISTS(SELECT 1 FROM servicio_vinculos v WHERE v.id=x.vinculo_id AND v.propuesta_id=x.propuesta_id AND v.estado='registrado')";
  const batch=await db.batch([
   db.prepare("INSERT INTO servicio_respaldos(id,propuesta_id,fecha_respaldo,alcance,resultado,metodo,referencia,observaciones,fecha_registro) SELECT x.id,x.propuesta_id,?1,x.alcance,?2,'automatizado',?3,?4,?5 FROM servicio_ejecuciones_respaldos x WHERE x.id=?6 AND x.estado='en_proceso' AND "+guard).bind(fechaLocalRespaldo(fin),r.resultado,r.referencia,r.observaciones,fin,id),
   db.prepare("UPDATE servicio_ejecuciones_respaldos SET estado=?1,referencia=?2,observaciones=?3,fecha_actualizacion=?4 WHERE id=?5 AND estado='en_proceso' AND EXISTS(SELECT 1 FROM servicio_respaldos b WHERE b.id=?5)").bind(r.resultado,r.referencia,r.observaciones,fin,id)
  ]);
  if(batch[0].meta.changes!==1||batch[1].meta.changes!==1)await db.prepare("UPDATE servicio_ejecuciones_respaldos SET estado='incierto',fecha_actualizacion=?1,observaciones='Vínculo revocado o resultado no registrado. Reconciliar.' WHERE id=?2 AND estado='en_proceso'").bind(fin,id).run();
 }
 return {habilitado:true,ejecutados};
}
