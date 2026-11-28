// No outbound fetch here. A separately secured egress service is mandatory.
export function sitioPermitido(s,env){
 if(typeof s!=="string"||s.length>500)return false;
 // Canonical HTTPS URL only. Exclude IP literals, credentials, ports, queries and fragments.
 const m=/^https:\/\/([a-z0-9.-]+)(\/[a-zA-Z0-9._~/%-]*)$/.exec(s);
 if(!m||!/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(m[1])||/\.(local|internal|localhost|test|invalid|onion|example)$/.test(m[1]))return false;
 try{const lista=JSON.parse(env.MONITOREO_SITIOS_AUTORIZADOS||"[]");return Array.isArray(lista)&&lista.length<=100&&lista.includes(s);}catch{return false;}
}
export function clasificarRespuesta(codigo,ms,umbral){
 return codigo>=200&&codigo<300?(ms>umbral?"degradado":"disponible"):codigo>=300&&codigo<400?"degradado":"no_disponible";
}
export async function ejecutarMonitoreo(env){
 if(env.MONITOREO_AUTOMATICO_HABILITADO!=="si"||!env.QUIZ_DB||typeof env.MONITOREO_EGRESO?.comprobar!=="function")return {ejecutados:0,habilitado:false};
 const db=env.QUIZ_DB,ahora=new Date().toISOString();
 const filas=await db.prepare("SELECT m.*,d.url_final FROM servicio_monitoreo_programado m JOIN propuestas_economicas e ON e.propuesta_id=m.propuesta_id JOIN proyectos_cliente p ON p.propuesta_id=m.propuesta_id JOIN proyecto_entregas d ON d.proyecto_id=p.id WHERE m.habilitado=1 AND m.proxima<=?1 AND e.fecha_aceptacion IS NOT NULL AND e.mensualidad>0 AND e.paquete<>'solo_fisico' AND p.estado<>'cancelado' AND d.fecha_entrega IS NOT NULL ORDER BY m.proxima LIMIT 10").bind(ahora).all();
 let ejecutados=0;
 for(const m of filas.results){
  let actual;try{actual=new URL(m.url_final).href;}catch{continue;}
  if(actual!==m.sitio||!sitioPermitido(m.sitio,env))continue;
  const siguiente=new Date(Date.now()+m.intervalo_min*60000).toISOString();
  const claim=await db.prepare("UPDATE servicio_monitoreo_programado SET proxima=?1 WHERE propuesta_id=?2 AND version=?3 AND proxima=?4 AND habilitado=1").bind(siguiente,m.propuesta_id,m.version,m.proxima).run();
  if(claim.meta.changes!==1)continue;
  const fecha=new Date().toISOString();
  let r;try{r=await env.MONITOREO_EGRESO.comprobar(m.sitio);}catch{console.error("Fallo del ejecutor de monitoreo");continue;}
  if(!r||r.ok!==true||!Number.isSafeInteger(r.ms)||r.ms<0||r.ms>120000||!(r.codigo===null||Number.isSafeInteger(r.codigo)&&r.codigo>=100&&r.codigo<=599))continue;
  const estado=r.codigo===null?"no_disponible":clasificarRespuesta(r.codigo,r.ms,m.umbral_ms);
  const nota=r.codigo===null?"Automático: fallo de conexión observado":"Automático: respuesta HTTP; no verifica funciones internas";
  const guardado=await db.prepare("INSERT INTO servicio_monitoreo(id,propuesta_id,sitio,fecha_comprobacion,estado,codigo_http,tiempo_ms,observaciones,fecha_registro) SELECT ?1,m.propuesta_id,m.sitio,?2,?3,?4,?5,?6,?7 FROM servicio_monitoreo_programado m JOIN proyectos_cliente p ON p.propuesta_id=m.propuesta_id JOIN proyecto_entregas d ON d.proyecto_id=p.id JOIN propuestas_economicas e ON e.propuesta_id=m.propuesta_id WHERE m.propuesta_id=?8 AND m.version=?9 AND m.habilitado=1 AND m.sitio=?10 AND m.proxima=?11 AND d.url_final=?12 AND p.estado<>'cancelado' AND d.fecha_entrega IS NOT NULL AND e.fecha_aceptacion IS NOT NULL AND e.mensualidad>0 AND e.paquete<>'solo_fisico'").bind(crypto.randomUUID(),fecha,estado,r.codigo,r.ms,nota,new Date().toISOString(),m.propuesta_id,m.version,m.sitio,siguiente,m.url_final).run();
  ejecutados+=guardado.meta.changes;
 }
 return {ejecutados,habilitado:true};
}
