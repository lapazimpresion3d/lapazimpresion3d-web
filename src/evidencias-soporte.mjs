// Private evidence objects; no public URLs or caller-controlled R2 keys.
const MAX=4194304;
export const uuidEvidencia=v=>typeof v==="string"&&/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(v);
export function evidenciaValida(d){
 if(!d||!uuidEvidencia(d.id)||typeof d.descripcion!=="string"||d.descripcion.length>500||!(d.bytes instanceof ArrayBuffer)||d.bytes.byteLength<12||d.bytes.byteLength>MAX)return false;
 const b=new Uint8Array(d.bytes);
 if(d.mime==="image/jpeg")return b[0]===255&&b[1]===216&&b[2]===255&&b[b.length-2]===255&&b[b.length-1]===217;
 if(d.mime==="image/png")return [137,80,78,71,13,10,26,10].every((v,i)=>b[i]===v)&&String.fromCharCode(...b.slice(12,16))==="IHDR";
 if(d.mime==="image/webp")return String.fromCharCode(...b.slice(0,4))==="RIFF"&&String.fromCharCode(...b.slice(8,12))==="WEBP";
 return false;
}
export function proyectarEvidencia(x){return {id:x.id,autor:x.autor,visibilidad:x.visibilidad,descripcion:x.descripcion,tipo_mime:x.tipo_mime,tamano_bytes:x.tamano_bytes,fecha_registro:x.fecha_registro};}
export async function tablaEvidencias(db){return !!await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='servicio_soporte_evidencias'").first();}
// guardar receives server-built SQL statement via callback, never from client.
export async function guardarEvidencia(env,ticket,d,autor,visibilidad,insertar,consultar){
 if(!env.COTIZACIONES_R2)return {ok:false,error:"no_disponible"};
 if(!evidenciaValida(d))return {ok:false,error:"datos_invalidos"};
 const hash=Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256",d.bytes)),x=>x.toString(16).padStart(2,"0")).join("");
 const descripcion=d.descripcion.trim();
 const comparar=x=>x&&x.autor===autor&&x.visibilidad===visibilidad&&x.descripcion===descripcion&&x.tipo_mime===d.mime&&x.sha256===hash;
 const anterior=await consultar(d.id);
 if(anterior)return comparar(anterior)?{ok:true,evidencia:proyectarEvidencia(anterior),repetido:true}:{ok:false,error:"conflicto"};
 const clave="soporte/"+ticket+"/"+crypto.randomUUID(),ahora=new Date().toISOString();
 const fila={id:d.id,soporte_id:ticket,clave_r2:clave,autor,visibilidad,descripcion,tipo_mime:d.mime,tamano_bytes:d.bytes.byteLength,sha256:hash,fecha_registro:ahora};
 await env.COTIZACIONES_R2.put(clave,d.bytes,{httpMetadata:{contentType:d.mime}});
 let guardada=false;
 try{
  const r=await insertar(fila);
  guardada=r.meta.changes===1;
  if(guardada)return {ok:true,evidencia:proyectarEvidencia(fila)};
  const previa=await consultar(d.id);
  return previa?(comparar(previa)?{ok:true,evidencia:proyectarEvidencia(previa),repetido:true}:{ok:false,error:"conflicto"}):{ok:false,error:"limite_o_conflicto"};
 }finally{if(!guardada){try{await env.COTIZACIONES_R2.delete(clave);}catch{console.error("Limpieza pendiente de evidencia",clave);}}}
}
export const valoresEvidencia=x=>[x.id,x.clave_r2,x.autor,x.visibilidad,x.descripcion,x.tipo_mime,x.tamano_bytes,x.sha256,x.fecha_registro];
