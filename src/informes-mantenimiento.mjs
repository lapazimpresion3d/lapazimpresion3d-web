export function mesInformeValido(mes,hoy){return typeof mes==="string"&&/^\d{4}-(0[1-9]|1[0-2])$/.test(mes)&&mes>="2000-01"&&mes<=hoy.slice(0,7);}
export function informeValido(d){const txt=(v,min,max)=>typeof v==="string"&&v.trim().length>=min&&v.length<=max;return !!d&&d.confirmar==="PUBLICAR"&&txt(d.titulo,3,120)&&txt(d.resumen,3,4000);}
export function proyectarInforme(q){return {id:q.id,mes:q.mes,titulo:q.titulo,resumen:q.resumen,fecha_publicacion:q.fecha_publicacion};}
export function resumenMonitoreo(q){return {comprobaciones:q.total,disponibles:q.disponibles,degradadas:q.degradadas,no_disponibles:q.no_disponibles};}
export async function datosInforme(db,pid,mes,hoy){
 const inicio=mes+"-01",fin=new Date(Date.UTC(Number(mes.slice(0,4)),Number(mes.slice(5,7)),1)).toISOString().slice(0,10);
 // Mazatlan: use actual local month boundaries for UTC timestamps (Mexico's time zone rules via Intl).
 function utcLimite(fecha){const d=new Date(fecha+"T00:00:00Z"),fmt=new Intl.DateTimeFormat("en-US",{timeZone:"America/Mazatlan",year:"numeric",month:"2-digit",day:"2-digit",hour:"2-digit",minute:"2-digit",second:"2-digit",hourCycle:"h23"});for(let i=0;i<2;i++){const p=Object.fromEntries(fmt.formatToParts(d).map(x=>[x.type,x.value]));const local=Date.UTC(+p.year,+p.month-1,+p.day,+p.hour,+p.minute,+p.second);d.setTime(d.getTime()+Date.parse(fecha+"T00:00:00Z")-local);}return d.toISOString();}
 const desde=utcLimite(inicio),hasta=utcLimite(fin);
 const tablas=new Set((await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name IN ('servicio_soporte','servicio_intervenciones','servicio_respaldos','servicio_pruebas_restauracion','servicio_actualizaciones','servicio_monitoreo')").all()).results.map(x=>x.name));
 const q=(sql,a=inicio,b=fin)=>db.prepare(sql).bind(pid,a,b).first();
 const soporte=tablas.has("servicio_soporte")?await q("SELECT COUNT(*) AS recibidas FROM servicio_soporte WHERE propuesta_id=?1 AND fecha_registro>=?2 AND fecha_registro<?3",desde,hasta):null;
 const intervenciones=tablas.has("servicio_soporte")&&tablas.has("servicio_intervenciones")?await q("SELECT COUNT(*) AS total,COALESCE(SUM(i.minutos),0) AS minutos,COALESCE(SUM(i.clasificacion='adicional'),0) AS adicionales FROM servicio_intervenciones i JOIN servicio_soporte t ON t.id=i.soporte_id WHERE t.propuesta_id=?1 AND i.fecha_trabajo>=?2 AND i.fecha_trabajo<?3"):null;
 const resultados="COUNT(*) AS total,COALESCE(SUM(resultado='correcto'),0) AS correctos,COALESCE(SUM(resultado='parcial'),0) AS parciales,COALESCE(SUM(resultado='fallido'),0) AS fallidos";
 const respaldos=tablas.has("servicio_respaldos")?await q("SELECT "+resultados+" FROM servicio_respaldos WHERE propuesta_id=?1 AND fecha_respaldo>=?2 AND fecha_respaldo<?3"):null;
 const restauraciones=tablas.has("servicio_respaldos")&&tablas.has("servicio_pruebas_restauracion")?await q("SELECT COUNT(*) AS total,COALESCE(SUM(p.resultado='correcto'),0) AS correctos,COALESCE(SUM(p.resultado='parcial'),0) AS parciales,COALESCE(SUM(p.resultado='fallido'),0) AS fallidos FROM servicio_pruebas_restauracion p JOIN servicio_respaldos r ON r.id=p.respaldo_id WHERE r.propuesta_id=?1 AND p.fecha_prueba>=?2 AND p.fecha_prueba<?3"):null;
 const actualizaciones=tablas.has("servicio_actualizaciones")?await q("SELECT "+resultados+",COALESCE(SUM(categoria='seguridad' AND resultado='correcto'),0) AS seguridad FROM servicio_actualizaciones WHERE propuesta_id=?1 AND fecha_aplicacion>=?2 AND fecha_aplicacion<?3"):null;
 const monitoreo=tablas.has("servicio_monitoreo")?resumenMonitoreo(await q("SELECT COUNT(*) AS total,COALESCE(SUM(estado='disponible'),0) AS disponibles,COALESCE(SUM(estado='degradado'),0) AS degradadas,COALESCE(SUM(estado='no_disponible'),0) AS no_disponibles FROM servicio_monitoreo WHERE propuesta_id=?1 AND fecha_comprobacion>=?2 AND fecha_comprobacion<?3",desde,hasta)):null;
 return {mes,hoy,parcial:mes===hoy.slice(0,7),soporte,intervenciones,respaldos,restauraciones,actualizaciones,monitoreo};
}
