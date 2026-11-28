import {FORMATO_AMPLIADO,validarDatosAmpliados} from "./esquema-respaldo-comercial.mjs";
import {WorkerEntrypoint} from "cloudflare:workers";
const MAX=2000000,formato="lapaz-comercio-respaldo-v1",esquema="lapaz-respaldo-cifrado-v1";
const tablas=["empresa","sucursales","roles","permisos","membresias","asignaciones","restricciones","suscripcion","finanzas"];
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/;
const empresaValida=x=>typeof x==="string"&&/^[a-z0-9][a-z0-9._:-]{0,127}$/.test(x);
const enc=s=>new TextEncoder().encode(s);
export function solicitudRespaldoValida(d){return !!d&&typeof d==="object"&&!Array.isArray(d)&&Object.keys(d).length===4&&typeof d.id==="string"&&uuid.test(d.id)&&empresaValida(d.empresa)&&["datos","archivos","completo","configuracion"].includes(d.alcance)&&typeof d.fecha_programada==="string"&&/^\d{4}-\d{2}-\d{2}$/.test(d.fecha_programada)&&!Number.isNaN(Date.parse(d.fecha_programada+"T00:00:00Z"))&&new Date(d.fecha_programada+"T00:00:00Z").toISOString().slice(0,10)===d.fecha_programada;}
export function empresaAutorizada(env,empresa){try{const a=JSON.parse(env.RESPALDOS_EMPRESAS_AUTORIZADAS||"[]");return Array.isArray(a)&&a.length<=100&&a.every(empresaValida)&&a.includes(empresa);}catch{return false;}}
const hex=b=>Array.from(new Uint8Array(b),x=>x.toString(16).padStart(2,"0")).join("");
export async function verificarCopia(snapshot,empresa){
 if(!snapshot||typeof snapshot.payload!=="string"||snapshot.payload.length>MAX||!(/^[0-9a-f]{64}$/).test(snapshot.sha256||""))throw Error("snapshot");
 const bytes=enc(snapshot.payload);if(bytes.length>MAX||hex(await crypto.subtle.digest("SHA-256",bytes))!==snapshot.sha256)throw Error("integridad");
 const p=JSON.parse(snapshot.payload);
 if(p?.formato===FORMATO_AMPLIADO){if(!validarDatosAmpliados(p,empresa))throw Error("esquema ampliado");return FORMATO_AMPLIADO;}
 if(p?.formato!==formato||p.empresa!==empresa||!Number.isSafeInteger(p.fecha)||p.fecha<0||!p.datos||Object.keys(p.datos).length!==tablas.length)throw Error("formato");
 for(const t of tablas){const rows=p.datos[t];if(!Array.isArray(rows)||rows.length>1000||rows.some(r=>!r||typeof r!=="object"||Array.isArray(r)||(t==="empresa"?r.id:r.empresa)!==empresa))throw Error("aislamiento");}
 if(p.datos.empresa.length!==1)throw Error("empresa");
 return formato;
}
async function llave(env){const s=env.RESPALDOS_CLAVE_AES256;if(typeof s!=="string"||!/^[A-Za-z0-9+/]{43}=$/.test(s))throw Error("clave");const b=Uint8Array.from(atob(s),c=>c.charCodeAt(0));if(b.length!==32)throw Error("clave");return crypto.subtle.importKey("raw",b,{name:"AES-GCM"},false,["encrypt","decrypt"]);}
const aad=d=>enc(JSON.stringify([esquema,d.id,d.empresa,d.alcance,d.fecha_programada]));
const parcial=(d,f)=>({ok:true,resultado:"parcial",referencia:"copia:"+d.id,observaciones:f===FORMATO_AMPLIADO?"Instantánea ampliada de perfil, personal, configuración, contratación y finanzas cifrada y verificada. No incluye todos los datos operativos ni archivos; restauración no comprobada.":"Instantánea limitada de configuración y finanzas cifrada y verificada. No incluye todos los datos ni archivos; restauración no comprobada."});
async function verificarGuardado(obj,d,key){
 if(!obj||obj.size<29||obj.size>MAX*2+4096)throw Error("objeto");
 const bytes=new Uint8Array(await obj.arrayBuffer()),iv=bytes.slice(0,12);
 const plano=await crypto.subtle.decrypt({name:"AES-GCM",iv,additionalData:aad(d)},key,bytes.slice(12));
 const formatoGuardado=await verificarCopia(JSON.parse(new TextDecoder("utf-8",{fatal:true}).decode(plano)),d.empresa);
 return parcial(d,formatoGuardado);
}
export async function crearRespaldoPrivado(env,d){
 if(env.ADAPTADOR_RESPALDOS_HABILITADO!=="si"||!solicitudRespaldoValida(d)||!empresaAutorizada(env,d.empresa)||!env.RESPALDOS_R2||typeof env.RESPALDOS_ORIGEN?.exportarRespaldo!=="function")return {ok:false,error:"no_disponible"};
 if(d.alcance==="archivos")return {ok:true,resultado:"fallido",referencia:"",observaciones:"Alcance no soportado por el exportador de configuración y finanzas."};
 try{
  const key=await llave(env),objKey="instantaneas/v1/"+d.id+".bin";
  const anterior=await env.RESPALDOS_R2.get(objKey);if(anterior)return await verificarGuardado(anterior,d,key);
  const snap=await env.RESPALDOS_ORIGEN.exportarRespaldo(d.empresa);const formatoRecibido=await verificarCopia(snap,d.empresa);
  if(env.RESPALDOS_EXIGIR_V2==="si"&&formatoRecibido!==FORMATO_AMPLIADO)return {ok:false,error:"formato_no_admitido"};
  const plano=enc(JSON.stringify({payload:snap.payload,sha256:snap.sha256}));if(plano.length>MAX*2+2048)throw Error("tamano");
  const iv=crypto.getRandomValues(new Uint8Array(12)),cifrado=new Uint8Array(await crypto.subtle.encrypt({name:"AES-GCM",iv,additionalData:aad(d)},key,plano));
  const bin=new Uint8Array(iv.length+cifrado.length);bin.set(iv);bin.set(cifrado,iv.length);
  if(!empresaAutorizada(env,d.empresa))return {ok:false,error:"no_disponible"};
  await env.RESPALDOS_R2.put(objKey,bin,{onlyIf:{etagDoesNotMatch:"*"},httpMetadata:{contentType:"application/octet-stream"}});
  return await verificarGuardado(await env.RESPALDOS_R2.get(objKey),d,key);
 }catch{return {ok:false,error:"no_verificable"};}
}
export class EjecutorRespaldos extends WorkerEntrypoint{async crearRespaldo(datos){return crearRespaldoPrivado(this.env,datos);}}
export default {fetch(){return new Response("Not found",{status:404,headers:{"Cache-Control":"no-store"}});}};
