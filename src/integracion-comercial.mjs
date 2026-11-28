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
const CATEGORIAS=["funcionamiento","ayuda","modificacion","suscripcion","nueva_funcion","mejora","otro"];
const UUID=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const texto=(v,min,max)=>typeof v==="string"&&v.trim().length>=min&&v.length<=max;
export function solicitudClienteValida(d){
 return !!d&&typeof d==="object"&&!Array.isArray(d)&&Object.keys(d).every(k=>["id","titulo","descripcion","categoria","modulo","impacto"].includes(k))&&typeof d.id==="string"&&UUID.test(d.id)&&texto(d.titulo,3,120)&&texto(d.descripcion,3,2000)&&CATEGORIAS.includes(d.categoria)&&texto(d.modulo,0,120)&&["bajo","parcial","bloqueante"].includes(d.impacto);
}
const guardiaVinculo="v.plataforma=?1 AND v.negocio_externo=?2 AND v.estado='registrado' AND e.fecha_aceptacion IS NOT NULL AND e.mensualidad>0 AND e.paquete<>'solo_fisico'";
async function contextoSoporte(env,empresa){
 if(env.INTEGRACION_COMERCIAL_HABILITADA!=="si"||!env.QUIZ_DB)return {error:"no_disponible"};
 if(!idValido(empresa))return {error:"no_autorizado"};
 const db=env.QUIZ_DB;
 const v=await db.prepare("SELECT v.id,v.propuesta_id FROM servicio_vinculos v JOIN propuestas_economicas e ON e.propuesta_id=v.propuesta_id WHERE "+guardiaVinculo).bind(PLATAFORMA,empresa).first();
 return v?{db,v}:{error:"no_autorizado"};
}
async function sigueVinculado(db,v,empresa){
 return !!await db.prepare("SELECT 1 AS ok FROM servicio_vinculos v JOIN propuestas_economicas e ON e.propuesta_id=v.propuesta_id WHERE "+guardiaVinculo+" AND v.id=?3").bind(PLATAFORMA,empresa,v.id).first();
}
export function proyectarSolicitud(q){
 return {id:q.soporte_id,titulo:q.titulo,descripcion:q.descripcion,categoria:q.categoria,modulo:q.modulo,impacto:q.impacto,estado:q.estado,fecha_registro:q.fecha_registro,fecha_actualizacion:q.fecha_actualizacion};
}
const columnasSoporte="c.soporte_id,c.titulo,c.descripcion,c.categoria,c.modulo,c.impacto,c.fecha_registro,t.estado,t.fecha_actualizacion";
export async function listarSoportePrivado(env,empresa){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return {ok:false,error:ctx.error};
 const {db,v}=ctx;
 const r=await db.prepare("SELECT "+columnasSoporte+" FROM servicio_soporte_cliente c JOIN servicio_soporte t ON t.id=c.soporte_id JOIN servicio_vinculos v ON v.id=c.vinculo_id AND v.propuesta_id=t.propuesta_id WHERE c.vinculo_id=?1 AND v.estado='registrado' ORDER BY t.fecha_actualizacion DESC,c.soporte_id DESC LIMIT 101").bind(v.id).all();
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 return {ok:true,version:1,solicitudes:r.results.slice(0,100).map(proyectarSolicitud),limitado:r.results.length>100};
}
export async function crearSoportePrivado(env,empresa,d){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return {ok:false,error:ctx.error};
 if(!solicitudClienteValida(d))return {ok:false,error:"datos_invalidos"};
 const {db,v}=ctx,ahora=new Date().toISOString(),desde=new Date(Date.now()-86400000).toISOString(),id=crypto.randomUUID();
 const valores=[d.titulo.trim(),d.descripcion.trim(),d.categoria,d.modulo.trim(),d.impacto],tipo=d.categoria==="modificacion"?"cambio_menor":d.categoria==="nueva_funcion"?"adicional":"incidencia";
 async function previo(){
  const p=await db.prepare("SELECT "+columnasSoporte+" FROM servicio_soporte_cliente c JOIN servicio_soporte t ON t.id=c.soporte_id WHERE c.vinculo_id=?1 AND c.solicitud_externa=?2 AND t.propuesta_id=?3").bind(v.id,d.id,v.propuesta_id).first();
  if(!p)return null;
  if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
  return [p.titulo,p.descripcion,p.categoria,p.modulo,p.impacto].every((x,i)=>x===valores[i])?{ok:true,version:1,solicitud:proyectarSolicitud(p),repetido:true}:{ok:false,error:"conflicto"};
 }
 const anterior=await previo();if(anterior)return anterior;
 try{
  // Both writes are atomic. The first checks revocation and quota in the write itself.
  const r=await db.batch([
   db.prepare("INSERT INTO servicio_soporte(id,propuesta_id,titulo,descripcion,tipo,prioridad,origen,fecha_registro,fecha_actualizacion) SELECT ?4,v.propuesta_id,?5,?6,?7,'normal','interno',?8,?8 FROM servicio_vinculos v JOIN propuestas_economicas e ON e.propuesta_id=v.propuesta_id WHERE "+guardiaVinculo+" AND v.id=?3 AND (SELECT COUNT(*) FROM servicio_soporte_cliente c JOIN servicio_soporte t ON t.id=c.soporte_id WHERE t.propuesta_id=v.propuesta_id AND c.fecha_registro>=?9)<10 AND (SELECT COUNT(*) FROM servicio_soporte_cliente c JOIN servicio_soporte t ON t.id=c.soporte_id WHERE t.propuesta_id=v.propuesta_id AND t.estado NOT IN ('resuelto','cancelado'))<50").bind(PLATAFORMA,empresa,v.id,id,valores[0],valores[1],tipo,ahora,desde),
   db.prepare("INSERT INTO servicio_soporte_cliente(soporte_id,vinculo_id,solicitud_externa,titulo,descripcion,categoria,modulo,impacto,fecha_registro) SELECT t.id,?2,?3,?4,?5,?6,?7,?8,?9 FROM servicio_soporte t JOIN servicio_vinculos v ON v.propuesta_id=t.propuesta_id WHERE t.id=?1 AND v.id=?2 AND v.estado='registrado'").bind(id,v.id,d.id,...valores,ahora)
  ]);
  if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
  if(!r[0].meta.changes)return {ok:false,error:"limite_alcanzado"};
  if(r[1].meta.changes!==1)return {ok:false,error:"no_disponible"};
  return {ok:true,version:1,solicitud:proyectarSolicitud({soporte_id:id,titulo:valores[0],descripcion:valores[1],categoria:valores[2],modulo:valores[3],impacto:valores[4],estado:"abierto",fecha_registro:ahora,fecha_actualizacion:ahora})};
 }catch(e){const repetido=await previo();if(repetido)return repetido;throw e;}
}
export class IntegracionComercial extends WorkerEntrypoint {
 async listarSoporte(empresa){try{return await listarSoportePrivado(this.env,empresa);}catch{return {ok:false,error:'no_disponible'};}}
 async crearSoporte(empresa,datos){try{return await crearSoportePrivado(this.env,empresa,datos);}catch{return {ok:false,error:'no_disponible'};}}
 async consultarSuscripcion(empresa){
  try{return await consultarSuscripcionPrivada(this.env,empresa);}catch{return {ok:false,error:"no_disponible"};}
 }
}
