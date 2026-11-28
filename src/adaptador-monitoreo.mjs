import {WorkerEntrypoint} from "cloudflare:workers";
import {sitioPermitido} from "./monitoreo-programado.mjs";
export async function comprobarPrivado(env,sitio){
 if(env.ADAPTADOR_MONITOREO_HABILITADO!=="si"||!sitioPermitido(sitio,{MONITOREO_SITIOS_AUTORIZADOS:env.EGRESO_SITIOS_AUTORIZADOS})||typeof env.TRANSPORTE_MONITOREO?.comprobar!=="function")return {ok:false,error:"no_disponible"};
 try{
  const r=await env.TRANSPORTE_MONITOREO.comprobar(sitio);
  if(!r||r.ok!==true||!Number.isSafeInteger(r.ms)||r.ms<0||r.ms>10000||!(r.codigo===null||Number.isSafeInteger(r.codigo)&&r.codigo>=100&&r.codigo<=599))return {ok:false,error:"no_verificable"};
  return {ok:true,codigo:r.codigo,ms:r.ms};
 }catch{return {ok:false,error:"no_disponible"};}
}
export class EgresoMonitoreo extends WorkerEntrypoint{async comprobar(sitio){return comprobarPrivado(this.env,sitio);}}
export default {fetch(){return new Response("Not found",{status:404,headers:{"Cache-Control":"no-store"}});}};
