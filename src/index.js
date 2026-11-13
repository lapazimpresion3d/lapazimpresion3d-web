// Lapazimpresion3d: sitio estático + recepción de diagnósticos + panel privado.
// Requiere D1 (QUIZ_DB) y secreto ADMIN_PASSWORD; no publica listas sin autenticación.
const CAMPOS = {
  objetivo: ["dar_a_conocer","mejorar_experiencia","celebracion","ahorrar_tiempo","desarrollar_idea"],
  situacion: ["comenzando","negocio_existente","organizando_evento","regalo_detalle","explorando"],
  contacto_actual: ["en_persona","redes_mensajes","pedidos_citas","entregar_a_varios","sin_forma_definida"],
  mejora_deseada: ["recordar_marca_evento","encontrar_informacion","menos_mensajes","original_personalizado","organizar_atencion"],
  preparacion: ["diseno_idea","fotos_referencias","mejorar_existente","necesita_orientacion","solo_explorando"]
};
const IDS = new Set(["R1","R2","R3","R4","R5"]);
const enc = new TextEncoder();
function json(data, status=200, extra={}) { return new Response(JSON.stringify(data), { status, headers: {"content-type":"application/json; charset=utf-8", "cache-control":"no-store", "x-content-type-options":"nosniff", ...extra} }); }
function error(message, status) { return json({error:message}, status); }
function sameOrigin(request) {
  const origin = request.headers.get("Origin");
  return origin === new URL(request.url).origin;
}
async function firma(secret, message) {
  const key = await crypto.subtle.importKey("raw", enc.encode(secret), {name:"HMAC",hash:"SHA-256"}, false, ["sign"]);
  const mac = new Uint8Array(await crypto.subtle.sign("HMAC",key,enc.encode(message)));
  return Array.from(mac, x=>x.toString(16).padStart(2,"0")).join("");
}
function constante(a,b) { if (a.length!==b.length) return false; let v=0; for(let i=0;i<a.length;i++)v|=a.charCodeAt(i)^b.charCodeAt(i); return v===0; }
async function autorizado(request,env) {
  if (!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return false;
  const cookies = request.headers.get("Cookie")||"";
  const value = cookies.split(";").map(x=>x.trim()).find(x=>x.startsWith("lp3d_session="))?.slice(13);
  if(!value) return false;
  const [exp, sig, extra] = value.split(".");
  if (extra || !/^\d{10,13}$/.test(exp) || !/^[0-9a-f]{64}$/.test(sig||"")) return false;
  if(Number(exp) < Date.now() || Number(exp)>Date.now()+86400000) return false;
  return constante(sig, await firma(env.SESSION_SECRET,exp));
}
async function leerJson(request, max=6000) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
  const length=Number(request.headers.get("content-length")||0);
  if(length>max) return null;
  const body=await request.text();
  if(body.length>max) return null;
  try { return JSON.parse(body); } catch { return null; }
}
async function api(request,env) {
  const url=new URL(request.url), path=url.pathname;
  if(!env.QUIZ_DB) return error("Base de datos no configurada",503);
  if(path==="/api/quiz/solicitudes" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    const data=await leerJson(request);
    if(!data || data.tipo_documento!=="ficha_quiz" || data.version_esquema!=="2.0") return error("Ficha inválida",400);
    if(!data.respuestas || Object.keys(CAMPOS).some(k=>!CAMPOS[k].includes(data.respuestas[k]))) return error("Respuestas inválidas",400);
    if(!IDS.has(data.recomendacion?.id) || typeof data.recomendacion?.titulo!=="string" || data.recomendacion.titulo.length>130) return error("Recomendación inválida",400);
    const id=typeof data.id_diagnostico==="string" && /^[0-9a-f-]{36}$/i.test(data.id_diagnostico) ? data.id_diagnostico : crypto.randomUUID();
    const ficha={tipo_documento:"ficha_quiz",version_esquema:"2.0",id_diagnostico:id,id_proyecto:null,origen:"lapazimpresion3d_web",fecha_generacion:new Date().toISOString(),respuestas:Object.fromEntries(Object.keys(CAMPOS).map(k=>[k,data.respuestas[k]])),recomendacion:{id:data.recomendacion.id,titulo:data.recomendacion.titulo,estado:"orientativa",complemento_sugerido:typeof data.recomendacion.complemento_sugerido==="string"?data.recomendacion.complemento_sugerido.slice(0,350):null}};
    await env.QUIZ_DB.prepare("INSERT OR IGNORE INTO quiz_diagnosticos (id,fecha,servicio_id,ficha_json,estado) VALUES (?1,?2,?3,?4,'nuevo')").bind(id,ficha.fecha_generacion,ficha.recomendacion.id,JSON.stringify(ficha)).run();
    return json({ok:true,id},201);
  }
  if(path==="/api/admin/login" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return error("Acceso no configurado",503);
    const data=await leerJson(request,512);
    const received=typeof data?.password==="string"?data.password:"";
    // La protección de intentos se debe reforzar con Cloudflare WAF Rate Limiting.
    const expected=env.ADMIN_PASSWORD;
    const a=await firma(env.SESSION_SECRET,received),b=await firma(env.SESSION_SECRET,expected);
    if(!received || !constante(a,b)) return error("Contraseña incorrecta",401);
    const exp=String(Date.now()+8*60*60*1000),signature=await firma(env.SESSION_SECRET,exp);
    return json({ok:true},200,{"set-cookie":`lp3d_session=${exp}.${signature}; Path=/api/admin; Max-Age=28800; HttpOnly; Secure; SameSite=Strict`});
  }
  if(path.startsWith("/api/admin/")) {
    if(!await autorizado(request,env)) return error("Acceso restringido",401);
    if(request.method==="POST" && !sameOrigin(request)) return error("Origen no autorizado",403);
    if(path==="/api/admin/sesion" && request.method==="GET") return json({ok:true});
    if(path==="/api/admin/salir" && request.method==="POST") return json({ok:true},200,{"set-cookie":"lp3d_session=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict"});
    if(path==="/api/admin/diagnosticos" && request.method==="GET") {
      const status=url.searchParams.get("estado");
      const estado=["nuevo","revisado"].includes(status)?status:null;
      const results=await env.QUIZ_DB.prepare("SELECT id,fecha,servicio_id,estado,ficha_json FROM quiz_diagnosticos WHERE (?1 IS NULL OR estado=?1) ORDER BY fecha DESC LIMIT 100").bind(estado).all();
      return json({items:results.results.map(x=>({id:x.id,fecha:x.fecha,servicio_id:x.servicio_id,estado:x.estado,ficha:JSON.parse(x.ficha_json)}))});
    }
    const detail=path.match(/^\/api\/admin\/diagnosticos\/([0-9a-f-]{36})$/i);
    if(detail && request.method==="PATCH") {
      if(!sameOrigin(request)) return error("Origen no autorizado",403);
      const data=await leerJson(request,100);
      if(!["nuevo","revisado"].includes(data?.estado)) return error("Estado inválido",400);
      const result=await env.QUIZ_DB.prepare("UPDATE quiz_diagnosticos SET estado=?1 WHERE id=?2").bind(data.estado,detail[1]).run();
      return json({ok:result.meta.changes>0});
    }
  }
  return error("Ruta no encontrada",404);
}
export default { async fetch(request,env) {
  const path=new URL(request.url).pathname;
  try {
    if(path.startsWith("/api/")) return await api(request,env);
    return env.ASSETS.fetch(request);
  } catch(e) { console.error("Error de solicitud",e); return error("Error del servidor",500); }
} };
