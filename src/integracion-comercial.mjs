import {proyectarInforme} from "./informes-mantenimiento.mjs";
import {proyectarNovedad} from "./novedades.mjs";
import {WorkerEntrypoint} from "cloudflare:workers";
import {guardarEvidencia,tablaEvidencias,proyectarEvidencia,valoresEvidencia} from "./evidencias-soporte.mjs";
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
export function mensajeClienteValido(d){
 return !!d&&typeof d==="object"&&!Array.isArray(d)&&Object.keys(d).every(k=>["id","texto"].includes(k))&&typeof d.id==="string"&&UUID.test(d.id)&&texto(d.texto,1,3000);
}
const guardiaTicket="c.vinculo_id=?3 AND c.soporte_id=?4 AND v.id=c.vinculo_id AND v.propuesta_id=t.propuesta_id AND "+guardiaVinculo;
const joinsTicket=" FROM servicio_soporte_cliente c JOIN servicio_soporte t ON t.id=c.soporte_id JOIN servicio_vinculos v ON v.id=c.vinculo_id JOIN propuestas_economicas e ON e.propuesta_id=v.propuesta_id ";
export async function consultarConversacionPrivada(env,empresa,ticket){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return {ok:false,error:ctx.error};
 if(typeof ticket!=="string"||!UUID.test(ticket))return {ok:false,error:"datos_invalidos"};
 const {db,v}=ctx,args=[PLATAFORMA,empresa,v.id,ticket];
 const q=await db.prepare("SELECT "+columnasSoporte+joinsTicket+"WHERE "+guardiaTicket).bind(...args).first();
 if(!q)return {ok:false,error:"no_autorizado"};
 const r=await db.prepare("SELECT m.id,m.autor,m.texto,m.fecha_registro"+joinsTicket+"JOIN servicio_soporte_mensajes m ON m.soporte_id=t.id WHERE "+guardiaTicket+" ORDER BY m.fecha_registro DESC,m.id DESC LIMIT 201").bind(...args).all();
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 const disponible=await resolucionesDisponibles(db);
 const resoluciones=disponible?(await db.prepare("SELECT z.version_solucion,z.solucion,z.fecha_solucion,z.decision,z.comentario,z.fecha_decision"+joinsTicket+"JOIN servicio_soporte_resoluciones z ON z.soporte_id=t.id WHERE "+guardiaTicket+" ORDER BY z.version_solucion DESC LIMIT 100").bind(...args).all()).results:[];
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 return {ok:true,version:1,solicitud:proyectarSolicitud(q),mensajes:r.results.slice(0,200).reverse().map(m=>({id:m.id,autor:m.autor,texto:m.texto,fecha_registro:m.fecha_registro})),limitado:r.results.length>200,resoluciones,resoluciones_disponibles:disponible};
}
export async function enviarMensajePrivado(env,empresa,ticket,d){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return {ok:false,error:ctx.error};
 if(typeof ticket!=="string"||!UUID.test(ticket)||!mensajeClienteValido(d))return {ok:false,error:"datos_invalidos"};
 const {db,v}=ctx,args=[PLATAFORMA,empresa,v.id,ticket],contenido=d.texto.trim(),ahora=new Date().toISOString(),desde=new Date(Date.now()-3600000).toISOString();
 const q=await db.prepare("SELECT t.estado"+joinsTicket+"WHERE "+guardiaTicket).bind(...args).first();
 if(!q)return {ok:false,error:"no_autorizado"};
 async function previo(){
  const m=await db.prepare("SELECT m.id,m.autor,m.texto,m.fecha_registro"+joinsTicket+"JOIN servicio_soporte_mensajes m ON m.soporte_id=t.id WHERE "+guardiaTicket+" AND m.id=?5").bind(...args,d.id).first();
  if(!m)return null;
  return m.autor==="cliente"&&m.texto===contenido?{ok:true,version:1,mensaje:{id:m.id,autor:m.autor,texto:m.texto,fecha_registro:m.fecha_registro},repetido:true}:{ok:false,error:"conflicto"};
 }
 const anterior=await previo();if(anterior)return anterior;
 if(["resuelto","cancelado"].includes(q.estado))return {ok:false,error:"solicitud_cerrada"};
 const r=await db.batch([
  db.prepare("INSERT INTO servicio_soporte_mensajes(id,soporte_id,autor,texto,fecha_registro) SELECT ?5,t.id,'cliente',?6,?7"+joinsTicket+"WHERE "+guardiaTicket+" AND t.estado NOT IN ('resuelto','cancelado') AND (SELECT COUNT(*) FROM servicio_soporte_mensajes m JOIN servicio_soporte st ON st.id=m.soporte_id WHERE st.propuesta_id=v.propuesta_id AND m.autor='cliente' AND m.fecha_registro>=?8)<30 ON CONFLICT(id) DO NOTHING").bind(...args,d.id,contenido,ahora,desde),
  db.prepare("UPDATE servicio_soporte SET fecha_actualizacion=CASE WHEN fecha_actualizacion<?7 THEN ?7 ELSE fecha_actualizacion END WHERE id=?4 AND EXISTS(SELECT 1"+joinsTicket+"JOIN servicio_soporte_mensajes m ON m.soporte_id=t.id WHERE "+guardiaTicket+" AND m.id=?5 AND m.autor='cliente' AND m.texto=?6 AND m.fecha_registro=?7)").bind(...args,d.id,contenido,ahora)
 ]);
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 if(r[0].meta.changes===1)return {ok:true,version:1,mensaje:{id:d.id,autor:"cliente",texto:contenido,fecha_registro:ahora}};
 const repetido=await previo();if(repetido)return repetido;
 const actual=await db.prepare("SELECT t.estado"+joinsTicket+"WHERE "+guardiaTicket).bind(...args).first();
 if(!actual)return {ok:false,error:"no_autorizado"};
 if(["resuelto","cancelado"].includes(actual.estado))return {ok:false,error:"solicitud_cerrada"};
 return {ok:false,error:"limite_o_conflicto"};
}
async function contextoEvidencia(env,empresa,ticket){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return ctx;
 if(typeof ticket!=="string"||!UUID.test(ticket))return {error:"datos_invalidos"};
 const {db,v}=ctx,args=[PLATAFORMA,empresa,v.id,ticket];
 if(!await db.prepare("SELECT t.id"+joinsTicket+"WHERE "+guardiaTicket).bind(...args).first())return {error:"no_autorizado"};
 if(!env.COTIZACIONES_R2||!await tablaEvidencias(db))return {error:"no_disponible"};
 return {...ctx,args};
}
export async function listarEvidenciasPrivadas(env,empresa,ticket){
 const ctx=await contextoEvidencia(env,empresa,ticket);if(ctx.error)return {ok:false,error:ctx.error};
 const {db,v,args}=ctx;
 const r=await db.prepare("SELECT a.*"+joinsTicket+"JOIN servicio_soporte_evidencias a ON a.soporte_id=t.id WHERE "+guardiaTicket+" AND a.visibilidad='cliente' ORDER BY a.fecha_registro DESC LIMIT 20").bind(...args).all();
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 return {ok:true,version:1,evidencias:r.results.map(proyectarEvidencia)};
}
export async function leerEvidenciaPrivada(env,empresa,ticket,id){
 const ctx=await contextoEvidencia(env,empresa,ticket);if(ctx.error)return {ok:false,error:ctx.error};
 if(typeof id!=="string"||!UUID.test(id))return {ok:false,error:"datos_invalidos"};
 const {db,v,args}=ctx;
 const a=await db.prepare("SELECT a.*"+joinsTicket+"JOIN servicio_soporte_evidencias a ON a.soporte_id=t.id WHERE "+guardiaTicket+" AND a.visibilidad='cliente' AND a.id=?5").bind(...args,id).first();
 if(!a)return {ok:false,error:"no_autorizado"};
 const obj=await env.COTIZACIONES_R2.get(a.clave_r2);if(!obj)return {ok:false,error:"no_disponible"};
 const bytes=await obj.arrayBuffer();
 if(bytes.byteLength!==a.tamano_bytes||bytes.byteLength>4194304)return {ok:false,error:"no_disponible"};
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 return {ok:true,version:1,evidencia:proyectarEvidencia(a),bytes};
}
export async function adjuntarEvidenciaPrivada(env,empresa,ticket,d){
 const ctx=await contextoEvidencia(env,empresa,ticket);if(ctx.error)return {ok:false,error:ctx.error};
 if(!d||typeof d!=="object"||Object.keys(d).some(k=>!["id","descripcion","mime","bytes"].includes(k)))return {ok:false,error:"datos_invalidos"};
 const {db,v,args}=ctx,desde=new Date(Date.now()-86400000).toISOString();
 const consultar=id=>db.prepare("SELECT a.*"+joinsTicket+"JOIN servicio_soporte_evidencias a ON a.soporte_id=t.id WHERE "+guardiaTicket+" AND a.id=?5 AND a.visibilidad='cliente'").bind(...args,id).first();
 const insertar=x=>db.prepare("INSERT INTO servicio_soporte_evidencias(id,soporte_id,clave_r2,autor,visibilidad,descripcion,tipo_mime,tamano_bytes,sha256,fecha_registro) SELECT ?5,t.id,?6,?7,?8,?9,?10,?11,?12,?13"+joinsTicket+"WHERE "+guardiaTicket+" AND t.estado NOT IN ('resuelto','cancelado') AND (SELECT COUNT(*) FROM servicio_soporte_evidencias a WHERE a.soporte_id=t.id)<20 AND (SELECT COUNT(*) FROM servicio_soporte_evidencias a JOIN servicio_soporte st ON st.id=a.soporte_id WHERE st.propuesta_id=v.propuesta_id AND a.autor='cliente' AND a.fecha_registro>=?14)<30 ON CONFLICT(id) DO NOTHING").bind(...args,...valoresEvidencia(x),desde).run();
 const r=await guardarEvidencia(env,ticket,d,"cliente","cliente",insertar,consultar);
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 return {...r,version:1};
}
export function decisionSolucionValida(d){
 return !!d&&typeof d==="object"&&!Array.isArray(d)&&Object.keys(d).every(k=>["id","version_solucion","decision","comentario"].includes(k))&&typeof d.id==="string"&&UUID.test(d.id)&&Number.isSafeInteger(d.version_solucion)&&d.version_solucion>0&&["confirmada","reabierta"].includes(d.decision)&&texto(d.comentario,d.decision==="reabierta"?3:0,2000);
}
async function resolucionesDisponibles(db){return !!await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='servicio_soporte_resoluciones'").first();}
export async function decidirSolucionPrivada(env,empresa,ticket,d){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return {ok:false,error:ctx.error};
 if(typeof ticket!=="string"||!UUID.test(ticket)||!decisionSolucionValida(d))return {ok:false,error:"datos_invalidos"};
 const {db,v}=ctx,args=[PLATAFORMA,empresa,v.id,ticket],ahora=new Date().toISOString();
 if(!await resolucionesDisponibles(db))return {ok:false,error:"no_disponible"};
 const q=await db.prepare("SELECT t.estado,t.version"+joinsTicket+"WHERE "+guardiaTicket).bind(...args).first();
 if(!q)return {ok:false,error:"no_autorizado"};
 const anterior=()=>db.prepare("SELECT r.version_solucion,r.decision,r.comentario,r.fecha_decision"+joinsTicket+"JOIN servicio_soporte_resoluciones r ON r.soporte_id=t.id WHERE "+guardiaTicket+" AND r.decision_id=?5").bind(...args,d.id).first();
 const respuesta=p=>p.version_solucion===d.version_solucion&&p.decision===d.decision&&p.comentario===d.comentario.trim()?{ok:true,version:1,decision:p.decision,fecha_decision:p.fecha_decision,repetido:true}:{ok:false,error:"conflicto"};
 const previo=await anterior();if(previo)return await sigueVinculado(db,v,empresa)?respuesta(previo):{ok:false,error:"no_autorizado"};
 if(q.estado!=="resuelto")return {ok:false,error:"solicitud_no_resuelta"};
 const r=await db.batch([
  db.prepare("UPDATE servicio_soporte_resoluciones SET decision=?6,comentario=?7,fecha_decision=?8,decision_id=?9 WHERE soporte_id=?4 AND version_solucion=?5 AND decision IS NULL AND version_solucion=(SELECT MAX(z.version_solucion) FROM servicio_soporte_resoluciones z WHERE z.soporte_id=?4) AND EXISTS(SELECT 1"+joinsTicket+"WHERE "+guardiaTicket+" AND t.estado='resuelto' AND t.version>=?5) AND NOT EXISTS(SELECT 1 FROM servicio_soporte_resoluciones z WHERE z.decision_id=?9)").bind(...args,d.version_solucion,d.decision,d.comentario.trim(),ahora,d.id),
  db.prepare("UPDATE servicio_soporte SET estado=CASE WHEN ?6='reabierta' THEN 'abierto' ELSE estado END,version=version+1,fecha_actualizacion=?8 WHERE id=?4 AND estado='resuelto' AND changes()=1 AND EXISTS(SELECT 1"+joinsTicket+"JOIN servicio_soporte_resoluciones r ON r.soporte_id=t.id WHERE "+guardiaTicket+" AND r.version_solucion=?5 AND r.decision=?6 AND r.comentario=?7 AND r.fecha_decision=?8 AND r.decision_id=?9)").bind(...args,d.version_solucion,d.decision,d.comentario.trim(),ahora,d.id)
 ]);
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 if(r[0].meta.changes===1&&r[1].meta.changes===1)return {ok:true,version:1,decision:d.decision,fecha_decision:ahora};
 const p=await anterior();return p?respuesta(p):{ok:false,error:"conflicto"};
}
export async function listarNovedadesPrivadas(env,empresa){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return {ok:false,error:ctx.error};
 const {db,v}=ctx;
 if(!await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='servicio_novedades'").first())return {ok:false,error:"no_disponible"};
 const r=await db.prepare("SELECT n.id,n.titulo,n.resumen,n.fecha_publicacion,a.categoria,a.fecha_aplicacion FROM servicio_novedades n JOIN servicio_actualizaciones a ON a.id=n.actualizacion_id JOIN servicio_vinculos v ON v.id=n.vinculo_id AND v.propuesta_id=a.propuesta_id WHERE n.vinculo_id=?1 AND a.propuesta_id=?2 AND v.estado='registrado' AND n.fecha_retiro IS NULL AND a.resultado='correcto' ORDER BY n.fecha_publicacion DESC,n.id DESC LIMIT 101").bind(v.id,v.propuesta_id).all();
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 return {ok:true,version:1,novedades:r.results.slice(0,100).map(proyectarNovedad),limitado:r.results.length>100};
}
export async function listarInformesPrivados(env,empresa){
 const ctx=await contextoSoporte(env,empresa);if(ctx.error)return {ok:false,error:ctx.error};
 const {db,v}=ctx;
 if(!await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='servicio_informes_mensuales'").first())return {ok:false,error:"no_disponible"};
 const r=await db.prepare("SELECT i.id,i.mes,i.titulo,i.resumen,i.fecha_publicacion FROM servicio_informes_mensuales i JOIN servicio_vinculos v ON v.id=i.vinculo_id WHERE i.vinculo_id=?1 AND v.propuesta_id=?2 AND v.estado='registrado' AND i.fecha_retiro IS NULL ORDER BY i.mes DESC,i.fecha_publicacion DESC LIMIT 101").bind(v.id,v.propuesta_id).all();
 if(!await sigueVinculado(db,v,empresa))return {ok:false,error:"no_autorizado"};
 return {ok:true,version:1,informes:r.results.slice(0,100).map(proyectarInforme),limitado:r.results.length>100};
}
export class IntegracionComercial extends WorkerEntrypoint {
 async listarInformes(empresa){try{return await listarInformesPrivados(this.env,empresa);}catch{return {ok:false,error:"no_disponible"};}}
 async listarNovedades(empresa){try{return await listarNovedadesPrivadas(this.env,empresa);}catch{return {ok:false,error:"no_disponible"};}}
 async decidirSolucion(empresa,ticket,datos){try{return await decidirSolucionPrivada(this.env,empresa,ticket,datos);}catch{return {ok:false,error:'no_disponible'};}}
 async listarEvidencias(empresa,ticket){try{return await listarEvidenciasPrivadas(this.env,empresa,ticket);}catch{return {ok:false,error:"no_disponible"};}}
 async leerEvidencia(empresa,ticket,id){try{return await leerEvidenciaPrivada(this.env,empresa,ticket,id);}catch{return {ok:false,error:"no_disponible"};}}
 async adjuntarEvidencia(empresa,ticket,datos){try{return await adjuntarEvidenciaPrivada(this.env,empresa,ticket,datos);}catch{return {ok:false,error:"no_disponible"};}}
 async consultarConversacion(empresa,ticket){try{return await consultarConversacionPrivada(this.env,empresa,ticket);}catch{return {ok:false,error:'no_disponible'};}}
 async enviarMensaje(empresa,ticket,datos){try{return await enviarMensajePrivado(this.env,empresa,ticket,datos);}catch{return {ok:false,error:'no_disponible'};}}
 async listarSoporte(empresa){try{return await listarSoportePrivado(this.env,empresa);}catch{return {ok:false,error:'no_disponible'};}}
 async crearSoporte(empresa,datos){try{return await crearSoportePrivado(this.env,empresa,datos);}catch{return {ok:false,error:'no_disponible'};}}
 async consultarSuscripcion(empresa){
  try{return await consultarSuscripcionPrivada(this.env,empresa);}catch{return {ok:false,error:"no_disponible"};}
 }
}
