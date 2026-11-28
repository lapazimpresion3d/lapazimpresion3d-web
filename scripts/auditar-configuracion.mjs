import {readFileSync} from "node:fs";
import {pathToFileURL} from "node:url";
export function auditarPruebas(c,prod){
 const errores=[];
 const exigir=(ok,msg)=>{if(!ok)errores.push(msg);};
 exigir(c.name==="lapazimpresion3d-web-pruebas"&&c.name!==prod.name,"Nombre de Worker de pruebas incorrecto.");
 exigir(c.workers_dev===false&&c.preview_urls===false&&!c.routes&&!c.route&&!c.triggers&&!c.services&&!c.env,"No debe haber exposición pública, cron, servicios ni entornos heredados.");
 exigir(Array.isArray(c.d1_databases)&&c.d1_databases.length===1,"Se requiere una D1 independiente.");
 const d=c.d1_databases?.[0],p=prod.d1_databases?.[0];
 exigir(d?.binding==="QUIZ_DB"&&d.database_name==="lapazimpresion3d-quiz-pruebas"&&d.database_name!==p?.database_name&&typeof d.database_id==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(d.database_id)&&!prod.d1_databases.some(x=>x.database_id===d.database_id),"UUID D1 de pruebas ausente o coincide con producción.");
 exigir(Array.isArray(c.r2_buckets)&&c.r2_buckets.length===1&&c.r2_buckets[0].binding==="COTIZACIONES_R2"&&c.r2_buckets[0].bucket_name==="lapazimpresion3d-cotizaciones-pruebas"&&!prod.r2_buckets.some(x=>x.bucket_name===c.r2_buckets[0].bucket_name),"Bucket de pruebas incorrecto.");
 const v=c.vars||{};
 for(const k of ["INTEGRACION_COMERCIAL_HABILITADA","MONITOREO_AUTOMATICO_HABILITADO","RESPALDOS_AUTOMATICOS_HABILITADOS","RECONCILIACION_RESPALDOS_HABILITADA"])exigir(v[k]==="no",k+" debe permanecer deshabilitada.");
 for(const k of ["MONITOREO_SITIOS_AUTORIZADOS","RESPALDOS_NEGOCIOS_AUTORIZADOS"])exigir(v[k]==="[]",k+" debe estar vacía.");
 exigir(v.ADMIN_TURNSTILE==="true","Turnstile administrativo debe estar habilitado.");
 for(const k of Object.keys(v))exigir(!/(PASSWORD|SECRET|API_KEY|CLAVE_AES|TOKEN|NOTIFY_EMAIL|EMAIL_FROM)/i.test(k),"No incluir secretos ni destinatarios de correo en configuración de pruebas: "+k);
 return errores;
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){
 const c=JSON.parse(readFileSync(process.argv[2]||"config/wrangler.pruebas.example.json","utf8")),p=JSON.parse(readFileSync("wrangler.json","utf8"));
 const errores=auditarPruebas(c,p);
 if(errores.length){for(const e of errores)console.error(e);process.exitCode=1;}else console.log("Configuración estática de pruebas válida. No verifica recursos remotos ni autoriza despliegue.");
}
