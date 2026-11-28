import {WorkerEntrypoint} from "cloudflare:workers";
// Private Service Binding RPC only. Caller must authorize the enterprise in its own server.
const PLATAFORMA="lapaz-comercios";
const idValido=v=>typeof v==="string"&&/^[a-z0-9][a-z0-9._:-]{0,127}$/.test(v);
const hoyLocal=()=>new Intl.DateTimeFormat("en-CA",{timeZone:"America/Mazatlan",year:"numeric",month:"2-digit",day:"2-digit"}).format(new Date());
export function proyectarSuscripcion(q,pagos,hoy){
 const proxima=q.inicio?(pagos[0]?.fin||q.inicio):null;
 const situacion=!q.inicio?"sin_iniciar":q.estado==="cancelado"?"cancelado":q.estado==="suspendido"?"suspendido":proxima<=hoy?(pagos.length?"vencido":"pendiente"):"al_corriente";
 const base=q.mensualidad??q.tarifa_acordada,total=q.total_mensual??q.total_acordado;
 return {paquete:q.paquete,moneda:"MXN",mensualidad_centavos:base,iva_centavos:total-base,total_centavos:total,inicio:q.inicio??null,estado:q.estado??null,situacion,proxima,hoy,pagos:pagos.map(p=>({inicio:p.inicio,fin:p.fin,importe_centavos:p.importe,fecha:p.fecha}))};
}
export async function consultarSuscripcionPrivada(env,empresa){
 if(env.INTEGRACION_COMERCIAL_HABILITADA!=="si"||!env.QUIZ_DB)return {ok:false,error:"no_disponible"};
 if(!idValido(empresa))return {ok:false,error:"no_autorizado"};
 const db=env.QUIZ_DB;
 // Resolve identity on every request. Never accept a proposal ID or platform from caller.
 const q=await db.prepare("SELECT v.id AS vinculo,e.paquete,e.mensualidad AS tarifa_acordada,e.total_mensual AS total_acordado,s.inicio,s.estado,s.mensualidad,s.total_mensual FROM servicio_vinculos v JOIN propuestas_economicas e ON e.propuesta_id=v.propuesta_id LEFT JOIN suscripciones_cliente s ON s.propuesta_id=e.propuesta_id WHERE v.plataforma=?1 AND v.negocio_externo=?2 AND v.estado='registrado' AND e.fecha_aceptacion IS NOT NULL AND e.mensualidad>0 AND e.paquete<>'solo_fisico'").bind(PLATAFORMA,empresa).first();
 if(!q)return {ok:false,error:"no_autorizado"};
 const r=await db.prepare("SELECT p.inicio,p.fin,p.importe,p.fecha FROM pagos_mensualidad p JOIN servicio_vinculos v ON v.propuesta_id=p.propuesta_id WHERE v.id=?1 AND v.plataforma=?2 AND v.negocio_externo=?3 AND v.estado='registrado' ORDER BY p.fin DESC LIMIT 201").bind(q.vinculo,PLATAFORMA,empresa).all();
 // Recheck revocation before returning; do not expose a new link under an old identity.
 const vigente=await db.prepare("SELECT 1 AS ok FROM servicio_vinculos WHERE id=?1 AND plataforma=?2 AND negocio_externo=?3 AND estado='registrado'").bind(q.vinculo,PLATAFORMA,empresa).first();
 if(!vigente)return {ok:false,error:"no_autorizado"};
 return {ok:true,version:1,suscripcion:proyectarSuscripcion(q,r.results.slice(0,200),hoyLocal()),historial_limitado:r.results.length>200};
}
export class IntegracionComercial extends WorkerEntrypoint {
 async consultarSuscripcion(empresa){
  try{return await consultarSuscripcionPrivada(this.env,empresa);}catch{return {ok:false,error:"no_disponible"};}
 }
}
