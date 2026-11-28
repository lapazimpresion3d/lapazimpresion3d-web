// Lapazimpresion3d: sitio estático + recepción de diagnósticos + panel privado.
// Requiere D1 (QUIZ_DB) y secreto ADMIN_PASSWORD; no publica listas sin autenticación.
const CAMPOS = {
  objetivo: ["dar_a_conocer","mejorar_experiencia","celebracion","automatizar","destacar","pieza_funcional","figura_detallada"],
  situacion: ["comenzando","negocio_existente","organizando_evento","regalo_detalle","explorando","pieza_reproducir","modelo_fabricar"],
  contacto_actual: ["en_persona","internet","reservas_pedidos","fecha_fija","sin_canal","uso_funcional","pieza_visual"],
  mejora_deseada: ["recuerdo_fisico","acceso_inmediato","menos_mensajes","producto_personalizado","organizar_trabajo","ajuste_resistencia","detalle_acabado"],
  preparacion: ["logo_diseno","fotos_referencias","presencia_existente","ayuda_desde_cero","cotizando","medidas_modelo","referencia_figura"]
};
const TITULOS = Object.freeze({
  R1:"Llaveros y artículos personalizados en 3D",
  R2:"Soportes QR/NFC personalizados",
  R3:"Página web, menú o catálogo digital",
  R4:"Sistema web personalizado",
  R5:"Proyecto combinado: impresión 3D y soluciones digitales",
  R6:"Piezas funcionales y prototipos en impresión 3D",
  R7:"Figuras y piezas detalladas en resina 3D"
});
// Recalcular la recomendación en el servidor: el navegador es editable por el visitante.
// Las reglas reproducen las prioridades funcionales del cuestionario v3.
function recomendacionEsperada(r) {
  const puntos = {R1:0,R2:0,R3:0,R4:0,R5:0};
  const tabla = {
    objetivo:{dar_a_conocer:{R1:2,R3:2,R2:1},mejorar_experiencia:{R2:1,R3:2,R4:1},celebracion:{R1:5},automatizar:{R4:6},destacar:{R1:2,R2:1,R5:1}},
    situacion:{comenzando:{R1:1,R3:1},negocio_existente:{R2:1,R3:1,R4:1},organizando_evento:{R1:5},regalo_detalle:{R1:5},explorando:{R3:1}},
    contacto_actual:{en_persona:{R1:1,R2:3},internet:{R3:3},reservas_pedidos:{R4:4},fecha_fija:{R1:4},sin_canal:{R3:1}},
    mejora_deseada:{recuerdo_fisico:{R1:5},acceso_inmediato:{R2:3,R3:4},menos_mensajes:{R4:6},producto_personalizado:{R1:5},organizar_trabajo:{R4:6}},
    preparacion:{logo_diseno:{R1:1,R2:1},fotos_referencias:{R1:1,R3:1},presencia_existente:{R3:1,R4:1},ayuda_desde_cero:{R3:1},cotizando:{}}
  };
  for (const [campo, opciones] of Object.entries(tabla)) {
    const peso = campo === "contacto_actual" || campo === "mejora_deseada" ? 2 : 1;
    for (const [id, valor] of Object.entries(opciones[r[campo]] || {})) puntos[id] += valor*peso;
  }
  const evento = r.objetivo === "celebracion" || ["organizando_evento","regalo_detalle"].includes(r.situacion);
  const fisicoExplicito = ["recuerdo_fisico","producto_personalizado"].includes(r.mejora_deseada);
  const operativo = r.objetivo === "automatizar" || ["menos_mensajes","organizar_trabajo"].includes(r.mejora_deseada);
  const info = r.mejora_deseada === "acceso_inmediato";
  const presencial = r.contacto_actual === "en_persona";
  const contextoMecanico = r.situacion === "pieza_reproducir"
    || (r.situacion === "modelo_fabricar" && [r.preparacion === "medidas_modelo", r.contacto_actual === "uso_funcional", r.mejora_deseada === "ajuste_resistencia"].some(Boolean))
    || (r.contacto_actual === "uso_funcional" && (r.mejora_deseada === "ajuste_resistencia" || r.preparacion === "medidas_modelo"))
    || (r.mejora_deseada === "ajuste_resistencia" && r.preparacion === "medidas_modelo");
  const contextoFigura = (r.situacion === "modelo_fabricar" && (r.preparacion === "referencia_figura" || r.contacto_actual === "pieza_visual" || r.mejora_deseada === "detalle_acabado"))
    || (r.contacto_actual === "pieza_visual" && (r.mejora_deseada === "detalle_acabado" || r.preparacion === "referencia_figura"))
    || (r.mejora_deseada === "detalle_acabado" && r.preparacion === "referencia_figura");
  const funcional = r.objetivo === "pieza_funcional" || (!evento && !operativo && contextoMecanico);
  const figura = r.objetivo === "figura_detallada" || (!evento && !operativo && contextoFigura);
  let id;
  if(funcional) id="R6";
  else if(figura) id="R7";
  else if(operativo) id="R4";
  else if(evento && (fisicoExplicito || r.contacto_actual === "fecha_fija" || !info)) id="R1";
  else if(fisicoExplicito) id="R1";
  else if(info && presencial) id="R2";
  else if(info || r.contacto_actual === "internet") id="R3";
  else if(r.contacto_actual === "reservas_pedidos") id="R4";
  else id=["R1","R3","R2","R4"].reduce((best,candidate)=>puntos[candidate]>puntos[best]?candidate:best);
  const fisico = fisicoExplicito || (evento && r.contacto_actual === "fecha_fija");
  const digital = info || operativo || (r.objetivo === "mejorar_experiencia" && r.contacto_actual === "internet");
  if(fisico && digital && !operativo && !evento && !funcional && !figura) id="R5";
  return id;
}
function recomendacionEsperadaV3(r) {
  const puntos = {R1:0,R2:0,R3:0,R4:0,R5:0};
  const tabla = {
    objetivo:{dar_a_conocer:{R1:2,R3:2,R2:1},mejorar_experiencia:{R2:1,R3:2,R4:1},celebracion:{R1:5},automatizar:{R4:6},destacar:{R1:2,R2:1,R5:1}},
    situacion:{comenzando:{R1:1,R3:1},negocio_existente:{R2:1,R3:1,R4:1},organizando_evento:{R1:5},regalo_detalle:{R1:5},explorando:{R3:1}},
    contacto_actual:{en_persona:{R1:1,R2:3},internet:{R3:3},reservas_pedidos:{R4:4},fecha_fija:{R1:4},sin_canal:{R3:1}},
    mejora_deseada:{recuerdo_fisico:{R1:5},acceso_inmediato:{R2:3,R3:4},menos_mensajes:{R4:6},producto_personalizado:{R1:5},organizar_trabajo:{R4:6}},
    preparacion:{logo_diseno:{R1:1,R2:1},fotos_referencias:{R1:1,R3:1},presencia_existente:{R3:1,R4:1},ayuda_desde_cero:{R3:1},cotizando:{}}
  };
  for (const [campo, opciones] of Object.entries(tabla)) {
    const peso = campo === "contacto_actual" || campo === "mejora_deseada" ? 2 : 1;
    for (const [id, valor] of Object.entries(opciones[r[campo]] || {})) puntos[id] += valor*peso;
  }
  const evento = r.objetivo === "celebracion" || ["organizando_evento","regalo_detalle"].includes(r.situacion);
  const fisicoExplicito = ["recuerdo_fisico","producto_personalizado"].includes(r.mejora_deseada);
  const operativo = r.objetivo === "automatizar" || ["menos_mensajes","organizar_trabajo"].includes(r.mejora_deseada);
  const info = r.mejora_deseada === "acceso_inmediato";
  const presencial = r.contacto_actual === "en_persona";
  let id;
  if(operativo) id="R4";
  else if(evento && (fisicoExplicito || r.contacto_actual === "fecha_fija" || !info)) id="R1";
  else if(fisicoExplicito) id="R1";
  else if(info && presencial) id="R2";
  else if(info || r.contacto_actual === "internet") id="R3";
  else if(r.contacto_actual === "reservas_pedidos") id="R4";
  else id=["R1","R3","R2","R4"].reduce((best,candidate)=>puntos[candidate]>puntos[best]?candidate:best);
  const fisico = fisicoExplicito || (evento && r.contacto_actual === "fecha_fija");
  const digital = info || operativo || (r.objetivo === "mejorar_experiencia" && r.contacto_actual === "internet");
  if(fisico && digital && !operativo && !evento) id="R5";
  return id;
}

const CAMPOS_V3 = {
  objetivo: CAMPOS.objetivo.slice(0,5), situacion: CAMPOS.situacion.slice(0,5), contacto_actual: CAMPOS.contacto_actual.slice(0,5), mejora_deseada: CAMPOS.mejora_deseada.slice(0,5), preparacion: CAMPOS.preparacion.slice(0,5)
};
const ID_UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const IDS = new Set(Object.keys(TITULOS));
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
  return constante(sig, await firmaSesion(env,exp));
}
// Vincula la sesión a la contraseña vigente: una rotación invalida las cookies anteriores.
async function firmaSesion(env,exp){
  const clave=await firma(env.SESSION_SECRET,"admin-password:"+env.ADMIN_PASSWORD);
  return firma(clave,"admin-session-v2:"+exp);
}
// Tokens de proyecto de 256 bits: solo se guarda SHA-256 en D1.
function tokenCliente() {
  const bytes=crypto.getRandomValues(new Uint8Array(32));
  return btoa(String.fromCharCode(...bytes)).replace(/\+/g,"-").replace(/\//g,"_").replace(/=+$/,"");
}
async function hashTokenCliente(token) {
  const buffer=await crypto.subtle.digest("SHA-256",enc.encode(token));
  return Array.from(new Uint8Array(buffer),b=>b.toString(16).padStart(2,"0")).join("");
}
const SECCIONES_CLIENTE=["datos_negocio","servicios_productos","horarios_contacto","indicaciones"];
// Importes en centavos de MXN; nunca usar coma flotante para persistir dinero.
const PAQUETES_ECONOMICOS=new Set(["solo_fisico","presencia-digital","negocio-interactivo","gestion-comercial","gestion-profesional","a-medida"]);
const CAMPOS_IMPORTE=["implementacion","fabricacion","extras","mensualidad"];
function importeValido(n){return Number.isSafeInteger(n)&&n>=0&&n<=100000000;}
function totalesEconomicos(d){
 const inicial=d.implementacion+d.fabricacion+d.extras;
 const iva=n=>Math.floor((n*16+50)/100);
 return {subtotal_inicial:inicial,iva_inicial:iva(inicial),total_inicial:inicial+iva(inicial),iva_mensual:iva(d.mensualidad),total_mensual:d.mensualidad+iva(d.mensualidad)};
}
function propuestaEconomicaValida(d){
 return !!d&&PAQUETES_ECONOMICOS.has(d.paquete)&&typeof d.alcance==="string"&&d.alcance.trim().length>=3&&d.alcance.length<=4000&&CAMPOS_IMPORTE.every(k=>importeValido(d[k]))&&Number.isSafeInteger(d.version)&&d.version>=0&&d.version<=1000000&&(d.paquete!=="solo_fisico"||(!d.implementacion&&!d.mensualidad))&&CAMPOS_IMPORTE.some(k=>d[k]>0);
}
function fechaEconomicaValida(v){
 if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v))return false;
 const n=new Date(v+"T00:00:00Z");
 return Number.isFinite(n.getTime())&&n.toISOString().slice(0,10)===v&&v<=(new Date()).toISOString().slice(0,10)&&v>="2000-01-01";
}
function pagoEconomicoValido(d){return !!d&&typeof d.id==="string"&&ID_UUID.test(d.id)&&Number.isSafeInteger(d.importe)&&d.importe>0&&d.importe<=348000000&&fechaEconomicaValida(d.fecha)&&["efectivo","transferencia","otro"].includes(d.metodo)&&typeof d.referencia==="string"&&d.referencia.length<=160;}
// Calendario comercial de La Paz: fin exclusivo, sin cargos automáticos.
function hoyMensualidad(now=new Date()){
 const p=new Intl.DateTimeFormat("en-CA",{timeZone:"America/Mazatlan",year:"numeric",month:"2-digit",day:"2-digit"}).formatToParts(now);
 const v=Object.fromEntries(p.map(x=>[x.type,x.value]));return v.year+"-"+v.month+"-"+v.day;
}
function fechaMensualidad(v){
 if(typeof v!=="string"||!/^\d{4}-\d{2}-\d{2}$/.test(v)||v<"2000-01-01"||v>"2099-12-31")return false;
 const d=new Date(v+"T00:00:00Z");return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===v;
}
function finMensualidad(inicio,ancla){
 if(!fechaMensualidad(inicio)||!Number.isInteger(ancla)||ancla<1||ancla>31)throw Error("Periodo inválido");
 const [y,m]=inicio.split("-").map(Number);const ultimo=new Date(Date.UTC(y,m+1,0)).getUTCDate();
 return new Date(Date.UTC(y,m,Math.min(ancla,ultimo))).toISOString().slice(0,10);
}
function estadoMensualidad(q,ultimo,hoy){
 if(!q.inicio)return {situacion:"sin_iniciar",proxima:null,dia_ancla:null};
 const proxima=ultimo?.fin||q.inicio,ancla=ultimo?.dia_ancla||Number(q.inicio.slice(-2));
 const situacion=q.estado==="cancelado"?"cancelado":q.estado==="suspendido"?"suspendido":proxima<=hoy?(ultimo?"vencido":"pendiente"):"al_corriente";
 return {situacion,proxima,dia_ancla:ancla};
}
function pagoMensualidadValido(d,hoy){
 return !!d&&typeof d.id==="string"&&ID_UUID.test(d.id)&&fechaMensualidad(d.fecha)&&d.fecha<=hoy&&fechaMensualidad(d.esperada)&&["continuar","reiniciar"].includes(d.modo)&&["efectivo","transferencia","otro"].includes(d.metodo)&&typeof d.referencia==="string"&&d.referencia.length<=160;
}
function periodoMensualidad(q,ultimo,d,hoy){
 const e=estadoMensualidad(q,ultimo,hoy);
 if(q.estado!=="activo"||d.esperada!==e.proxima)return null;
 if(d.modo==="reiniciar"&&e.proxima>=hoy)return null;
 // Solo la renovación solicitada: reiniciar desde hoy no crea cuotas por el intervalo vencido.
 const inicio=d.modo==="reiniciar"?hoy:e.proxima;
 const ancla=d.modo==="reiniciar"?Number(hoy.slice(-2)):e.dia_ancla;
 return {inicio,fin:finMensualidad(inicio,ancla),dia_ancla:ancla};
}

// Aprobación de la versión registrada; no despliega ni modifica dominios.
function urlEntrega(v){
 if(typeof v!=="string"||v.length>500||!/^https:\/\/[a-z0-9.-]+\.[a-z]{2,}(?::443)?(?:\/[^\s\\?#]*)?$/i.test(v))return false;
 try{const u=new URL(v);return u.protocol==="https:"&&!u.username&&!u.password&&!u.search&&!u.hash&&!u.hostname.endsWith(".local");}catch{return false;}
}
function textoEntrega(v,min,max){return typeof v==="string"&&v.trim().length>=min&&v.length<=max;}
function revisionEntregaValida(d){return !!d&&["web","fisica","combinada"].includes(d.modalidad)&&textoEntrega(d.revision,1,120)&&textoEntrega(d.notas_revision,3,2000)&&Number.isSafeInteger(d.version)&&d.version>=0&&(d.modalidad==="fisica"?d.vista_previa==="":urlEntrega(d.vista_previa));}
function decisionEntregaValida(d){return !!d&&["aprobado","requiere_cambios"].includes(d.decision)&&textoEntrega(d.comentario,d.decision==="requiere_cambios"?3:0,1000)&&Number.isSafeInteger(d.version)&&d.version>0;}
function entregaFinalValida(d,q,hoy){
 if(!d||!q||q.decision!=="aprobado"||q.fecha_entrega||!q.fecha_decision||d.version!==q.version||!fechaMensualidad(d.fecha_entrega)||d.fecha_entrega>hoy||d.fecha_entrega<q.fecha_decision)return false;
 if(q.modalidad==="fisica")return d.tipo_dominio==="no_aplica"&&d.url_final===""&&d.fecha_publicacion==="";
 return ["propio","subdominio"].includes(d.tipo_dominio)&&urlEntrega(d.url_final)&&fechaMensualidad(d.fecha_publicacion)&&d.fecha_publicacion>=q.fecha_decision&&d.fecha_publicacion<=d.fecha_entrega;
}
function garantiaEntrega(fecha){const d=new Date(fecha+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+60);return d.toISOString().slice(0,10);}

// Alertas calculadas, no obligaciones ni cobros. Los umbrales son orientativos.
function desplazarDiaAlerta(fecha,n){const d=new Date(fecha+"T00:00:00Z");d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10);}
const TIPOS_ALERTA=Object.freeze({
 nueva:["Nueva solicitud","alta","solicitudes"],
 seguimiento:["Solicitud por dar seguimiento","normal","solicitudes"],
 cotizacion:["Cotización pendiente de respuesta","normal","solicitudes"],
 materiales:["Materiales aún no recibidos","normal","proyectos"],
 revisar_materiales:["Materiales recibidos por revisar","normal","proyectos"],
 corregir_materiales:["Materiales requieren corrección","normal","proyectos"],
 aprobar:["Revisión pendiente de aprobación","normal","proyectos"],
 cambios:["Cliente solicita cambios","alta","proyectos"],
 entrega:["Revisión aprobada, entrega por registrar","normal","proyectos"],
 inicio:["Servicio entregado, inicio mensual por registrar","normal","mensualidades"],
 primer_pago:["Primer periodo pendiente","alta","mensualidades"],
 renovacion:["Renovación pendiente","alta","mensualidades"],
 vence:["Renovación en los próximos 7 días","normal","mensualidades"],
 garantia:["Garantía de desarrollo termina en los próximos 7 días","normal","proyectos"]
});
async function alertasComerciales(env,hoy=hoyMensualidad()){
 const db=env.QUIZ_DB,items=[],avisos=[];
 const pronto=desplazarDiaAlerta(hoy,7),seguimiento=desplazarDiaAlerta(hoy,-3);
 // Consultas separadas para que una migración pendiente no inutilice todo el panel.
 const grupos=[
 ["Solicitudes",[
 ["nueva","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,q.fecha AS fecha FROM quiz_propuestas q WHERE q.estado='nueva' ORDER BY q.fecha ASC LIMIT 101",[]],
 ["seguimiento","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,q.fecha AS fecha FROM quiz_propuestas q WHERE q.estado IN ('en_revision','contactado') AND substr(q.fecha,1,10)<=?1 AND NOT EXISTS(SELECT 1 FROM proyectos_cliente p WHERE p.propuesta_id=q.id) ORDER BY q.fecha ASC LIMIT 101",[seguimiento]]
 ]],
 ["Cotizaciones",[
 ["cotizacion","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,COALESCE(e.fecha_actualizacion,q.fecha) AS fecha FROM quiz_propuestas q LEFT JOIN propuestas_economicas e ON e.propuesta_id=q.id WHERE q.estado='cotizado' AND e.fecha_aceptacion IS NULL AND NOT EXISTS(SELECT 1 FROM proyectos_cliente p WHERE p.propuesta_id=q.id) ORDER BY fecha ASC LIMIT 101",[]]
 ]],
 ["Materiales",[
 ["materiales","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,p.fecha_creacion AS fecha FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.estado='recabando_materiales' AND NOT EXISTS(SELECT 1 FROM proyecto_secciones s WHERE s.proyecto_id=p.id AND trim(s.contenido)<>'') AND NOT EXISTS(SELECT 1 FROM proyecto_archivos a WHERE a.proyecto_id=p.id) ORDER BY fecha ASC LIMIT 101",[]],
 ["revisar_materiales","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,p.fecha_actualizacion AS fecha FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.estado NOT IN ('finalizado','cancelado') AND (EXISTS(SELECT 1 FROM proyecto_secciones s WHERE s.proyecto_id=p.id AND s.estado='recibido' AND trim(s.contenido)<>'') OR EXISTS(SELECT 1 FROM proyecto_archivos a WHERE a.proyecto_id=p.id AND a.estado='recibido')) ORDER BY fecha ASC LIMIT 101",[]],
 ["corregir_materiales","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,p.fecha_actualizacion AS fecha FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.estado NOT IN ('finalizado','cancelado') AND (EXISTS(SELECT 1 FROM proyecto_secciones s WHERE s.proyecto_id=p.id AND s.estado='requiere_correccion') OR EXISTS(SELECT 1 FROM proyecto_archivos a WHERE a.proyecto_id=p.id AND a.estado='requiere_correccion')) ORDER BY fecha ASC LIMIT 101",[]]
 ]],
 ["Entregas",[
 ["aprobar","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,e.fecha_actualizacion AS fecha FROM proyecto_entregas e JOIN proyectos_cliente p ON p.id=e.proyecto_id JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.estado NOT IN ('finalizado','cancelado') AND e.decision='pendiente' AND e.fecha_entrega IS NULL ORDER BY fecha ASC LIMIT 101",[]],
 ["cambios","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,e.fecha_decision AS fecha FROM proyecto_entregas e JOIN proyectos_cliente p ON p.id=e.proyecto_id JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.estado NOT IN ('finalizado','cancelado') AND e.decision='requiere_cambios' AND e.fecha_entrega IS NULL ORDER BY fecha ASC LIMIT 101",[]],
 ["entrega","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,e.fecha_decision AS fecha FROM proyecto_entregas e JOIN proyectos_cliente p ON p.id=e.proyecto_id JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.estado NOT IN ('finalizado','cancelado') AND e.decision='aprobado' AND e.fecha_entrega IS NULL ORDER BY fecha ASC LIMIT 101",[]],
 ["garantia","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,e.garantia_hasta AS fecha FROM proyecto_entregas e JOIN proyectos_cliente p ON p.id=e.proyecto_id JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.estado<>'cancelado' AND e.garantia_hasta BETWEEN ?1 AND ?2 ORDER BY fecha ASC LIMIT 101",[hoy,pronto]]
 ]],
 ["Mensualidades",[
 ["inicio","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,d.fecha_entrega AS fecha FROM proyecto_entregas d JOIN proyectos_cliente p ON p.id=d.proyecto_id JOIN quiz_propuestas q ON q.id=p.propuesta_id JOIN propuestas_economicas e ON e.propuesta_id=q.id WHERE p.estado<>'cancelado' AND d.fecha_entrega IS NOT NULL AND e.fecha_aceptacion IS NOT NULL AND e.mensualidad>0 AND e.paquete<>'solo_fisico' AND NOT EXISTS(SELECT 1 FROM suscripciones_cliente s WHERE s.propuesta_id=q.id) ORDER BY fecha ASC LIMIT 101",[]],
 ["primer_pago","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,s.inicio AS fecha FROM suscripciones_cliente s JOIN quiz_propuestas q ON q.id=s.propuesta_id WHERE s.estado='activo' AND s.inicio<=?1 AND NOT EXISTS(SELECT 1 FROM pagos_mensualidad m WHERE m.propuesta_id=q.id) ORDER BY fecha ASC LIMIT 101",[hoy]],
 ["renovacion","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,MAX(m.fin) AS fecha FROM suscripciones_cliente s JOIN quiz_propuestas q ON q.id=s.propuesta_id JOIN pagos_mensualidad m ON m.propuesta_id=q.id WHERE s.estado='activo' GROUP BY q.id HAVING MAX(m.fin)<=?1 ORDER BY fecha ASC LIMIT 101",[hoy]],
 ["vence","SELECT q.folio,q.nombre,q.proyecto,q.telefono,q.ficha_json,MAX(m.fin) AS fecha FROM suscripciones_cliente s JOIN quiz_propuestas q ON q.id=s.propuesta_id JOIN pagos_mensualidad m ON m.propuesta_id=q.id WHERE s.estado='activo' GROUP BY q.id HAVING MAX(m.fin)>?1 AND MAX(m.fin)<=?2 ORDER BY fecha ASC LIMIT 101",[hoy,pronto]]
 ]]
 ];
 for(const [grupo,consultas] of grupos){
  for(const [tipo,sql,args] of consultas){
   try{let st=db.prepare(sql);if(args.length)st=st.bind(...args);const d=await st.all();
    if(d.results.length>100)avisos.push("Más de 100 alertas de "+TIPOS_ALERTA[tipo][0]+". Se muestran las primeras 100.");
    for(const q of d.results.slice(0,100)){
     const [titulo,prioridad,seccion]=TIPOS_ALERTA[tipo];
     const {ficha_json,...datos}=q;
     let servicio="";
     try{
      const f=JSON.parse(ficha_json||"{}");
      if(f.tipo_documento==="solicitud_servicio")servicio=f.titulo_servicio||(Object.hasOwn(TIPOS_FISICOS,f.servicio)?TIPOS_FISICOS[f.servicio]:"Impresión 3D");
      else if(f.tipo_documento==="solicitud_web")servicio=f.paquete||f.tipo_pagina||"Proyecto web a medida";
      else servicio=f.recomendacion?.titulo||"Cuestionario de orientación";
     }catch{}
     items.push({...datos,tipo,titulo,servicio:typeof servicio==="string"?servicio.slice(0,160):"",prioridad,seccion,fecha:String(q.fecha||"").slice(0,10)});
    }
   }catch{avisos.push(grupo+": no se pudo consultar "+TIPOS_ALERTA[tipo][0]+". Comprueba las migraciones y D1.");}
  }
 }
 items.sort((a,b)=>(a.prioridad==="alta"?0:1)-(b.prioridad==="alta"?0:1)||a.fecha.localeCompare(b.fecha)||a.folio.localeCompare(b.folio));
 return {hoy,items,avisos};
}
function resumenAlertas(d){
 const lineas=["Pendientes comerciales · "+d.hoy,"Total de alertas mostradas: "+d.items.length,""];
 for(const [tipo,[titulo]] of Object.entries(TIPOS_ALERTA)){
  const filas=d.items.filter(x=>x.tipo===tipo);if(!filas.length)continue;
  lineas.push(titulo+" ("+filas.length+")",...filas.slice(0,20).map(x=>x.folio+" · "+x.fecha),...(filas.length>20?["Consulta el resto en el panel."]:[]),"");
 }
 if(d.avisos.length)lineas.push("Consulta parcial:",...d.avisos,"");
 lineas.push("https://lapazimpresion3d.com/admin/#titulo-alertas","Resumen administrativo. No es un aviso de deuda ni genera cargos.");
 return lineas.join("\n");
}

const ESTADOS_REVISION_MATERIAL = new Set(["recibido","requiere_correccion","aprobado"]);
function revisionMaterialValida(data,esTexto) {
  return !!data && ESTADOS_REVISION_MATERIAL.has(data.estado) && (!esTexto || (typeof data.version==="string" && data.version.length<=35 && Number.isFinite(Date.parse(data.version))));
}
// Formato versionado dentro de la columna TEXT existente; conserva las notas anteriores.
const PREFIJO_INDICACIONES="LP_INDICACIONES_V1:";
const COLORES_INDICACIONES=new Set(["rojo","amarillo","verde","azul"]);
function indicacionesValidas(items){
 return Array.isArray(items)&&items.length<=10&&items.every(x=>x&&typeof x==="object"&&COLORES_INDICACIONES.has(x.color)&&typeof x.texto==="string"&&x.texto.trim().length>0&&x.texto.length<=2000)&&items.reduce((n,x)=>n+x.texto.length,0)<=10000;
}
function leerIndicaciones(valor){
 if(typeof valor!=="string"||!valor.trim())return [];
 if(valor.startsWith(PREFIJO_INDICACIONES)){
  try{const items=JSON.parse(valor.slice(PREFIJO_INDICACIONES.length));if(indicacionesValidas(items))return items;}catch{}
 }
 return [{color:"rojo",texto:valor}];
}
function datosIndicaciones(valor){
 const indicaciones=leerIndicaciones(valor);
 return {indicaciones,instrucciones:indicaciones.map(x=>x.texto).join("\n\n")};
}

// Seguimiento publicado: separado del estado general y de las decisiones de entrega.
const ETAPAS_SEGUIMIENTO={fisica:6,web:7,combinada:9};
const ORIGEN_MATERIALES=new Set(["portal","whatsapp","correo","personal","cotizacion","mixto","ninguno"]);
function formatoSeguimiento(d){return d.formato||"detallado";}
function recepcionValida(r){return !!r&&ORIGEN_MATERIALES.has(r.origen)&&typeof r.observaciones==="string"&&r.observaciones.trim().length>0&&r.observaciones.length<=1000;}
function corregirRecepcion(s,r,ahora){
 const recepcion={...s.recepcion,origen:r.origen,observaciones:r.observaciones.trim(),fecha_edicion:ahora,revision_edicion:(s.recepcion.revision_edicion||0)+1};
 return {...s,recepcion,historial:s.historial.map(h=>h.recepcion?{...h,recepcion}:h)};
}
function aplicarRecepcion(s,r,ahora){
 const completadas=[...new Set([...s.completadas,0])].sort((a,b)=>a-b);
 const actual=s.actual===0||s.actual===null?(completadas.includes(1)?null:1):s.actual;
 return {...s,actual,completadas,recepcion:{origen:r.origen,observaciones:r.observaciones.trim(),fecha:ahora}};
}
function modalidadSeguimiento(p){
 let f={};try{f=JSON.parse(p.ficha_json||"{}");}catch{}
 return ["llaveros","soporte_qr","fdm_medida","resina"].includes(f.servicio)||
 (f.tipo_documento==="ficha_quiz"&&["R1","R2","R6","R7"].includes(f.recomendacion?.id))?"fisica":"web";
}
function seguimientoVacio(p){return {modalidad:modalidadSeguimiento(p),formato:"detallado",actual:null,completadas:[],fecha_estimada:"",historial:[],version:0};}
function seguimientoValido(d){
 if(!d||!Object.hasOwn(ETAPAS_SEGUIMIENTO,d.modalidad)||!Number.isSafeInteger(d.version)||d.version<0)return false;
 if(!["detallado","simplificado"].includes(formatoSeguimiento(d)))return false;
 const n=formatoSeguimiento(d)==="simplificado"?4:ETAPAS_SEGUIMIENTO[d.modalidad],indice=i=>Number.isInteger(i)&&i>=0&&i<n;
 return (d.actual===null||indice(d.actual))&&Array.isArray(d.completadas)&&d.completadas.length<=n&&d.completadas.every(indice)&&new Set(d.completadas).size===d.completadas.length&&!d.completadas.includes(d.actual)&&
 typeof d.fecha_estimada==="string"&&(d.fecha_estimada===""||fechaMensualidad(d.fecha_estimada))&&typeof d.mensaje==="string"&&d.mensaje.length<=2000;
}
async function leerSeguimiento(db,p){
 // SELECT * permite distinguir una migración aún no autorizada sin afectar otros módulos.
 const row=await db.prepare("SELECT * FROM proyectos_cliente WHERE id=?1").bind(p.id).first();
 if(!row||!Object.hasOwn(row,"seguimiento_json"))return null;
 return {raw:row.seguimiento_json,estado:row.estado,data:row.seguimiento_json?JSON.parse(row.seguimiento_json):seguimientoVacio(p)};
}


async function tablaAvances(db){
 return !!await db.prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='proyecto_avances_fotos'").first();
}
async function fotosAvances(db,id){
 return (await db.prepare("SELECT id,version_avance,descripcion,fecha_subida FROM proyecto_avances_fotos WHERE proyecto_id=?1 ORDER BY fecha_subida DESC,id").bind(id).all()).results;
}
async function imagenAvance(env,id,foto){
 if(!env.COTIZACIONES_R2)return error("Almacenamiento no configurado",503);
 const a=await env.QUIZ_DB.prepare("SELECT tipo_mime FROM proyecto_avances_fotos WHERE proyecto_id=?1 AND id=?2").bind(id,foto).first();
 if(!a)return error("Imagen no encontrada",404);
 const obj=await env.COTIZACIONES_R2.get("avances/"+id+"/"+foto);
 if(!obj)return error("Imagen no encontrada",404);
 return new Response(obj.body,{headers:{"Content-Type":a.tipo_mime,"Content-Disposition":"inline","Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox","X-Frame-Options":"DENY"}});
}

async function proyectoDeCliente(request,env,tokenExplicito) {
  const cookie=(request.headers.get("Cookie")||"").split(";").map(x=>x.trim()).find(x=>x.startsWith("lp3d_cliente="));
  const token=tokenExplicito||cookie?.slice("lp3d_cliente=".length);
  if(!token || !/^[A-Za-z0-9_-]{43}$/.test(token))return null;
  const hash=await hashTokenCliente(token);
  return await env.QUIZ_DB.prepare(
    "SELECT p.id,p.estado,p.propuesta_id,p.instrucciones,q.folio,q.nombre,q.proyecto,q.servicio_id,q.ficha_json FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.acceso_token_hash=?1 AND p.acceso_revocado=0 AND p.acceso_expira>?2 AND p.estado<>'cancelado'"
  ).bind(hash,new Date().toISOString()).first();
}
async function leerJson(request, max=6000) {
  if (!request.headers.get("content-type")?.toLowerCase().startsWith("application/json")) return null;
  const length=Number(request.headers.get("content-length")||0);
  if(length>max) return null;
  const body=await request.text();
  if(body.length>max) return null;
  try { return JSON.parse(body); } catch { return null; }
}
// Límite por ventana de tiempo, basado en un HMAC efímero de la IP y un secreto.
// No se persisten direcciones IP ni el identificador de la persona.
async function verificarLimite(request,env,accion,maximo,ventanaSegundos) {
  if (!env.RATE_LIMIT_SECRET) return false; // sin secreto, no habilitar recepción en producción
  const ip = request.headers.get("CF-Connecting-IP") || "ip-desconocida";
  const ventana = Math.floor(Date.now() / (ventanaSegundos*1000));
  const clave = await firma(env.RATE_LIMIT_SECRET,`${accion}:${ventana}:${ip}`);
  await env.QUIZ_DB.prepare("INSERT INTO quiz_limites (clave,accion,contador,caduca) VALUES (?1,?2,1,?3) ON CONFLICT(clave) DO UPDATE SET contador=contador+1")
    .bind(clave,accion,(ventana+1)*ventanaSegundos).run();
  const fila = await env.QUIZ_DB.prepare("SELECT contador FROM quiz_limites WHERE clave=?1").bind(clave).first();
  return (fila?.contador || 0) <= maximo;
}
function fichaValida(data) {
  if(!data || data.tipo_documento!=="ficha_quiz" || !["3.0","4.0","5.0"].includes(data.version_esquema)) return false;
  const permitidos=data.version_esquema==="3.0"?CAMPOS_V3:CAMPOS;
  if(!data.respuestas || typeof data.respuestas!=="object" || Array.isArray(data.respuestas) || Object.keys(CAMPOS).some(k=>!permitidos[k].includes(data.respuestas[k]))) return false;
  if(data.version_esquema==="5.0" && (!presupuestoQuizValido(data.respuestas.presupuesto,recomendacionEsperada(data.respuestas)) || !data.respuestas.presupuesto)) return false;
  if(!IDS.has(data.recomendacion?.id) || data.recomendacion.titulo!==TITULOS[data.recomendacion.id]) return false;
  return data.recomendacion.id===(data.version_esquema!=="3.0"?recomendacionEsperada(data.respuestas):recomendacionEsperadaV3(data.respuestas));
}
function normalizarFicha(data,id) {
  return {tipo_documento:"ficha_quiz",version_esquema:data.version_esquema,id_diagnostico:id,id_proyecto:null,origen:"lapazimpresion3d_web",fecha_generacion:new Date().toISOString(),respuestas:{...Object.fromEntries(Object.keys(CAMPOS).map(k=>[k,data.respuestas[k]])),...(data.version_esquema==="5.0"?{presupuesto:data.respuestas.presupuesto}:{})},recomendacion:{id:data.recomendacion.id,titulo:data.recomendacion.titulo,estado:"orientativa",complemento_sugerido:typeof data.recomendacion.complemento_sugerido==="string"?data.recomendacion.complemento_sugerido.slice(0,350):null}};
}
function contactoValido(c) {
 return c && typeof c==="object" && !Array.isArray(c) && typeof c.nombre==="string" && c.nombre.trim().length>=2 && c.nombre.trim().length<=100 && typeof c.proyecto==="string" && c.proyecto.length<=120 && typeof c.telefono==="string" && /^\d{10}$/.test(c.telefono) && typeof c.comentario==="string" && c.comentario.length<=800;
}

// Solicitudes directas de la sección «Cotiza tu página web».
// Reutiliza quiz_propuestas sin cambiar el esquema D1 ni alterar la ruta del cuestionario.
const WEB_PAQUETES = new Set(["Presencia digital","Negocio interactivo","Gestión comercial","Gestión profesional"]);
const WEB_TIPOS = new Set(["Página de contacto digital", "Página web para mi negocio", "Menú digital para restaurantes", "Catálogo de productos para comercios"]);
const WEB_FUNCIONES = new Set(["Carrito y pedidos desde la página", "Pedidos por WhatsApp", "Efectivo y transferencias con registro manual", "Cotizar integración de pagos en línea con tarjeta", "Pedidos para recoger o a domicilio", "Pedidos desde las mesas", "Reservaciones y agenda", "Reservaciones de tours y pases turísticos", "Panel privado", "Pantalla de cocina y comandas", "Seguimiento de pedidos", "Reportes de pedidos y cobros", "Punto de venta y caja", "Inventario básico", "Tickets", "Inventario avanzado", "Costos y proveedores", "Fidelización", "Administración avanzada", "Automatizaciones", "Reportes avanzados", "Página comercial personalizada", "Información de contacto y horarios", "Menú digital", "Catálogo de productos"]);
const WEB_COMPLEMENTOS = new Set(["Código QR para la página", "Soportes QR o llaveros con NFC opcional", "Carga inicial de productos, precios y fotografías", "Configuración inicial para buscadores y aviso de privacidad", "Capacitación para administrar la página"]);
function textoWeb(v,min,max) {return typeof v==='string' && v.trim().length>=min && v.trim().length<=max;}
function listaWeb(v,permitidos) {return Array.isArray(v) && v.length<=permitidos.size && v.every(x=>typeof x==='string' && permitidos.has(x)) && new Set(v).size===v.length;}
const WEB_DOMINIO_ESTADOS = new Set(["subdominio", "necesito_dominio", "tengo_dominio", "orientacion"]);
function dominioWebValido(d) {
  // Compatible con solicitudes abiertas antes de esta actualización.
  if (d.situacion_dominio == null) return true;
  return WEB_DOMINIO_ESTADOS.has(d.situacion_dominio) &&
    (d.dominio_actual == null || (typeof d.dominio_actual === "string" && d.dominio_actual.length <= 120 && !/[<>\r\n]/.test(d.dominio_actual))) &&
    (d.situacion_dominio === "tengo_dominio" || !d.dominio_actual);
}
function solicitudWebValida(d) {
 return d && typeof d==='object' && !Array.isArray(d) &&
   textoWeb(d.nombre,2,100) && textoWeb(d.negocio,2,100) && textoWeb(d.giro,2,80) &&
   typeof d.telefono==='string' && /^\d{10}$/.test(d.telefono) &&
   (d.paquete == null || d.paquete === '' || WEB_PAQUETES.has(d.paquete)) &&
   (d.tipo_pagina == null || d.tipo_pagina === "" || WEB_TIPOS.has(d.tipo_pagina)) && listaWeb(d.funciones,WEB_FUNCIONES) &&
   listaWeb(d.complementos,WEB_COMPLEMENTOS) && textoWeb(d.detalles,5,500) && presupuestoWebValido(d.presupuesto??"") &&
   dominioWebValido(d) && d.acepta_privacidad===true;
}

// Servicio físico: formulario único con campos específicos, registro en quiz_propuestas.
const TIPOS_FISICOS = Object.freeze({llaveros:"Llaveros personalizados",fdm_medida:"Impresión 3D a medida",resina:"Figuras y miniaturas en resina",soporte_qr:"Soportes QR/NFC"});
const CAMPOS_FISICOS = Object.freeze({
 llaveros:["cantidad","tamano","diseno","colores","nfc","uso"],
 fdm_medida:["cantidad","tamano","uso","material","resistencia","referencia"],
 resina:["cantidad","tamano","uso","detalle","referencia"],
 soporte_qr:["cantidad","tamano","uso","logo","destino_qr","contenido_existente","nfc"]
});
const TIPOS_TRABAJO_ACADEMICO=new Set(["proyecto_escolar","prototipo","maqueta","investigacion","otro"]);
// Mantener rangos anteriores para solicitudes/formularios ya abiertos en el navegador.
const PRESUPUESTOS = new Set(["menos_500","500_1500","1500_3500","3500_8000","8000_15000","mas_15000","prefiero_no_indicar","sin_definir","1500_3000","3000_6000","mas_6000",""]);
function presupuestoValido(v) {return typeof v==="string"&&PRESUPUESTOS.has(v);}
// Preferencias web separadas: no ampliar valores permitidos en impresión o cuestionario.
const PREFERENCIAS_WEB = Object.freeze({"web_precios_publicados":"Los precios publicados se ajustan a mi presupuesto","web_ajustar_alcance":"Quiero ajustar el alcance a mi presupuesto","web_presupuesto_propio":"Tengo otro presupuesto (lo indicaré en los detalles)"});
function presupuestoWebValido(v) {return presupuestoValido(v)||(typeof v==="string"&&Object.hasOwn(PREFERENCIAS_WEB,v));}
const INVERSIONES_QUIZ_WEB=Object.freeze({"quiz_web_p1":"Presencia digital — implementación desde $750 MXN · $149 MXN al mes + IVA","quiz_web_p2":"Negocio interactivo — implementación desde $1,500 MXN · $249 MXN al mes + IVA","quiz_web_p3":"Gestión comercial — implementación desde $2,500 MXN · $349 MXN al mes + IVA","quiz_web_p4":"Gestión profesional — implementación desde $3,500 MXN · $499 MXN al mes + IVA","quiz_web_medida":"Necesito una solución digital a medida; quiero conocer los costos","quiz_web_combinado":"Proyecto combinado: cotizar fabricación 3D y servicio digital por separado"});
// Rangos totales del cuestionario, separados de los históricos y de los formularios directos.
const RANGOS_QUIZ_TOTAL=Object.freeze({"quiz_total_hasta_500":"Hasta $500 MXN","quiz_total_500_1500":"De $500 a $1,500 MXN","quiz_total_1500_3500":"De $1,500 a $3,500 MXN","quiz_total_3500_7000":"De $3,500 a $7,000 MXN","quiz_total_7000_10000":"De $7,000 a $10,000 MXN","quiz_total_10000_15000":"De $10,000 a $15,000 MXN","quiz_total_mas_15000":"Más de $15,000 MXN"});
function presupuestoQuizValido(v,id){return presupuestoValido(v)||(typeof v==="string"&&(Object.hasOwn(INVERSIONES_QUIZ_WEB,v)||Object.hasOwn(RANGOS_QUIZ_TOTAL,v)));}
function solicitudFisicaValida(d){
 if(!d||typeof d!=="object"||Array.isArray(d)||!Object.hasOwn(TIPOS_FISICOS,d.servicio)||!textoWeb(d.nombre,2,100)||!/^\d{10}$/.test(d.telefono||"")||!textoWeb(d.detalles,5,1200)||d.acepta_privacidad!==true||!presupuestoValido(d.presupuesto))return false;
 if(!["","negocio","evento","personal","academico"].includes(d.contexto||""))return false;
 if(d.contexto==="academico"){
   if(!TIPOS_TRABAJO_ACADEMICO.has(d.tipo_trabajo_academico))return false;
   if(typeof d.institucion_academica!=="string"||d.institucion_academica.length>120)return false;
 }else if((d.tipo_trabajo_academico||"")!==""||(d.institucion_academica||"")!=="")return false;
 if(!["","si","no","no_se"].includes(d.fecha_prioritaria||""))return false;
 if(typeof d.proyecto!=="string"||d.proyecto.length>120 ||typeof d.fecha_deseada!=="string"||d.fecha_deseada.length>30)return false;
 const claves=CAMPOS_FISICOS[d.servicio];
 if(!d.campos||typeof d.campos!=="object"||Array.isArray(d.campos)||Object.keys(d.campos).some(k=>!claves.includes(k)))return false;
 return claves.every(k=>typeof d.campos[k]==="string"&&d.campos[k].length<=280);
}
// Resumen de la solicitud para el correo administrativo. Las imágenes permanecen privadas en R2.
function etiquetaCorreo(k) {
  const especiales={nombre:"Nombre",telefono:"WhatsApp",proyecto:"Proyecto",negocio:"Negocio",presupuesto:"Presupuesto",detalles:"Descripción",comentario:"Comentarios",servicio:"Servicio",tipo_pagina:"Tipo de página",situacion_dominio:"Dominio",dominio_actual:"Dominio existente",contexto:"Tipo de solicitud",institucion_academica:"Institución educativa",tipo_trabajo_academico:"Trabajo académico",fecha_deseada:"Fecha deseada",fecha_prioritaria:"Urgencia",cantidad:"Cantidad",tamano:"Tamaño",diseno:"Diseño",colores:"Colores",nfc:"NFC",destino_qr:"Destino QR",material:"Material",giro:"Giro del negocio",funciones:"Funciones",complementos:"Complementos",objetivo:"Objetivo",situacion:"Situación",contacto_actual:"Contacto actual",mejora_deseada:"Mejora deseada",preparacion:"Material disponible"};
  return especiales[k] || k.replace(/_/g," ").replace(/^./,x=>x.toUpperCase());
}
function valorCorreo(v) {
  if(v==null || v==="") return "No indicado";
  if(Array.isArray(v)) return v.length?v.map(valorCorreo).join(", "):"Ninguno";
  if(typeof v==="boolean") return v?"Sí":"No";
  if(typeof v==="object") return Object.entries(v).filter(([k])=>!['clave','id_solicitud','id_diagnostico','fecha_generacion','estado','precio_final_pendiente'].includes(k)).map(([k,x])=>`${etiquetaCorreo(k)}: ${valorCorreo(x)}`).join("; ");
  return String(v).replace(/[\x00-\x08\x0b\x0c\x0e-\x1f]/g," ").slice(0,1600);
}
function resumenCorreo(info) {
  const filas=[];
  const agregar=(nombre,valor)=>{if(valor!==undefined&&valor!==null&&valor!=="")filas.push(`${nombre}: ${valorCorreo(valor)}`);};
  agregar("Folio",info.folio);
  agregar("Servicio",info.servicio);
  agregar("Cliente",info.nombre);
  agregar("WhatsApp",info.telefono);
  agregar("Negocio o proyecto",info.proyecto);
  if(typeof info.presupuesto==="string"&&Object.hasOwn(PREFERENCIAS_WEB,info.presupuesto)) agregar("Preferencia de inversión",PREFERENCIAS_WEB[info.presupuesto]);
  else if(typeof info.presupuesto==="string"&&Object.hasOwn(RANGOS_QUIZ_TOTAL,info.presupuesto)) agregar("Presupuesto total de referencia (12 meses para servicios digitales)",RANGOS_QUIZ_TOTAL[info.presupuesto]);
  else if(typeof info.presupuesto==="string"&&Object.hasOwn(INVERSIONES_QUIZ_WEB,info.presupuesto)) agregar("Inversión digital de referencia",INVERSIONES_QUIZ_WEB[info.presupuesto]);
  else agregar("Presupuesto",info.presupuesto);
  agregar("Tipo de solicitud",info.contexto);
  if(info.paquete) agregar("Paquete de interés",info.paquete);
  if(info.tipo_pagina) agregar("Tipo de página",info.tipo_pagina);
  if(info.giro) agregar("Giro",info.giro);
  if(info.dominio) agregar("Dominio",info.dominio);
  if(info.funciones) agregar("Funciones",info.funciones);
  if(info.complementos) agregar("Complementos",info.complementos);
  if(info.academico) agregar("Datos académicos",info.academico);
  if(info.campos) {filas.push("", "CARACTERÍSTICAS DEL PROYECTO");for(const [k,v] of Object.entries(info.campos))agregar(etiquetaCorreo(k),v);}
  if(info.respuestas) {filas.push("", "RESPUESTAS DEL CUESTIONARIO");for(const [k,v] of Object.entries(info.respuestas))agregar(etiquetaCorreo(k),k==="presupuesto"?(Object.hasOwn(RANGOS_QUIZ_TOTAL,v)?RANGOS_QUIZ_TOTAL[v]:Object.hasOwn(INVERSIONES_QUIZ_WEB,v)?INVERSIONES_QUIZ_WEB[v]:v):v);}
  if(info.recomendacion) agregar("Recomendación",info.recomendacion);
  agregar("Descripción",info.detalles);
  agregar("Comentarios",info.comentario);
  if(info.imagenes?.length)agregar("Imágenes adjuntas",`${info.imagenes.length} (disponibles únicamente en el panel privado)`);
  filas.push("", "Consulta y administra la solicitud en:","https://lapazimpresion3d.com/admin/", "", "Correo administrativo confidencial. No reenviar a terceros.");
  return filas.join("\n").slice(0,14000);
}
async function notificarPropuesta(env,info) {
  if(!env.RESEND_API_KEY || !env.NOTIFY_EMAIL || !env.EMAIL_FROM) return;
  const folio=info.folio;
  const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":`quiz-${folio}`},body:JSON.stringify({from:env.EMAIL_FROM,to:[env.NOTIFY_EMAIL],subject:`Nueva cotización ${info.servicio||"Lapazimpresion3d"} · ${folio}`,text:resumenCorreo(info)})});
  if(!res.ok) console.error("No se envió el aviso de propuesta",res.status);
}
// Adjuntos opcionales: solo imágenes seguras, privadas, por solicitud.
const IMG_MIME={"image/jpeg":"jpg","image/png":"png","image/webp":"webp"};
const IMG_MAX=4*1024*1024;
function imagenReal(bytes,mime){
 if(mime==='image/jpeg')return bytes[0]===255&&bytes[1]===216&&bytes[2]===255;
 if(mime==='image/png')return [137,80,78,71,13,10,26,10].every((x,i)=>bytes[i]===x);
 if(mime==='image/webp')return String.fromCharCode(...bytes.slice(0,4))==='RIFF'&&String.fromCharCode(...bytes.slice(8,12))==='WEBP';
 return false;
}
async function limpiarImagenes(env,imagenes){if(!env.COTIZACIONES_R2)return;await Promise.allSettled((imagenes||[]).map(a=>env.COTIZACIONES_R2.delete(a.clave)));}
// Validar antes de procesar el cuerpo, almacenar archivos o registrar solicitudes.
async function verificarTurnstile(request,env,action){
  if(!env.TURNSTILE_SECRET)return error("Verificación de seguridad no disponible. Intenta más tarde.",503);
  const token=request.headers.get("X-Turnstile-Token");
  if(!token||token.length>2048)return error("Completa la verificación de seguridad.",400);
  try{
    const body=new URLSearchParams({secret:env.TURNSTILE_SECRET,response:token});
    const ip=request.headers.get("CF-Connecting-IP");if(ip)body.set("remoteip",ip);
    const response=await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify",{method:"POST",body,signal:AbortSignal.timeout(10000)});
    if(!response.ok)return error("Verificación de seguridad no disponible. Intenta nuevamente.",503);
    const result=await response.json();
    if(result.success!==true||result.action!==action||!["lapazimpresion3d.com","www.lapazimpresion3d.com"].includes(result.hostname)||result.hostname!==new URL(request.url).hostname)return error("Verificación de seguridad inválida o vencida. Intenta nuevamente.",403);
    return null;
  }catch{return error("No se pudo comprobar la verificación de seguridad. Intenta nuevamente.",503);}
}
async function api(request,env,ctx) {
  const url=new URL(request.url), path=url.pathname;
  if(!env.QUIZ_DB) return error("Base de datos no configurada",503);
  if(path==="/api/servicios/propuestas" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!await verificarLimite(request,env,"propuesta_servicio",6,3600)) return error("Demasiadas solicitudes. Intenta más tarde.",429);
    const rechazoTurnstile=await verificarTurnstile(request,env,"cotizacion_impresion");
    if(rechazoTurnstile)return rechazoTurnstile;
    const largo=Number(request.headers.get('content-length')||0);
    if(largo>13*1024*1024) return error("Los archivos superan el límite permitido.",413);
    if(!request.headers.get('content-type')?.toLowerCase().startsWith('multipart/form-data')) return error("Formato de solicitud inválido.",415);
    let form;
    try {form=await request.formData();}catch{return error("No se pudieron leer los archivos.",400);}
    const datos=form.get('solicitud');
    if(typeof datos!=='string'||datos.length>6500)return error("Datos de solicitud inválidos.",400);
    let d;try{d=JSON.parse(datos);}catch{return error("Datos de solicitud inválidos.",400);}
    if(!solicitudFisicaValida(d)) return error("Revisa los campos y acepta el aviso de privacidad.",400);
    const fotos=form.getAll('imagenes');
    if(fotos.length>3||fotos.some(f=>!(f instanceof File)||!Object.hasOwn(IMG_MIME,f.type)||f.size>IMG_MAX||f.size===0))return error("Adjunta máximo 3 imágenes JPG, PNG o WebP de hasta 4 MB cada una.",400);
    if(fotos.length&&!env.COTIZACIONES_R2)return error("La recepción de imágenes aún no está habilitada. Envía tu solicitud sin imágenes.",503);
    const id=crypto.randomUUID(), fecha=new Date().toISOString();
    const imagenes=[];
    try{
      for(const f of fotos){
        const bytes=new Uint8Array(await f.arrayBuffer());
        if(!imagenReal(bytes,f.type))throw new Error('El formato de una imagen no es válido.');
        const clave=`solicitudes/${id}/${crypto.randomUUID()}.${IMG_MIME[f.type]}`;
        await env.COTIZACIONES_R2.put(clave,bytes,{httpMetadata:{contentType:f.type}});
        imagenes.push({clave,nombre:f.name.slice(0,120),tipo:f.type,tamano:f.size});
      }
    }catch(e){await limpiarImagenes(env,imagenes);return error(e?.message||"No se pudieron guardar las imágenes.",400);}
    const prefijo={llaveros:"LLA",fdm_medida:"FDM",resina:"RES",soporte_qr:"QR"}[d.servicio];
    const folio=`${prefijo}-${id.replace(/-/g,"").slice(0,10).toUpperCase()}`;
    const ficha={tipo_documento:"solicitud_servicio",version_esquema:"1.0",id_solicitud:id,origen:"formulario_directo",fecha_generacion:fecha,
      servicio:d.servicio,titulo_servicio:TIPOS_FISICOS[d.servicio],presupuesto:d.presupuesto,fecha_deseada:d.fecha_deseada,
      contexto:d.contexto||"",tipo_trabajo_academico:d.contexto==="academico"?d.tipo_trabajo_academico:"",institucion_academica:d.contexto==="academico"?d.institucion_academica:"",descuento_academico:{solicitado:d.contexto==="academico",porcentaje_sugerido:d.contexto==="academico"?5:0,estado:"pendiente_de_verificacion",aplicado_automaticamente:false},fecha_prioritaria:d.fecha_prioritaria||"",campos:d.campos,detalles:d.detalles,imagenes};
    let result;
    try{result=await env.QUIZ_DB.prepare("INSERT INTO quiz_propuestas (id,folio,fecha,nombre,proyecto,telefono,comentario,servicio_id,ficha_json,estado,privacidad_aceptada) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'nueva',1)")
      .bind(id,folio,fecha,d.nombre.trim(),(d.proyecto||TIPOS_FISICOS[d.servicio]).trim(),d.telefono,d.detalles.trim(),prefijo,JSON.stringify(ficha)).run();}
    catch(e){await limpiarImagenes(env,imagenes);throw e;}
    if(result.meta.changes!==1){await limpiarImagenes(env,imagenes);return error("No se pudo registrar la solicitud",500);}
    if(ctx?.waitUntil)ctx.waitUntil(notificarPropuesta(env,{folio,servicio:TIPOS_FISICOS[d.servicio],nombre:d.nombre,telefono:d.telefono,proyecto:d.proyecto,presupuesto:d.presupuesto,contexto:d.contexto,academico:d.contexto==="academico"?{tipo_trabajo:d.tipo_trabajo_academico,institucion:d.institucion_academica}:null,campos:d.campos,detalles:d.detalles,imagenes}).catch(e=>console.error("Aviso",e)));
    return json({ok:true,folio},201);
  }
  if(path==="/api/web/propuestas" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!await verificarLimite(request,env,"propuesta_web",6,3600)) return error("Demasiadas solicitudes. Intenta más tarde.",429);
    const rechazoTurnstile=await verificarTurnstile(request,env,"cotizacion_web");
    if(rechazoTurnstile)return rechazoTurnstile;
    const d=await leerJson(request,6000);
    if(!solicitudWebValida(d)) return error("Revisa los datos del formulario y acepta el aviso de privacidad.",400);
    const id=crypto.randomUUID(), fecha=new Date().toISOString();
    const folio=`WEB-${id.replace(/-/g,"").slice(0,10).toUpperCase()}`;
    const ficha={
      tipo_documento:"solicitud_web",version_esquema:"1.0",id_solicitud:id,
      origen:"cotiza_pagina_web",fecha_generacion:fecha,
      paquete:d.paquete||"",tipo_pagina:d.tipo_pagina||"",funciones:d.funciones,complementos:d.complementos,
      giro:d.giro,detalles:d.detalles,presupuesto:d.presupuesto||"",estado:"orientativa",
      dominio:{situacion:d.situacion_dominio||"no_indicado",actual:d.dominio_actual||"",precio_anual_referencia_mxn:700,precio_final_pendiente:true},
      renovacion_anual:{dominio:"segun_propuesta",operacion_y_soporte:"segun_propuesta"}
    };
    const result=await env.QUIZ_DB.prepare("INSERT INTO quiz_propuestas (id,folio,fecha,nombre,proyecto,telefono,comentario,servicio_id,ficha_json,estado,privacidad_aceptada) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'nueva',1)")
      .bind(id,folio,fecha,d.nombre.trim(),d.negocio.trim(),d.telefono,d.detalles.trim(),"WEB",JSON.stringify(ficha)).run();
    if(result.meta.changes!==1) return error("No se pudo registrar la solicitud",500);
    if(ctx?.waitUntil) ctx.waitUntil(notificarPropuesta(env,{folio,servicio:"Página web / servicios digitales",nombre:d.nombre,telefono:d.telefono,proyecto:d.negocio,presupuesto:d.presupuesto,paquete:d.paquete||"",tipo_pagina:d.tipo_pagina||"",giro:d.giro,dominio:{situacion:d.situacion_dominio||"No indicada",actual:d.dominio_actual||""},funciones:d.funciones,complementos:d.complementos,detalles:d.detalles}).catch(e=>console.error("Aviso por correo",e)));
    return json({ok:true,folio},201);
  }
  if(path==="/api/quiz/propuestas" && request.method==="POST") {
    if(!sameOrigin(request))return error("Origen no autorizado",403);
    if(!await verificarLimite(request,env,"propuesta",6,3600))return error("Demasiadas solicitudes. Intenta más tarde.",429);
    const rechazoTurnstile=await verificarTurnstile(request,env,"cotizacion_quiz");
    if(rechazoTurnstile)return rechazoTurnstile;
    const tipo=request.headers.get("content-type")?.toLowerCase()||"";
    let data, fotos=[];
    if(tipo.startsWith("multipart/form-data")){
      const largo=Number(request.headers.get("content-length")||0);
      if(largo>13*1024*1024)return error("Los archivos superan el límite permitido.",413);
      let form;
      try{form=await request.formData();}catch{return error("No se pudieron leer los archivos.",400);}
      const solicitud=form.get("solicitud");
      if(typeof solicitud!=="string"||solicitud.length>8500)return error("Datos de solicitud inválidos.",400);
      try{data=JSON.parse(solicitud);}catch{return error("Datos de solicitud inválidos.",400);}
      fotos=form.getAll("imagenes");
    }else{
      // Mantener compatibilidad con formularios antiguos que aún envían JSON.
      data=await leerJson(request,8500);
    }
    if(!data || !fichaValida(data.ficha))return error("Diagnóstico inválido",400);
    if(!contactoValido(data.contacto))return error("Datos de contacto inválidos",400);
    if(data.acepta_privacidad!==true)return error("Debes aceptar el aviso de privacidad",400);
    if(fotos.length>3 || fotos.some(f=>!(f instanceof File)||!Object.hasOwn(IMG_MIME,f.type)||f.size===0||f.size>IMG_MAX))
      return error("Adjunta máximo 3 imágenes JPG, PNG o WebP de hasta 4 MB cada una.",400);
    if(fotos.length&&!env.COTIZACIONES_R2)return error("La recepción de imágenes no está disponible.",503);
    const id=ID_UUID.test(data.ficha.id_diagnostico||"")?data.ficha.id_diagnostico:crypto.randomUUID();
    const c=data.contacto;
    const nombre=c.nombre.trim(),proyecto=c.proyecto.trim(),telefono=c.telefono,comentario=c.comentario.trim();
    const folio=`LP-${id.replace(/-/g,"").slice(0,10).toUpperCase()}`;
    // No sobrescribir ni adjuntar archivos si ya existe una solicitud con este identificador.
    const existente=await env.QUIZ_DB.prepare("SELECT telefono FROM quiz_propuestas WHERE id=?1").bind(id).first();
    if(existente){
      if(existente.telefono!==telefono)return error("Referencia repetida; vuelve a iniciar la solicitud",409);
      return json({ok:true,folio},200);
    }
    const ficha=normalizarFicha(data.ficha,id);
    const imagenes=[];
    try{
      for(const f of fotos){
        const bytes=new Uint8Array(await f.arrayBuffer());
        if(!imagenReal(bytes,f.type))throw new Error("Una imagen no tiene un formato válido.");
        const clave=`solicitudes/${id}/${crypto.randomUUID()}.${IMG_MIME[f.type]}`;
        await env.COTIZACIONES_R2.put(clave,bytes,{httpMetadata:{contentType:f.type}});
        imagenes.push({clave,nombre:f.name.slice(0,120),tipo:f.type,tamano:f.size});
      }
    }catch(e){await limpiarImagenes(env,imagenes);return error(e?.message||"No fue posible guardar las imágenes.",400);}
    if(imagenes.length)ficha.imagenes=imagenes;
    let result;
    try{
      result=await env.QUIZ_DB.prepare("INSERT OR IGNORE INTO quiz_propuestas (id,folio,fecha,nombre,proyecto,telefono,comentario,servicio_id,ficha_json,estado,privacidad_aceptada) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'nueva',1)")
        .bind(id,folio,ficha.fecha_generacion,nombre,proyecto,telefono,comentario,ficha.recomendacion.id,JSON.stringify(ficha)).run();
    }catch(e){await limpiarImagenes(env,imagenes);throw e;}
    if(result.meta.changes===0){
      await limpiarImagenes(env,imagenes);
      const anterior=await env.QUIZ_DB.prepare("SELECT telefono FROM quiz_propuestas WHERE id=?1").bind(id).first();
      if(!anterior || anterior.telefono!==telefono)return error("Referencia repetida; vuelve a iniciar la solicitud",409);
      return json({ok:true,folio},200);
    }
    if(ctx?.waitUntil)ctx.waitUntil(notificarPropuesta(env,{folio,servicio:TITULOS[ficha.recomendacion.id],nombre,telefono,proyecto,presupuesto:ficha.respuestas.presupuesto,respuestas:ficha.respuestas,recomendacion:ficha.recomendacion.titulo,comentario,imagenes}).catch(e=>console.error("Aviso por correo",e)));
    return json({ok:true,folio},201);
  }
  // La ruta histórica no crea prospectos identificables. Conservar solo consulta de registros anteriores.
  if(path==="/api/quiz/solicitudes" && request.method==="POST") return error("Este registro fue reemplazado por el formulario de propuestas",410);
  // Activación explícita para evitar bloquear al administrador antes de comprobar el widget.
  if(path==="/api/admin/login/config" && request.method==="GET"){
    return json({turnstile:env.ADMIN_TURNSTILE==="true"});
  }
  if(path==="/api/admin/login" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return error("Acceso no configurado",503);
    if(!await verificarLimite(request,env,"login",5,900)) return error("Demasiados intentos. Intenta más tarde.",429);
    if(env.ADMIN_TURNSTILE==="true"){
      const rechazo=await verificarTurnstile(request,env,"admin_login");
      if(rechazo)return rechazo;
    }
    const data=await leerJson(request,512);
    const received=typeof data?.password==="string"?data.password:"";
    // La protección de intentos se debe reforzar con Cloudflare WAF Rate Limiting.
    const expected=env.ADMIN_PASSWORD;
    const a=await firma(env.SESSION_SECRET,received),b=await firma(env.SESSION_SECRET,expected);
    if(!received || !constante(a,b)) return error("Contraseña incorrecta",401);
    const exp=String(Date.now()+8*60*60*1000),signature=await firmaSesion(env,exp);
    return json({ok:true},200,{"set-cookie":`lp3d_session=${exp}.${signature}; Path=/api/admin; Max-Age=28800; HttpOnly; Secure; SameSite=Strict`});
  }
  // Portal de cliente: la URL lleva la clave en fragmento, nunca en el servidor.
  if(path==="/api/cliente/iniciar" && request.method==="POST") {
    if(!sameOrigin(request))return error("Origen no autorizado",403);
    if(!await verificarLimite(request,env,"cliente_acceso",20,900))return error("Demasiados intentos; intenta más tarde",429);
    const data=await leerJson(request,300);
    const p=await proyectoDeCliente(request,env,data?.token);
    if(!p)return error("Enlace inválido, revocado o vencido",401);
    const token=data.token;
    return json({ok:true},200,{"set-cookie":`lp3d_cliente=${token}; Path=/api/cliente; Max-Age=604800; HttpOnly; Secure; SameSite=Strict`});
  }
  if(path==="/api/cliente/salir" && request.method==="POST") {
    if(!sameOrigin(request))return error("Origen no autorizado",403);
    return json({ok:true},200,{"set-cookie":"lp3d_cliente=; Path=/api/cliente; Max-Age=0; HttpOnly; Secure; SameSite=Strict"});
  }
  if(path.startsWith("/api/cliente/")) {
    const p=await proyectoDeCliente(request,env);
    if(!p)return error("Acceso del proyecto no autorizado o vencido",401);
    if(path==="/api/cliente/seguimiento"&&request.method==="GET"){
      const s=await leerSeguimiento(env.QUIZ_DB,p);
      const fotos=s&&await tablaAvances(env.QUIZ_DB)?await fotosAvances(env.QUIZ_DB,p.id):[];
      return json({seguimiento:s?.data||seguimientoVacio(p),disponible:!!s,fotos});
    }
    const fotoAvanceCliente=path.match(/^\/api\/cliente\/avances\/([0-9a-f-]{36})$/i);
    if(fotoAvanceCliente&&request.method==="GET"){
      if(!await tablaAvances(env.QUIZ_DB))return error("Imagen no encontrada",404);
      return imagenAvance(env,p.id,fotoAvanceCliente[1]);
    }
    if(path==="/api/cliente/materiales" && request.method==="GET") {
      const secciones=await env.QUIZ_DB.prepare("SELECT clave,contenido,estado,fecha_actualizacion FROM proyecto_secciones WHERE proyecto_id=?1")
        .bind(p.id).all();
      const archivos=await env.QUIZ_DB.prepare("SELECT id,categoria,nombre_original,tipo_mime,tamano_bytes,fecha_subida,estado FROM proyecto_archivos WHERE proyecto_id=?1 ORDER BY fecha_subida DESC").bind(p.id).all();
      let ficha={};try{ficha=JSON.parse(p.ficha_json||"{}");}catch{}
      let categoria=ficha.servicio||"web";
      if(ficha.tipo_documento==="ficha_quiz"){
        const rec=ficha.recomendacion?.id;
        categoria=rec==="R1"?"llaveros":rec==="R2"?"soporte_qr":rec==="R6"?"fdm_medida":rec==="R7"?"resina":"web";
      }
      const cotizacion=ficha.tipo_documento==="solicitud_servicio"
        ?{campos:ficha.campos&&typeof ficha.campos==="object"?ficha.campos:{},fecha_deseada:ficha.fecha_deseada||"",detalles:ficha.detalles||"",contexto:ficha.contexto||"",fecha_prioritaria:ficha.fecha_prioritaria||""}
        :null;
      return json({proyecto:{folio:p.folio,nombre:p.nombre,proyecto:p.proyecto,estado:p.estado,categoria,...datosIndicaciones(p.instrucciones)},cotizacion,secciones:secciones.results,archivos:archivos.results});
    }
    if(path==="/api/cliente/entrega"&&request.method==="GET"){
      const entrega=await env.QUIZ_DB.prepare("SELECT modalidad,revision,vista_previa,notas_revision,version,decision,comentario,fecha_decision,tipo_dominio,url_final,fecha_entrega,fecha_publicacion,garantia_hasta FROM proyecto_entregas WHERE proyecto_id=?1").bind(p.id).first();
      return json({entrega});
    }
    if(path==="/api/cliente/entrega"&&request.method==="POST"){
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      if(["finalizado","cancelado"].includes(p.estado))return error("Proyecto cerrado",409);
      const d=await leerJson(request,8000);if(!decisionEntregaValida(d))return error("Decisión inválida",400);
      const res=await env.QUIZ_DB.prepare("UPDATE proyecto_entregas SET decision=?1,comentario=?2,fecha_decision=?3,origen_decision='cliente',fecha_actualizacion=?4 WHERE proyecto_id=?5 AND version=?6 AND decision='pendiente' AND fecha_entrega IS NULL AND EXISTS(SELECT 1 FROM proyectos_cliente WHERE id=?5 AND estado NOT IN ('finalizado','cancelado') AND acceso_revocado=0 AND acceso_expira>?4)").bind(d.decision,d.comentario.trim(),hoyMensualidad(),new Date().toISOString(),p.id,d.version).run();
      return res.meta.changes?json({ok:true}):error("La revisión cambió o ya fue respondida. Actualiza el portal.",409);
    }
    const archivoCliente=path.match(/^\/api\/cliente\/archivos\/([0-9a-f-]{36})$/i);
    if(archivoCliente && request.method==="GET"){
      if(!env.COTIZACIONES_R2)return error("Almacenamiento no configurado",503);
      const adj=await env.QUIZ_DB.prepare("SELECT clave_r2,tipo_mime FROM proyecto_archivos WHERE id=?1 AND proyecto_id=?2").bind(archivoCliente[1],p.id).first();
      if(!adj)return error("Archivo no encontrado",404);
      const objeto=await env.COTIZACIONES_R2.get(adj.clave_r2);
      if(!objeto)return error("Archivo no encontrado",404);
      return new Response(objeto.body,{headers:{"Content-Type":adj.tipo_mime,"Content-Disposition":`inline; filename="imagen.${IMG_MIME[adj.tipo_mime]||"jpg"}"`,"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox","X-Frame-Options":"DENY"}});
    }
    if(path==="/api/cliente/archivos" && request.method==="POST"){
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      if(["finalizado","cancelado"].includes(p.estado))return error("El proyecto ya no admite archivos",409);
      if(!env.COTIZACIONES_R2)return error("Almacenamiento R2 no configurado",503);
      if(!await verificarLimite(request,env,"material_archivo",60,3600))return error("Demasiadas cargas. Intenta más tarde.",429);
      if(!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data"))return error("Formato de envío inválido",415);
      const longitud=Number(request.headers.get("content-length")||0);
      if(longitud>IMG_MAX+150000)return error("La imagen supera los 4 MB",413);
      let f;
      try{const form=await request.formData();f=form.get("imagen");}catch{return error("No se pudo leer la imagen",400);}
      if(!(f instanceof File)||!Object.hasOwn(IMG_MIME,f.type)||f.size===0||f.size>IMG_MAX)return error("Solo se aceptan JPG, PNG o WebP de hasta 4 MB",400);
      const cnt=await env.QUIZ_DB.prepare("SELECT COUNT(*) AS total FROM proyecto_archivos WHERE proyecto_id=?1").bind(p.id).first();
      if(cnt.total>=30)return error("Límite de 30 imágenes por proyecto",409);
      const bytes=new Uint8Array(await f.arrayBuffer());
      if(!imagenReal(bytes,f.type))return error("El archivo no contiene una imagen válida",400);
      const id=crypto.randomUUID(),clave=`proyectos/${p.id}/${id}.${IMG_MIME[f.type]}`,ahora=new Date().toISOString();
      await env.COTIZACIONES_R2.put(clave,bytes,{httpMetadata:{contentType:f.type}});
      try{
        await env.QUIZ_DB.prepare("INSERT INTO proyecto_archivos (id,proyecto_id,categoria,nombre_original,clave_r2,tipo_mime,tamano_bytes,fecha_subida) VALUES (?1,?2,'fotografias',?3,?4,?5,?6,?7)")
          .bind(id,p.id,f.name.slice(0,120),clave,f.type,f.size,ahora).run();
      }catch(e){await env.COTIZACIONES_R2.delete(clave);throw e;}
      await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET fecha_actualizacion=?1 WHERE id=?2").bind(ahora,p.id).run();
      return json({ok:true,archivo:{id,nombre_original:f.name.slice(0,120),tipo_mime:f.type,tamano_bytes:f.size,fecha_subida:ahora,estado:"recibido"}},201);
    }
    if(archivoCliente && request.method==="DELETE"){
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      if(["finalizado","cancelado"].includes(p.estado))return error("Este proyecto ya no admite cambios",409);
      const adj=await env.QUIZ_DB.prepare("SELECT clave_r2 FROM proyecto_archivos WHERE id=?1 AND proyecto_id=?2").bind(archivoCliente[1],p.id).first();
      if(!adj)return error("Archivo no encontrado",404);
      await env.COTIZACIONES_R2.delete(adj.clave_r2);
      await env.QUIZ_DB.prepare("DELETE FROM proyecto_archivos WHERE id=?1 AND proyecto_id=?2").bind(archivoCliente[1],p.id).run();
      return json({ok:true});
    }
    const seccion=path.match(/^\/api\/cliente\/secciones\/(datos_negocio|servicios_productos|horarios_contacto|indicaciones)$/);
    if(seccion && request.method==="PUT") {
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      if(["finalizado","cancelado"].includes(p.estado))return error("Este proyecto ya no admite cambios",409);
      const data=await leerJson(request,14000);
      const contenido=data?.contenido;
      if(typeof contenido!=="string"||contenido.length>10000)return error("El texto debe tener máximo 10,000 caracteres",400);
      const ahora=new Date().toISOString();
      await env.QUIZ_DB.prepare(
        "INSERT INTO proyecto_secciones (proyecto_id,clave,contenido,estado,fecha_actualizacion) VALUES (?1,?2,?3,'recibido',?4) ON CONFLICT(proyecto_id,clave) DO UPDATE SET contenido=excluded.contenido,estado='recibido',fecha_actualizacion=excluded.fecha_actualizacion"
      ).bind(p.id,seccion[1],contenido,ahora).run();
      await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET fecha_actualizacion=?1 WHERE id=?2").bind(ahora,p.id).run();
      return json({ok:true,fecha_actualizacion:ahora});
    }
  }
  if(path.startsWith("/api/admin/")) {
    if(!await autorizado(request,env)) return error("Acceso restringido",401);
    if(!["GET","HEAD","OPTIONS"].includes(request.method) && !sameOrigin(request)) return error("Origen no autorizado",403);
    if(path==="/api/admin/sesion" && request.method==="GET") return json({ok:true});
    if(path==="/api/admin/salir" && request.method==="POST") return json({ok:true},200,{"set-cookie":"lp3d_session=; Path=/api/admin; Max-Age=0; HttpOnly; Secure; SameSite=Strict"});
    // Consulta administrativa de materiales recibidos sin exponer R2 públicamente.
    if(path==="/api/admin/alertas"&&request.method==="GET")return json(await alertasComerciales(env));
    if(path==="/api/admin/alertas/resumen"&&request.method==="POST"){
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const d=await leerJson(request,128);
      if(d?.confirmar!==true)return error("Confirma el envío del resumen administrativo",400);
      if(!env.RESEND_API_KEY||!env.NOTIFY_EMAIL||!env.EMAIL_FROM)return error("El correo administrativo no está configurado",503);
      const alertas=await alertasComerciales(env);
      if(!alertas.items.length)return error("No hay alertas para enviar",409);
      const body={from:env.EMAIL_FROM,to:[env.NOTIFY_EMAIL],subject:"Pendientes comerciales · "+alertas.hoy,text:resumenAlertas(alertas)};
      // Una solicitud por fecha; no se envía automáticamente a clientes.
      const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":"Bearer "+env.RESEND_API_KEY,"Content-Type":"application/json","Idempotency-Key":"alertas-comerciales-"+alertas.hoy},body:JSON.stringify(body)});
      if(!res.ok)return error("El proveedor de correo no confirmó el envío. Si ya solicitaste un resumen hoy, consulta el panel.",502);
      return json({ok:true,hoy:alertas.hoy,total:alertas.items.length});
    }
    const fotosAdmin=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/avances(?:\/([0-9a-f-]{36}))?$/i);
    if(fotosAdmin){
      const db=env.QUIZ_DB,id=fotosAdmin[1],foto=fotosAdmin[2];
      if(!await tablaAvances(db))return error("Fotografías pendientes de habilitar (migración 0009)",503);
      const p=await db.prepare("SELECT p.id,q.ficha_json FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.id=?1").bind(id).first();
      if(!p)return error("Proyecto no encontrado",404);
      if(request.method==="GET")return foto?imagenAvance(env,id,foto):json({fotos:await fotosAvances(db,id)});
      if(!env.COTIZACIONES_R2)return error("Almacenamiento no configurado",503);
      if(request.method==="POST"&&!foto){
        const s=await leerSeguimiento(db,p);
        if(!s||!s.data.version||s.estado==="cancelado")return error("Publica primero un avance en un proyecto activo",409);
        if(Number(request.headers.get("content-length")||0)>IMG_MAX+150000)return error("Imagen demasiado grande",413);
        if(!request.headers.get("content-type")?.toLowerCase().startsWith("multipart/form-data"))return error("Formato inválido",415);
        let form;try{form=await request.formData();}catch{return error("Formulario inválido",400);}
        const archivo=form.get("imagen"),descripcion=form.get("descripcion"),v=Number(form.get("version"));
        if(!Number.isSafeInteger(v)||v<1||v>s.data.version||typeof descripcion!=="string"||descripcion.length>500||!(archivo instanceof File)||!Object.hasOwn(IMG_MIME,archivo.type)||archivo.size===0||archivo.size>IMG_MAX)return error("Revisa la imagen, descripción y avance",400);
        const bytes=new Uint8Array(await archivo.arrayBuffer());
        if(!imagenReal(bytes,archivo.type))return error("Imagen inválida",400);
        const nuevo=crypto.randomUUID(),clave="avances/"+id+"/"+nuevo;
        await env.COTIZACIONES_R2.put(clave,bytes,{httpMetadata:{contentType:archivo.type}});
        let resultado;
        try{
          resultado=await db.prepare("INSERT INTO proyecto_avances_fotos(id,proyecto_id,version_avance,descripcion,tipo_mime,fecha_subida) SELECT ?1,id,?2,?3,?4,?5 FROM proyectos_cliente WHERE id=?6 AND estado<>'cancelado' AND seguimiento_json=?7 AND (SELECT COUNT(*) FROM proyecto_avances_fotos WHERE proyecto_id=?6)<60 AND (SELECT COUNT(*) FROM proyecto_avances_fotos WHERE proyecto_id=?6 AND version_avance=?2)<6").bind(nuevo,v,descripcion.trim(),archivo.type,new Date().toISOString(),id,s.raw).run();
        }catch(e){await env.COTIZACIONES_R2.delete(clave).catch(()=>{});throw e;}
        if(!resultado.meta.changes){await env.COTIZACIONES_R2.delete(clave);return error("Proyecto modificado o límite de imágenes alcanzado. Actualiza.",409);}
        return json({ok:true,id:nuevo},201);
      }
      if(request.method==="DELETE"&&foto){
        const d=await leerJson(request,200);
        if(d?.confirmacion!=="RETIRAR")return error("Confirma retirar la imagen",400);
        const r=await db.prepare("DELETE FROM proyecto_avances_fotos WHERE proyecto_id=?1 AND id=?2").bind(id,foto).run();
        if(!r.meta.changes)return error("Imagen no encontrada",404);
        try{await env.COTIZACIONES_R2.delete("avances/"+id+"/"+foto);}catch{console.error("Limpieza de avance pendiente",id,foto);return json({ok:true,limpieza_pendiente:true});}
        return json({ok:true});
      }
      return error("Método no permitido",405);
    }
    const seguimientoAdmin=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/seguimiento$/i);
    if(seguimientoAdmin){
      const db=env.QUIZ_DB,id=seguimientoAdmin[1];
      const p=await db.prepare("SELECT p.id,q.ficha_json FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.id=?1").bind(id).first();
      if(!p)return error("Proyecto no encontrado",404);
      const s=await leerSeguimiento(db,p);
      if(!s)return error("Seguimiento pendiente de habilitar: la base D1 conectada no contiene la columna seguimiento_json o no devolvió el proyecto. Verifica la migración 0008 en lapazimpresion3d-quiz.",503);
      if(request.method==="GET")return json({seguimiento:s.data});
      if(request.method==="PATCH"){
        if(s.estado==="cancelado")return error("Proyecto cancelado",409);
        const d=await leerJson(request,8000);
        if(!recepcionValida(d))return error("Revisa el origen y las observaciones",400);
        if(!s.data.recepcion)return error("La recopilación todavía no está confirmada",409);
        if(d.version!==s.data.version||d.revision_edicion!==(s.data.recepcion.revision_edicion||0))return error("El registro cambió. Vuelve a abrir el seguimiento.",409);
        const nuevo=corregirRecepcion(s.data,d,new Date().toISOString());
        const r=await db.prepare("UPDATE proyectos_cliente SET seguimiento_json=?1 WHERE id=?2 AND seguimiento_json=?3 AND estado<>'cancelado'").bind(JSON.stringify(nuevo),id,s.raw).run();
        return r.meta.changes?json({seguimiento:nuevo}):error("El proyecto cambió. Vuelve a cargarlo.",409);
      }
      if(request.method==="PUT"){
        if(s.estado==="cancelado")return error("Proyecto cancelado",409);
        const d=await leerJson(request,8000);
        if(!seguimientoValido(d))return error("Datos de seguimiento inválidos",400);
        if(d.version!==s.data.version)return error("El seguimiento cambió. Vuelve a cargarlo.",409);
        if(s.data.version!==0&&(d.modalidad!==s.data.modalidad||formatoSeguimiento(d)!==formatoSeguimiento(s.data)))return error("La modalidad y el formato ya fueron publicados",409);
        if(d.recepcion!==undefined&&!recepcionValida(d.recepcion))return error("Confirma el origen y las observaciones de los materiales",400);
        if(d.recepcion&&(s.estado==="finalizado"||s.data.recepcion))return error("La recopilación ya está confirmada o el proyecto está cerrado",409);
        if(s.data.recepcion&&!d.completadas.includes(0))return error("La recopilación confirmada no se puede desmarcar desde este formulario",409);
        const mensaje=d.mensaje.trim();
        let nuevo={...s.data,modalidad:d.modalidad,formato:formatoSeguimiento(d),actual:d.actual,completadas:[...d.completadas].sort((a,b)=>a-b),fecha_estimada:d.fecha_estimada,historial:s.data.historial,version:d.version+1};
        if(d.recepcion)nuevo=aplicarRecepcion(nuevo,d.recepcion,new Date().toISOString());
        if(nuevo.historial.length>=200)return error("Límite de 200 actualizaciones alcanzado",409);
        nuevo.historial=[{fecha:new Date().toISOString(),mensaje,actual:nuevo.actual,completadas:nuevo.completadas,fecha_estimada:nuevo.fecha_estimada,...(d.recepcion?{recepcion:nuevo.recepcion}:{})},...nuevo.historial];
        const r=await db.prepare("UPDATE proyectos_cliente SET seguimiento_json=?1 WHERE id=?2 AND seguimiento_json=?3 AND estado<>'cancelado'").bind(JSON.stringify(nuevo),id,s.raw).run();
        return r.meta.changes?json({seguimiento:nuevo}):error("El proyecto cambió. Vuelve a cargarlo.",409);
      }
      return error("Método no permitido",405);
    }
    const entregaAdmin=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/entrega(?:\/(decision|finalizar|cambios))?$/i);
    if(entregaAdmin){
      const id=entregaAdmin[1],accion=entregaAdmin[2],db=env.QUIZ_DB,hoy=hoyMensualidad(),ahora=new Date().toISOString();
      if(request.method!=="GET"&&!sameOrigin(request))return error("Origen no autorizado",403);
      const p=await db.prepare("SELECT id,estado,propuesta_id FROM proyectos_cliente WHERE id=?1").bind(id).first();
      if(!p)return error("Proyecto no encontrado",404);
      const q=await db.prepare("SELECT * FROM proyecto_entregas WHERE proyecto_id=?1").bind(id).first();
      if(!accion&&request.method==="GET"){
        const cambios=await db.prepare("SELECT id,descripcion,fecha_registro FROM proyecto_cambios WHERE proyecto_id=?1 ORDER BY fecha_registro DESC LIMIT 100").bind(id).all();
        return json({entrega:q,cambios:cambios.results,hoy});
      }
      if(p.estado==="cancelado")return error("Proyecto cancelado",409);
      if(!accion&&request.method==="PUT"){
        const d=await leerJson(request,16000);
        if(!revisionEntregaValida(d))return error("Revisa modalidad, revisión, descripción y URL HTTPS sin parámetros ni credenciales.",400);
        if(p.estado==="finalizado")return error("Proyecto finalizado",409);
        const args=[id,d.modalidad,d.revision.trim(),d.vista_previa,d.notas_revision.trim(),ahora];
        const res=d.version===0
          ?await db.prepare("INSERT INTO proyecto_entregas(proyecto_id,modalidad,revision,vista_previa,notas_revision,fecha_actualizacion) SELECT ?1,?2,?3,?4,?5,?6 FROM proyectos_cliente WHERE id=?1 AND estado NOT IN ('finalizado','cancelado') ON CONFLICT(proyecto_id) DO NOTHING").bind(...args).run()
          :await db.prepare("UPDATE proyecto_entregas SET modalidad=?2,revision=?3,vista_previa=?4,notas_revision=?5,fecha_actualizacion=?6,version=version+1,decision='pendiente',comentario='',fecha_decision=NULL,origen_decision=NULL WHERE proyecto_id=?1 AND version=?7 AND fecha_entrega IS NULL AND EXISTS(SELECT 1 FROM proyectos_cliente WHERE id=?1 AND estado NOT IN ('finalizado','cancelado'))").bind(...args,d.version).run();
        return res.meta.changes?json({ok:true}):error("La revisión cambió o el proyecto fue entregado.",409);
      }
      if(!q)return error("Guarda primero una revisión",409);
      if(accion==="decision"&&request.method==="POST"){
        const d=await leerJson(request,8000);
        if(!decisionEntregaValida(d)||d.confirmada!==true)return error("Confirma la decisión externa del cliente.",400);
        const res=await db.prepare("UPDATE proyecto_entregas SET decision=?1,comentario=?2,fecha_decision=?3,origen_decision='administrador',fecha_actualizacion=?4 WHERE proyecto_id=?5 AND version=?6 AND decision='pendiente' AND fecha_entrega IS NULL AND EXISTS(SELECT 1 FROM proyectos_cliente WHERE id=?5 AND estado NOT IN ('finalizado','cancelado'))").bind(d.decision,d.comentario.trim(),hoy,ahora,id,d.version).run();
        return res.meta.changes?json({ok:true}):error("La revisión cambió o ya fue respondida.",409);
      }
      if(accion==="finalizar"&&request.method==="POST"){
        const d=await leerJson(request,3000);
        if(!entregaFinalValida(d,q,hoy))return error("Se requiere revisión aprobada, fechas válidas y dirección definitiva si corresponde.",400);
        const garantia=q.modalidad==="fisica"?null:garantiaEntrega(d.fecha_entrega);
        const res=await db.prepare("UPDATE proyecto_entregas SET tipo_dominio=?1,url_final=?2,fecha_entrega=?3,fecha_publicacion=?4,garantia_hasta=?5,fecha_actualizacion=?6 WHERE proyecto_id=?7 AND version=?8 AND decision='aprobado' AND fecha_entrega IS NULL AND EXISTS(SELECT 1 FROM proyectos_cliente WHERE id=?7 AND estado NOT IN ('finalizado','cancelado'))").bind(d.tipo_dominio,d.url_final,d.fecha_entrega,d.fecha_publicacion||null,garantia,ahora,id,d.version).run();
        return res.meta.changes?json({ok:true}):error("La revisión cambió o ya fue entregada.",409);
      }
      if(accion==="cambios"&&request.method==="POST"){
        const d=await leerJson(request,16000);
        if(!q.fecha_entrega||!textoEntrega(d?.descripcion,3,2000)||!ID_UUID.test(d?.id||""))return error("Registra una entrega y describe la modificación.",400);
        const res=await db.prepare("INSERT INTO proyecto_cambios(id,proyecto_id,descripcion,fecha_registro) SELECT ?1,?2,?3,?4 FROM proyectos_cliente WHERE id=?2 AND estado<>'cancelado' ON CONFLICT(id) DO NOTHING").bind(d.id,id,d.descripcion.trim(),ahora).run();
        if(res.meta.changes)return json({ok:true},201);
        const previo=await db.prepare("SELECT proyecto_id,descripcion FROM proyecto_cambios WHERE id=?1").bind(d.id).first();
        return previo?.proyecto_id===id&&previo.descripcion===d.descripcion.trim()?json({ok:true,repetido:true}):error("No se pudo registrar el cambio.",409);
      }
      return error("Método no permitido",405);
    }
    const materialesAdmin=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/materiales$/i);
    if(materialesAdmin && request.method==="GET"){
      const p=await env.QUIZ_DB.prepare("SELECT p.id,p.instrucciones,q.folio FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id WHERE p.id=?1").bind(materialesAdmin[1]).first();
      if(!p)return error("Proyecto no encontrado",404);
      const sec=await env.QUIZ_DB.prepare("SELECT clave,contenido,estado,fecha_actualizacion FROM proyecto_secciones WHERE proyecto_id=?1").bind(p.id).all();
      const archivos=await env.QUIZ_DB.prepare("SELECT id,nombre_original,tipo_mime,tamano_bytes,fecha_subida,estado FROM proyecto_archivos WHERE proyecto_id=?1 ORDER BY fecha_subida DESC").bind(p.id).all();
      return json({folio:p.folio,...datosIndicaciones(p.instrucciones),secciones:sec.results,archivos:archivos.results});
    }
    // Revisión de entregas: sesión administrativa, origen y ámbito del proyecto.
    const revisionTexto=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/materiales\/secciones\/(datos_negocio|servicios_productos|horarios_contacto|indicaciones)$/i);
    const revisionArchivo=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/materiales\/archivos\/([0-9a-f-]{36})$/i);
    if((revisionTexto||revisionArchivo) && request.method==="PATCH"){
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const data=await leerJson(request,300);
      if(!revisionMaterialValida(data,!!revisionTexto))return error("Revisión inválida",400);
      const id=(revisionTexto||revisionArchivo)[1],clave=(revisionTexto||revisionArchivo)[2],ahora=new Date().toISOString();
      const result=revisionTexto
        ?await env.QUIZ_DB.prepare("UPDATE proyecto_secciones SET estado=?1,fecha_actualizacion=?2 WHERE proyecto_id=?3 AND clave=?4 AND fecha_actualizacion=?5 AND EXISTS (SELECT 1 FROM proyectos_cliente WHERE id=?3 AND estado NOT IN ('finalizado','cancelado'))").bind(data.estado,ahora,id,clave,data.version).run()
        :await env.QUIZ_DB.prepare("UPDATE proyecto_archivos SET estado=?1 WHERE proyecto_id=?2 AND id=?3 AND EXISTS (SELECT 1 FROM proyectos_cliente WHERE id=?2 AND estado NOT IN ('finalizado','cancelado'))").bind(data.estado,id,clave).run();
      if(!result.meta.changes)return error("Material actualizado, no encontrado o proyecto cerrado. Vuelve a cargar los materiales.",409);
      await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET fecha_actualizacion=?1 WHERE id=?2").bind(ahora,id).run();
      return json({ok:true,estado:data.estado,fecha_actualizacion:ahora});
    }
    if(materialesAdmin && request.method==="PATCH"){
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const data=await leerJson(request,65000);
      if(!indicacionesValidas(data?.indicaciones))return error("Usa hasta 10 indicaciones, 2,000 caracteres por mensaje y 10,000 en total. Actualiza el panel si usas una versión anterior.",400);
      const items=data.indicaciones.map(x=>({color:x.color,texto:x.texto.trim()}));
      const valor=items.length?PREFIJO_INDICACIONES+JSON.stringify(items):"";
      const result=await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET instrucciones=?1,fecha_actualizacion=?2 WHERE id=?3 AND estado NOT IN ('finalizado','cancelado')").bind(valor,new Date().toISOString(),materialesAdmin[1]).run();
      return result.meta.changes?json({ok:true,...datosIndicaciones(valor)}):error("Proyecto no encontrado o cerrado",409);
    }
    const imagenAdmin=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/archivos\/([0-9a-f-]{36})$/i);
    if(imagenAdmin && request.method==="GET"){
      if(!env.COTIZACIONES_R2)return error("Almacenamiento no configurado",503);
      const a=await env.QUIZ_DB.prepare("SELECT clave_r2,tipo_mime FROM proyecto_archivos WHERE proyecto_id=?1 AND id=?2").bind(imagenAdmin[1],imagenAdmin[2]).first();
      if(!a)return error("Imagen no encontrada",404);
      const objeto=await env.COTIZACIONES_R2.get(a.clave_r2);
      if(!objeto)return error("Imagen no encontrada",404);
      return new Response(objeto.body,{headers:{"Content-Type":a.tipo_mime,"Content-Disposition":`inline; filename="referencia.${IMG_MIME[a.tipo_mime]||"jpg"}"`,"Cache-Control":"private,no-store","X-Content-Type-Options":"nosniff","Content-Security-Policy":"default-src 'none'; sandbox"}});
    }
    // Emitir o revocar un acceso individual; un token existente no puede recuperarse de D1.
    const accesoProyecto=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})\/acceso$/i);
    if(accesoProyecto && request.method==="POST") {
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const p=await env.QUIZ_DB.prepare("SELECT id,estado,acceso_revocado,acceso_token_hash,acceso_expira FROM proyectos_cliente WHERE id=?1").bind(accesoProyecto[1]).first();
      if(!p)return error("Proyecto no encontrado",404);
      if(["cancelado","finalizado"].includes(p.estado))return error("El proyecto no admite nuevos accesos",409);
      const data=await leerJson(request,256);
      if(!data)return error("Solicitud inválida",400);
      if(p.acceso_token_hash&&!p.acceso_revocado&&data.confirmacion!=="REGENERAR")return error("Confirma expresamente la sustitución del enlace existente",409);
      const token=tokenCliente(),hash=await hashTokenCliente(token),expira=new Date(Date.now()+90*86400000).toISOString();
      const resultado=await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET acceso_token_hash=?1,acceso_expira=?2,acceso_revocado=0,fecha_actualizacion=?3 WHERE id=?4 AND estado NOT IN ('finalizado','cancelado') AND acceso_token_hash IS ?5 AND acceso_revocado IS ?6")
        .bind(hash,expira,new Date().toISOString(),p.id,p.acceso_token_hash,p.acceso_revocado).run();
      if(!resultado.meta.changes)return error("El acceso cambió. Actualiza el panel.",409);
      // El token en el fragmento # no se envía al servidor durante la navegación.
      return json({ok:true,url:`${url.origin}/cliente/materiales/#acceso=${token}`,expira});
    }
    if(accesoProyecto && request.method==="PATCH") {
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const data=await leerJson(request,256);
      if(![30,60,90].includes(data?.dias))return error("Selecciona 30, 60 o 90 días",400);
      const p=await env.QUIZ_DB.prepare("SELECT estado,acceso_token_hash,acceso_revocado,acceso_expira FROM proyectos_cliente WHERE id=?1").bind(accesoProyecto[1]).first();
      if(!p)return error("Proyecto no encontrado",404);
      if(!p.acceso_token_hash||p.acceso_revocado||["cancelado","finalizado"].includes(p.estado))return error("No hay un acceso prorrogable",409);
      const ahora=Date.now(), anterior=Date.parse(p.acceso_expira);
      if(!Number.isFinite(anterior)||anterior<=ahora)return error("El enlace venció. Genera uno nuevo por seguridad.",409);
      const expira=new Date(anterior+data.dias*86400000).toISOString();
      const r=await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET acceso_expira=?1,fecha_actualizacion=?2 WHERE id=?3 AND acceso_token_hash=?4 AND acceso_revocado=0 AND acceso_expira=?5 AND estado NOT IN ('finalizado','cancelado')").bind(expira,new Date(ahora).toISOString(),accesoProyecto[1],p.acceso_token_hash,p.acceso_expira).run();
      return r.meta.changes?json({ok:true,expira}):error("El acceso cambió. Actualiza el panel.",409);
    }
    if(accesoProyecto && request.method==="DELETE") {
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const data=await leerJson(request,256);
      if(data?.confirmacion!=="REVOCAR")return error("Confirma expresamente la revocación",400);
      const r=await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET acceso_revocado=1,acceso_token_hash=NULL,fecha_actualizacion=?1 WHERE id=?2")
        .bind(new Date().toISOString(),accesoProyecto[1]).run();
      return r.meta.changes?json({ok:true}):error("Proyecto no encontrado",404);
    }
    // Proyectos aceptados: endpoints exclusivos del panel con sesión administrativa.
    // No se generan enlaces para clientes hasta habilitar el portal privado.
    if(path==="/api/admin/proyectos" && request.method==="GET") {
      const rows=await env.QUIZ_DB.prepare(
        "SELECT p.id,p.propuesta_id,p.fecha_creacion,p.fecha_actualizacion,p.estado,p.acceso_expira,p.acceso_revocado,CASE WHEN p.acceso_token_hash IS NOT NULL THEN 1 ELSE 0 END AS tiene_acceso,q.folio,q.nombre,q.proyecto,q.telefono FROM proyectos_cliente p JOIN quiz_propuestas q ON q.id=p.propuesta_id ORDER BY p.fecha_actualizacion DESC LIMIT 100"
      ).all();
      return json({items:rows.results});
    }
    const proyectoNuevo=path.match(/^\/api\/admin\/propuestas\/([0-9a-f-]{36})\/proyecto$/i);
    if(proyectoNuevo && request.method==="POST") {
      if(!sameOrigin(request)) return error("Origen no autorizado",403);
      const data=await leerJson(request,128);
      if(data?.aceptado!==true) return error("Confirma que el cliente aceptó la cotización",400);
      const propuesta=await env.QUIZ_DB.prepare("SELECT id,estado FROM quiz_propuestas WHERE id=?1").bind(proyectoNuevo[1]).first();
      if(!propuesta) return error("Solicitud no encontrada",404);
      if(!["cotizado","cerrado"].includes(propuesta.estado)) return error("Primero marca la solicitud como cotizada o cerrada",409);
      const id=crypto.randomUUID(),ahora=new Date().toISOString();
      const insert=await env.QUIZ_DB.prepare(
        "INSERT INTO proyectos_cliente (id,propuesta_id,fecha_creacion,fecha_actualizacion,estado) VALUES (?1,?2,?3,?3,'preparacion') ON CONFLICT(propuesta_id) DO NOTHING"
      ).bind(id,propuesta.id,ahora).run();
      const existente=await env.QUIZ_DB.prepare("SELECT id,propuesta_id,estado,fecha_creacion FROM proyectos_cliente WHERE propuesta_id=?1").bind(propuesta.id).first();
      if(!existente) return error("No se pudo registrar el proyecto",500);
      return json({ok:true,creado:insert.meta.changes===1,proyecto:existente},insert.meta.changes===1?201:200);
    }
    const proyectoEstado=path.match(/^\/api\/admin\/proyectos\/([0-9a-f-]{36})$/i);
    if(proyectoEstado && request.method==="PATCH") {
      if(!sameOrigin(request)) return error("Origen no autorizado",403);
      const data=await leerJson(request,160);
      const estados=["preparacion","recabando_materiales","en_desarrollo","en_revision","finalizado","cancelado"];
      if(!estados.includes(data?.estado)) return error("Estado inválido",400);
      const result=await env.QUIZ_DB.prepare("UPDATE proyectos_cliente SET estado=?1,fecha_actualizacion=?2 WHERE id=?3")
        .bind(data.estado,new Date().toISOString(),proyectoEstado[1]).run();
      return result.meta.changes?json({ok:true}):error("Proyecto no encontrado",404);
    }
    if(path==="/api/admin/propuestas" && request.method==="GET") {
      const st=url.searchParams.get("estado");
      const estado=["nueva","en_revision","contactado","cotizado","cerrado"].includes(st)?st:null;
      const busqueda=(url.searchParams.get("buscar")||"").trim();
      if(busqueda.length>120) return error("Búsqueda inválida",400);
      const filtro=`%${busqueda.replace(/[\%_]/g,"\\$&")}%`;
      const results=await env.QUIZ_DB.prepare("SELECT id,folio,fecha,nombre,proyecto,telefono,comentario,servicio_id,ficha_json,estado FROM quiz_propuestas WHERE (?1 IS NULL OR estado=?1) AND (?2='' OR folio LIKE ?3 ESCAPE '\\' OR nombre LIKE ?3 ESCAPE '\\' OR telefono LIKE ?3 ESCAPE '\\' OR proyecto LIKE ?3 ESCAPE '\\') ORDER BY fecha DESC LIMIT 100")
       .bind(estado,busqueda,filtro).all();
      return json({items:results.results.map(x=>({...x,ficha:JSON.parse(x.ficha_json),ficha_json:undefined}))});
    }
    // El módulo económico se consulta de forma independiente: las solicitudes anteriores siguen disponibles.
    // Mensualidades: acceso exclusivamente administrativo, separado de pagos iniciales.
    if(path==="/api/admin/mensualidades"&&request.method==="GET"){
      const rows=await env.QUIZ_DB.prepare("SELECT q.id AS propuesta_id,q.folio,q.nombre,q.proyecto,e.paquete,e.fecha_aceptacion,e.mensualidad AS tarifa_acordada,e.total_mensual AS total_acordado,s.inicio,s.mensualidad,s.total_mensual,s.estado,s.version,(SELECT MAX(fin) FROM pagos_mensualidad WHERE propuesta_id=q.id) AS ultimo_fin FROM propuestas_economicas e JOIN quiz_propuestas q ON q.id=e.propuesta_id LEFT JOIN suscripciones_cliente s ON s.propuesta_id=q.id WHERE e.fecha_aceptacion IS NOT NULL AND e.mensualidad>0 AND e.paquete<>'solo_fisico' ORDER BY q.fecha DESC LIMIT 200").all();
      const hoy=hoyMensualidad();
      return json({hoy,items:rows.results.map(q=>({...q,...estadoMensualidad(q,q.ultimo_fin?{fin:q.ultimo_fin}:null,hoy)}))});
    }
    const mensual=path.match(/^\/api\/admin\/mensualidades\/([0-9a-f-]{36})(?:\/(pagos))?$/i);
    if(mensual){
      const id=mensual[1],accion=mensual[2],db=env.QUIZ_DB,hoy=hoyMensualidad();
      if(request.method!=="GET"&&!sameOrigin(request))return error("Origen no autorizado",403);
      const e=await db.prepare("SELECT paquete,mensualidad,total_mensual,fecha_aceptacion FROM propuestas_economicas WHERE propuesta_id=?1 AND fecha_aceptacion IS NOT NULL AND mensualidad>0 AND paquete<>'solo_fisico'").bind(id).first();
      if(!e)return error("No hay una propuesta mensual aceptada",404);
      const q=await db.prepare("SELECT * FROM suscripciones_cliente WHERE propuesta_id=?1").bind(id).first();
      if(!accion&&request.method==="GET"){
        const p=await db.prepare("SELECT id,inicio,fin,dia_ancla,importe,fecha,metodo,referencia FROM pagos_mensualidad WHERE propuesta_id=?1 ORDER BY fin DESC").bind(id).all();
        return json({suscripcion:q,acuerdo:e,pagos:p.results,hoy,...estadoMensualidad(q||{},p.results[0],hoy)});
      }
      if(!accion&&request.method==="POST"){
        const d=await leerJson(request,200);
        if(!fechaMensualidad(d?.inicio)||d.inicio>hoy||d.inicio<e.fecha_aceptacion)return error("La fecha de inicio debe estar entre la aceptación y hoy.",400);
        const res=await db.prepare("INSERT INTO suscripciones_cliente(propuesta_id,inicio,mensualidad,total_mensual,fecha_actualizacion) SELECT propuesta_id,?2,mensualidad,total_mensual,?3 FROM propuestas_economicas WHERE propuesta_id=?1 AND fecha_aceptacion IS NOT NULL AND mensualidad>0 AND paquete<>'solo_fisico' ON CONFLICT(propuesta_id) DO NOTHING").bind(id,d.inicio,new Date().toISOString()).run();
        return res.meta.changes?json({ok:true},201):error("Ya existe una suscripción. Vuelve a cargarla.",409);
      }
      if(!q)return error("Registra primero el inicio del servicio",409);
      if(!accion&&request.method==="PATCH"){
        const d=await leerJson(request,200);
        if(!["activo","suspendido","cancelado"].includes(d?.estado)||!Number.isSafeInteger(d.version))return error("Estado o versión inválidos",400);
        const res=await db.prepare("UPDATE suscripciones_cliente SET estado=?1,version=version+1,fecha_actualizacion=?2 WHERE propuesta_id=?3 AND version=?4 AND estado<>'cancelado'").bind(d.estado,new Date().toISOString(),id,d.version).run();
        return res.meta.changes?json({ok:true}):error("La suscripción cambió o ya está cancelada.",409);
      }
      if(accion==="pagos"&&request.method==="POST"){
        const d=await leerJson(request,1500);
        if(!pagoMensualidadValido(d,hoy)||d.fecha<e.fecha_aceptacion)return error("Datos de pago inválidos",400);
        const previo=await db.prepare("SELECT * FROM pagos_mensualidad WHERE id=?1").bind(d.id).first();
        if(previo)return previo.propuesta_id===id&&previo.fecha===d.fecha&&previo.metodo===d.metodo&&previo.referencia===d.referencia.trim()&&((d.modo==="continuar"&&previo.inicio===d.esperada)||(d.modo==="reiniciar"&&previo.inicio>=d.esperada))?json({ok:true,repetido:true}):error("Identificador de pago ya utilizado.",409);
        const ultimo=await db.prepare("SELECT fin,dia_ancla FROM pagos_mensualidad WHERE propuesta_id=?1 ORDER BY fin DESC LIMIT 1").bind(id).first();
        const periodo=periodoMensualidad(q,ultimo,d,hoy);
        if(!periodo)return error("La renovación no corresponde al periodo pendiente o el servicio no está activo. Actualiza.",409);
        // El máximo fin y la versión se verifican dentro de la escritura: evita duplicar periodos simultáneos.
        const res=await db.prepare("INSERT INTO pagos_mensualidad(id,propuesta_id,inicio,fin,dia_ancla,importe,fecha,metodo,referencia,fecha_registro) SELECT ?1,propuesta_id,?3,?4,?5,total_mensual,?6,?7,?8,?9 FROM suscripciones_cliente WHERE propuesta_id=?2 AND estado='activo' AND version=?10 AND COALESCE((SELECT MAX(fin) FROM pagos_mensualidad WHERE propuesta_id=?2),inicio)=?11 ON CONFLICT DO NOTHING").bind(d.id,id,periodo.inicio,periodo.fin,periodo.dia_ancla,d.fecha,d.metodo,d.referencia.trim(),new Date().toISOString(),q.version,d.esperada).run();
        return res.meta.changes?json({ok:true,periodo},201):error("El periodo cambió. Actualiza antes de registrar otro pago.",409);
      }
      return error("Método no permitido",405);
    }
    const economica=path.match(/^\/api\/admin\/propuestas\/([0-9a-f-]{36})\/economica(?:\/(aceptar|pagos))?$/i);
    if(economica){
      const id=economica[1],accion=economica[2];
      if(request.method!=="GET"&&!sameOrigin(request))return error("Origen no autorizado",403);
      const propuesta=await env.QUIZ_DB.prepare("SELECT id,estado FROM quiz_propuestas WHERE id=?1").bind(id).first();
      if(!propuesta)return error("Solicitud no encontrada",404);
      const db=env.QUIZ_DB;
      if(!accion&&request.method==="GET"){
        const q=await db.prepare("SELECT * FROM propuestas_economicas WHERE propuesta_id=?1").bind(id).first();
        if(!q)return json({propuesta:null,pagos:[]});
        const p=await db.prepare("SELECT id,importe,fecha,metodo,referencia,fecha_registro FROM pagos_propuesta WHERE propuesta_id=?1 ORDER BY fecha,fecha_registro,id").bind(id).all();
        const pagado=p.results.reduce((n,x)=>n+x.importe,0);
        return json({propuesta:q,pagos:p.results,pagado,saldo:q.total_inicial-pagado});
      }
      if(!accion&&request.method==="PUT"){
        const d=await leerJson(request,26000);
        if(!propuestaEconomicaValida(d))return error("Revisa alcance, paquete e importes; la fabricación de pago único no admite mensualidad ni implementación web.",400);
        const t=totalesEconomicos(d),ahora=new Date().toISOString();
        const args=[id,d.paquete,d.alcance.trim(),d.implementacion,d.fabricacion,d.extras,d.mensualidad,t.total_inicial,t.total_mensual,ahora];
        const res=d.version===0
          ?await db.prepare("INSERT INTO propuestas_economicas(propuesta_id,paquete,alcance,implementacion,fabricacion,extras,mensualidad,total_inicial,total_mensual,fecha_actualizacion) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10) ON CONFLICT(propuesta_id) DO NOTHING").bind(...args).run()
          :await db.prepare("UPDATE propuestas_economicas SET paquete=?2,alcance=?3,implementacion=?4,fabricacion=?5,extras=?6,mensualidad=?7,total_inicial=?8,total_mensual=?9,fecha_actualizacion=?10,version=version+1 WHERE propuesta_id=?1 AND version=?11 AND fecha_aceptacion IS NULL").bind(...args,d.version).run();
        return res.meta.changes?json({ok:true}):error("La propuesta cambió o fue aceptada. Vuelve a cargarla.",409);
      }
      if(accion==="aceptar"&&request.method==="POST"){
        const d=await leerJson(request,250);
        if(!fechaEconomicaValida(d?.fecha)||!Number.isSafeInteger(d?.version)||d.version<1)return error("Fecha o versión inválida",400);
        const resultados=await db.batch([
          db.prepare("UPDATE propuestas_economicas SET fecha_aceptacion=?1,fecha_actualizacion=?2,version=version+1 WHERE propuesta_id=?3 AND version=?4 AND fecha_aceptacion IS NULL").bind(d.fecha,new Date().toISOString(),id,d.version),
          db.prepare("UPDATE quiz_propuestas SET estado='cotizado' WHERE id=?1 AND estado<>'cerrado' AND EXISTS(SELECT 1 FROM propuestas_economicas WHERE propuesta_id=?1 AND fecha_aceptacion=?2 AND version=?3)").bind(id,d.fecha,d.version+1)
        ]);
        return resultados[0].meta.changes?json({ok:true}):error("La propuesta cambió o ya fue aceptada.",409);
      }
      if(accion==="pagos"&&request.method==="POST"){
        const d=await leerJson(request,1600);
        if(!pagoEconomicoValido(d))return error("Pago inválido",400);
        // Una sola escritura condicional evita sobrepagos concurrentes y duplicados.
        const res=await db.prepare("INSERT INTO pagos_propuesta(id,propuesta_id,importe,fecha,metodo,referencia,fecha_registro) SELECT ?1,?2,?3,?4,?5,?6,?7 FROM propuestas_economicas q WHERE q.propuesta_id=?2 AND q.fecha_aceptacion IS NOT NULL AND ?3<=q.total_inicial-COALESCE((SELECT SUM(importe) FROM pagos_propuesta WHERE propuesta_id=?2),0) ON CONFLICT(id) DO NOTHING").bind(d.id,id,d.importe,d.fecha,d.metodo,d.referencia.trim(),new Date().toISOString()).run();
        if(res.meta.changes)return json({ok:true},201);
        const anterior=await db.prepare("SELECT propuesta_id,importe,fecha,metodo,referencia FROM pagos_propuesta WHERE id=?1").bind(d.id).first();
        if(anterior&&anterior.propuesta_id===id&&anterior.importe===d.importe&&anterior.fecha===d.fecha&&anterior.metodo===d.metodo&&anterior.referencia===d.referencia.trim())return json({ok:true,repetido:true});
        return error("El pago supera el saldo inicial, la propuesta no está aceptada o la referencia de operación ya existe.",409);
      }
      return error("Método no permitido",405);
    }
    const imagenSolicitud=path.match(/^\/api\/admin\/propuestas\/([0-9a-f-]{36})\/imagen\/([0-2])$/i);
    if(imagenSolicitud && request.method==='GET'){
      if(!env.COTIZACIONES_R2)return error('Almacenamiento no configurado',503);
      const fila=await env.QUIZ_DB.prepare('SELECT ficha_json FROM quiz_propuestas WHERE id=?1').bind(imagenSolicitud[1]).first();
      if(!fila)return error('Solicitud no encontrada',404);
      const adj=JSON.parse(fila.ficha_json).imagenes?.[Number(imagenSolicitud[2])];
      if(!adj||!adj.clave?.startsWith(`solicitudes/${imagenSolicitud[1]}/`))return error('Imagen no encontrada',404);
      const objeto=await env.COTIZACIONES_R2.get(adj.clave);
      if(!objeto)return error('Imagen no encontrada',404);
      return new Response(objeto.body,{headers:{'Content-Type':adj.tipo,'Content-Disposition':`inline; filename="referencia.${IMG_MIME[adj.tipo]||'jpg'}"`,'Cache-Control':'private, no-store','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'none'; sandbox"}});
    }
    // El candado se conserva en la ficha existente, sin exigir una migración remota.
    const desbloqueada="COALESCE(json_extract(ficha_json,'$.proteccion_borrado'),0)<>1";
    if(path==="/api/admin/propuestas/eliminables" && request.method==="GET"){
      const total=await env.QUIZ_DB.prepare("SELECT COUNT(*) AS n FROM quiz_propuestas").first();
      const filas=await env.QUIZ_DB.prepare("SELECT id FROM quiz_propuestas WHERE "+desbloqueada+" ORDER BY fecha,id LIMIT 1001").all();
      if(filas.results.length>1000)return error("Hay más de 1000 solicitudes eliminables. Elimina por selección en grupos.",409);
      return json({ids:filas.results.map(x=>x.id),protegidas:Math.max(0,total.n-filas.results.length)});
    }
    const candado=path.match(/^\/api\/admin\/propuestas\/([0-9a-f-]{36})\/proteccion$/i);
    if(candado&&request.method==="PATCH"){
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const d=await leerJson(request,100);
      if(typeof d?.protegida!=="boolean")return error("Protección inválida",400);
      const res=await env.QUIZ_DB.prepare("UPDATE quiz_propuestas SET ficha_json=json_set(ficha_json,'$.proteccion_borrado',?1) WHERE id=?2").bind(d.protegida?1:0,candado[1]).run();
      return res.meta.changes?json({ok:true,protegida:d.protegida}):error("Solicitud no encontrada",404);
    }
    const propuesta=path.match(/^\/api\/admin\/propuestas\/([0-9a-f-]{36})$/i);
    if(propuesta && request.method==="PATCH") {
      if(!sameOrigin(request)) return error("Origen no autorizado",403);
      const data=await leerJson(request,160);
      if(!["nueva","en_revision","contactado","cotizado","cerrado"].includes(data?.estado)) return error("Estado inválido",400);
      const result=await env.QUIZ_DB.prepare("UPDATE quiz_propuestas SET estado=?1 WHERE id=?2").bind(data.estado,propuesta[1]).run();
      return json({ok:result.meta.changes>0});
    }
    if(propuesta && request.method==="DELETE") {
      if(!sameOrigin(request))return error("Origen no autorizado",403);
      const db=env.QUIZ_DB,id=propuesta[1];
      const fila=await db.prepare("SELECT ficha_json FROM quiz_propuestas WHERE id=?1").bind(id).first();
      if(!fila)return error("Solicitud no encontrada",404);
      const ficha=JSON.parse(fila.ficha_json);
      if(ficha.proteccion_borrado===1)return error("Solicitud protegida con candado. Desbloquéala antes de eliminar.",409);
      const tablas=new Set((await db.prepare("SELECT name FROM sqlite_master WHERE type='table'").all()).results.map(x=>x.name));
      const tieneProyecto=tablas.has("proyectos_cliente");
      const proyecto="SELECT id FROM proyectos_cliente WHERE propuesta_id=?1";
      const guardia="EXISTS(SELECT 1 FROM quiz_propuestas WHERE id=?1 AND "+desbloqueada+")";
      const claves=(ficha.imagenes||[]).map(a=>a.clave);
      if(claves.some(k=>typeof k!=="string"||!k.startsWith("solicitudes/"+id+"/")))return error("Referencias de imágenes inválidas.",409);
      if(tieneProyecto&&tablas.has("proyecto_archivos")){
        const archivos=await db.prepare("SELECT clave_r2 FROM proyecto_archivos WHERE proyecto_id IN ("+proyecto+")").bind(id).all();
        claves.push(...archivos.results.map(x=>x.clave_r2));
      }
      const tieneFotos=tieneProyecto&&tablas.has("proyecto_avances_fotos");
      if((claves.length||tieneFotos)&&!env.COTIZACIONES_R2)return error("Almacenamiento de imágenes no disponible.",503);
      const stmts=[];
      const borrar=(tabla,filtro)=>{if(tablas.has(tabla))stmts.push(db.prepare("DELETE FROM "+tabla+" WHERE "+filtro+" AND "+guardia).bind(id));};
      borrar("pagos_mensualidad","propuesta_id=?1");
      borrar("suscripciones_cliente","propuesta_id=?1");
      borrar("pagos_propuesta","propuesta_id=?1");
      borrar("propuestas_economicas","propuesta_id=?1");
      let indiceFotos=-1;
      if(tieneProyecto){
        if(tieneFotos){indiceFotos=stmts.length;stmts.push(db.prepare("DELETE FROM proyecto_avances_fotos WHERE proyecto_id IN ("+proyecto+") AND "+guardia+" RETURNING proyecto_id,id").bind(id));}
        for(const tabla of ["proyecto_cambios","proyecto_entregas","proyecto_archivos","proyecto_secciones"])borrar(tabla,"proyecto_id IN ("+proyecto+")");
        borrar("proyectos_cliente","propuesta_id=?1");
      }
      stmts.push(db.prepare("DELETE FROM quiz_propuestas WHERE id=?1 AND "+desbloqueada).bind(id));
      const resultados=await db.batch(stmts);
      if(!resultados[resultados.length-1].meta.changes)return error("Solicitud protegida con candado o ya eliminada.",409);
      if(indiceFotos>=0)for(const a of resultados[indiceFotos].results||[])claves.push("avances/"+a.proyecto_id+"/"+a.id);
      const limpieza=await Promise.allSettled([...new Set(claves)].map(k=>env.COTIZACIONES_R2.delete(k)));
      const pendientes=limpieza.filter(x=>x.status==="rejected").length;
      if(pendientes)console.error("Limpieza R2 pendiente para solicitud",id,pendientes);
      return json({ok:true,imagenes_pendientes:pendientes});
    }
    if(path==="/api/admin/diagnosticos" && request.method==="GET") {
      const status=url.searchParams.get("estado");
      const estado=["nuevo","revisado"].includes(status)?status:null;
      const referencia=url.searchParams.get("referencia")?.trim() || null;
      if (referencia && !ID_UUID.test(referencia)) return error("Referencia inválida",400);
      const results=await env.QUIZ_DB.prepare("SELECT id,fecha,servicio_id,estado,ficha_json FROM quiz_diagnosticos WHERE (?1 IS NULL OR estado=?1) AND (?2 IS NULL OR id=?2) ORDER BY fecha DESC LIMIT 100").bind(estado,referencia).all();
      return json({items:results.results.map(x=>({id:x.id,fecha:x.fecha,servicio_id:x.servicio_id,estado:x.estado,ficha:JSON.parse(x.ficha_json)}))});
    }
    const detail=path.match(/^\/api\/admin\/diagnosticos\/([0-9a-f-]{36})$/i);
    if(detail && request.method==="DELETE") {
      if(!sameOrigin(request)) return error("Origen no autorizado",403);
      const result=await env.QUIZ_DB.prepare("DELETE FROM quiz_diagnosticos WHERE id=?1").bind(detail[1]).run();
      return json({ok:result.meta.changes>0});
    }
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
export default { async fetch(request,env,ctx) {
  const path=new URL(request.url).pathname;
  try {
    if(path.startsWith("/api/")) {
      const resp=await api(request,env,ctx),headers=new Headers(resp.headers);
      headers.set("Cache-Control","no-store");
      headers.set("X-Content-Type-Options","nosniff");
      headers.set("X-Frame-Options","SAMEORIGIN");
      headers.set("Referrer-Policy","no-referrer");
      headers.set("X-Robots-Tag","noindex, nofollow");
      return new Response(resp.body,{status:resp.status,statusText:resp.statusText,headers});
    }
    const resp=await env.ASSETS.fetch(request);
    if(path==="/cliente" || path.startsWith("/cliente/") || path==="/admin" || path.startsWith("/admin/")) {
      const headers=new Headers(resp.headers);
      headers.set("Cache-Control","no-store");
      headers.set("X-Robots-Tag","noindex, nofollow");
      headers.set("X-Content-Type-Options","nosniff");
      headers.set("Referrer-Policy","no-referrer");
      headers.set("X-Frame-Options","SAMEORIGIN");
      headers.set("Permissions-Policy","camera=(), microphone=(), geolocation=()");
      return new Response(resp.body,{status:resp.status,statusText:resp.statusText,headers});
    }
    return resp;
  } catch(e) { console.error("Error de solicitud",e); return error("Error del servidor",500); }
} };
