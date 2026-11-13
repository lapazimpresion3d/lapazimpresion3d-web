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
  if(data.version_esquema==="5.0" && (!presupuestoValido(data.respuestas.presupuesto) || !data.respuestas.presupuesto)) return false;
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
const WEB_TIPOS = new Set(["Página de contacto digital", "Página web para mi negocio", "Menú digital para restaurantes", "Catálogo de productos para comercios"]);
const WEB_FUNCIONES = new Set(["Carrito y pedidos desde la página", "Pedidos por WhatsApp", "Efectivo y transferencias con registro manual", "Cotizar integración de pagos en línea con tarjeta", "Pedidos para recoger o a domicilio", "Pedidos desde las mesas", "Reservaciones y agenda", "Panel privado", "Pantalla de cocina y comandas", "Seguimiento de pedidos", "Reportes de pedidos y cobros"]);
const WEB_COMPLEMENTOS = new Set(["Código QR para la página", "Soportes QR o llaveros con NFC opcional", "Carga inicial de productos, precios y fotografías", "Configuración inicial para buscadores y aviso de privacidad", "Capacitación para administrar la página"]);
function textoWeb(v,min,max) {return typeof v==='string' && v.trim().length>=min && v.trim().length<=max;}
function listaWeb(v,permitidos) {return Array.isArray(v) && v.length<=permitidos.size && v.every(x=>typeof x==='string' && permitidos.has(x)) && new Set(v).size===v.length;}
function solicitudWebValida(d) {
 return d && typeof d==='object' && !Array.isArray(d) &&
   textoWeb(d.nombre,2,100) && textoWeb(d.negocio,2,100) && textoWeb(d.giro,2,80) &&
   typeof d.telefono==='string' && /^\d{10}$/.test(d.telefono) &&
   WEB_TIPOS.has(d.tipo_pagina) && listaWeb(d.funciones,WEB_FUNCIONES) &&
   listaWeb(d.complementos,WEB_COMPLEMENTOS) && textoWeb(d.detalles,5,500) && presupuestoValido(d.presupuesto??"") &&
   d.acepta_privacidad===true;
}

// Servicio físico: formulario único con campos específicos, registro en quiz_propuestas.
const TIPOS_FISICOS = Object.freeze({llaveros:"Llaveros personalizados",fdm_medida:"Impresión 3D a medida",resina:"Figuras y miniaturas en resina",soporte_qr:"Soportes QR/NFC"});
const CAMPOS_FISICOS = Object.freeze({
 llaveros:["cantidad","tamano","diseno","colores","nfc","uso"],
 fdm_medida:["cantidad","tamano","uso","material","resistencia","referencia"],
 resina:["cantidad","tamano","uso","detalle","referencia"],
 soporte_qr:["cantidad","tamano","uso","logo","destino_qr","contenido_existente","nfc"]
});
const PRESUPUESTOS = new Set(["menos_500","500_1500","1500_3000","3000_6000","mas_6000","sin_definir",""]);
function presupuestoValido(v) {return typeof v==="string"&&PRESUPUESTOS.has(v);}
function solicitudFisicaValida(d){
 if(!d||typeof d!=="object"||Array.isArray(d)||!Object.hasOwn(TIPOS_FISICOS,d.servicio)||!textoWeb(d.nombre,2,100)||!/^\d{10}$/.test(d.telefono||"")||!textoWeb(d.detalles,5,1200)||d.acepta_privacidad!==true||!presupuestoValido(d.presupuesto))return false;
 if(!["","negocio","evento","personal"].includes(d.contexto||""))return false;
 if(!["","si","no","no_se"].includes(d.fecha_prioritaria||""))return false;
 if(typeof d.proyecto!=="string"||d.proyecto.length>120 ||typeof d.fecha_deseada!=="string"||d.fecha_deseada.length>30)return false;
 const claves=CAMPOS_FISICOS[d.servicio];
 if(!d.campos||typeof d.campos!=="object"||Array.isArray(d.campos)||Object.keys(d.campos).some(k=>!claves.includes(k)))return false;
 return claves.every(k=>typeof d.campos[k]==="string"&&d.campos[k].length<=280);
}
async function notificarPropuesta(env,folio) {
 if(!env.RESEND_API_KEY || !env.NOTIFY_EMAIL || !env.EMAIL_FROM) return;
 const link=`https://lapazimpresion3d.com/admin/`;
 const res=await fetch("https://api.resend.com/emails",{method:"POST",headers:{"Authorization":`Bearer ${env.RESEND_API_KEY}`,"Content-Type":"application/json","Idempotency-Key":`quiz-${folio}`},body:JSON.stringify({from:env.EMAIL_FROM,to:[env.NOTIFY_EMAIL],subject:`Nueva solicitud Lapazimpresion3d · ${folio}`,text:`Se registró una solicitud de propuesta: ${folio}.\nConsúltala en el panel privado: ${link}\nEl correo no contiene datos personales.`})});
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
async function api(request,env,ctx) {
  const url=new URL(request.url), path=url.pathname;
  if(!env.QUIZ_DB) return error("Base de datos no configurada",503);
  if(path==="/api/servicios/propuestas" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!await verificarLimite(request,env,"propuesta_servicio",6,3600)) return error("Demasiadas solicitudes. Intenta más tarde.",429);
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
      contexto:d.contexto||"",fecha_prioritaria:d.fecha_prioritaria||"",campos:d.campos,detalles:d.detalles,imagenes};
    let result;
    try{result=await env.QUIZ_DB.prepare("INSERT INTO quiz_propuestas (id,folio,fecha,nombre,proyecto,telefono,comentario,servicio_id,ficha_json,estado,privacidad_aceptada) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'nueva',1)")
      .bind(id,folio,fecha,d.nombre.trim(),(d.proyecto||TIPOS_FISICOS[d.servicio]).trim(),d.telefono,d.detalles.trim(),prefijo,JSON.stringify(ficha)).run();}
    catch(e){await limpiarImagenes(env,imagenes);throw e;}
    if(result.meta.changes!==1){await limpiarImagenes(env,imagenes);return error("No se pudo registrar la solicitud",500);}
    if(ctx?.waitUntil)ctx.waitUntil(notificarPropuesta(env,folio).catch(e=>console.error("Aviso",e)));
    return json({ok:true,folio},201);
  }
  if(path==="/api/web/propuestas" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!await verificarLimite(request,env,"propuesta_web",6,3600)) return error("Demasiadas solicitudes. Intenta más tarde.",429);
    const d=await leerJson(request,6000);
    if(!solicitudWebValida(d)) return error("Revisa los datos del formulario y acepta el aviso de privacidad.",400);
    const id=crypto.randomUUID(), fecha=new Date().toISOString();
    const folio=`WEB-${id.replace(/-/g,"").slice(0,10).toUpperCase()}`;
    const ficha={
      tipo_documento:"solicitud_web",version_esquema:"1.0",id_solicitud:id,
      origen:"cotiza_pagina_web",fecha_generacion:fecha,
      tipo_pagina:d.tipo_pagina,funciones:d.funciones,complementos:d.complementos,
      giro:d.giro,detalles:d.detalles,presupuesto:d.presupuesto||"",estado:"orientativa"
    };
    const result=await env.QUIZ_DB.prepare("INSERT INTO quiz_propuestas (id,folio,fecha,nombre,proyecto,telefono,comentario,servicio_id,ficha_json,estado,privacidad_aceptada) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'nueva',1)")
      .bind(id,folio,fecha,d.nombre.trim(),d.negocio.trim(),d.telefono,d.detalles.trim(),"WEB",JSON.stringify(ficha)).run();
    if(result.meta.changes!==1) return error("No se pudo registrar la solicitud",500);
    if(ctx?.waitUntil) ctx.waitUntil(notificarPropuesta(env,folio).catch(e=>console.error("Aviso por correo",e)));
    return json({ok:true,folio},201);
  }
  if(path==="/api/quiz/propuestas" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!await verificarLimite(request,env,"propuesta",6,3600)) return error("Demasiadas solicitudes. Intenta más tarde.",429);
    const data=await leerJson(request,8500);
    if(!data || !fichaValida(data.ficha)) return error("Diagnóstico inválido",400);
    if(!contactoValido(data.contacto)) return error("Datos de contacto inválidos",400);
    if(data.acepta_privacidad!==true) return error("Debes aceptar el aviso de privacidad",400);
    const id=ID_UUID.test(data.ficha.id_diagnostico||"")?data.ficha.id_diagnostico:crypto.randomUUID();
    const ficha=normalizarFicha(data.ficha,id);
    const c=data.contacto;
    const nombre=c.nombre.trim(), proyecto=c.proyecto.trim(),telefono=c.telefono,comentario=c.comentario.trim();
    // Folio legible, derivado de UUID pero sin exponer información personal.
    const folio=`LP-${id.replace(/-/g,"").slice(0,10).toUpperCase()}`;
    const result=await env.QUIZ_DB.prepare("INSERT OR IGNORE INTO quiz_propuestas (id,folio,fecha,nombre,proyecto,telefono,comentario,servicio_id,ficha_json,estado,privacidad_aceptada) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,'nueva',1)")
      .bind(id,folio,ficha.fecha_generacion,nombre,proyecto,telefono,comentario,ficha.recomendacion.id,JSON.stringify(ficha)).run();
    if(result.meta.changes===0) {
      // Reenvío de una misma ficha: solo devolver el folio si el teléfono coincide.
      // Un ID reutilizado con otro contacto no debe simular una solicitud recibida.
      const anterior=await env.QUIZ_DB.prepare("SELECT telefono FROM quiz_propuestas WHERE id=?1").bind(id).first();
      if(!anterior || anterior.telefono!==telefono) return error("Referencia repetida; vuelve a iniciar la solicitud",409);
    }
    if(result.meta.changes>0 && ctx?.waitUntil) ctx.waitUntil(notificarPropuesta(env,folio).catch(e=>console.error("Aviso por correo",e)));
    return json({ok:true,folio},result.meta.changes>0?201:200);
  }
  // La ruta histórica no crea prospectos identificables. Conservar solo consulta de registros anteriores.
  if(path==="/api/quiz/solicitudes" && request.method==="POST") return error("Este registro fue reemplazado por el formulario de propuestas",410);
  if(path==="/api/admin/login" && request.method==="POST") {
    if(!sameOrigin(request)) return error("Origen no autorizado",403);
    if(!env.ADMIN_PASSWORD || !env.SESSION_SECRET) return error("Acceso no configurado",503);
    if(!await verificarLimite(request,env,"login",5,900)) return error("Demasiados intentos. Intenta más tarde.",429);
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
    const propuesta=path.match(/^\/api\/admin\/propuestas\/([0-9a-f-]{36})$/i);
    if(propuesta && request.method==="PATCH") {
      if(!sameOrigin(request)) return error("Origen no autorizado",403);
      const data=await leerJson(request,160);
      if(!["nueva","en_revision","contactado","cotizado","cerrado"].includes(data?.estado)) return error("Estado inválido",400);
      const result=await env.QUIZ_DB.prepare("UPDATE quiz_propuestas SET estado=?1 WHERE id=?2").bind(data.estado,propuesta[1]).run();
      return json({ok:result.meta.changes>0});
    }
    if(propuesta && request.method==="DELETE") {
      if(!sameOrigin(request)) return error("Origen no autorizado",403);
      const fila=await env.QUIZ_DB.prepare('SELECT ficha_json FROM quiz_propuestas WHERE id=?1').bind(propuesta[1]).first();
      const result=await env.QUIZ_DB.prepare("DELETE FROM quiz_propuestas WHERE id=?1").bind(propuesta[1]).run();
      if(result.meta.changes>0&&fila){const imagenes=JSON.parse(fila.ficha_json).imagenes||[];if(ctx?.waitUntil)ctx.waitUntil(limpiarImagenes(env,imagenes));else await limpiarImagenes(env,imagenes);}
      return json({ok:result.meta.changes>0});
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
    if(path.startsWith("/api/")) return await api(request,env,ctx);
    const resp=await env.ASSETS.fetch(request);
    if(path==="/admin" || path.startsWith("/admin/")) {
      const headers=new Headers(resp.headers);
      headers.set("Cache-Control","no-store");
      headers.set("X-Robots-Tag","noindex, nofollow");
      headers.set("X-Content-Type-Options","nosniff");
      headers.set("Referrer-Policy","same-origin");
      return new Response(resp.body,{status:resp.status,statusText:resp.statusText,headers});
    }
    return resp;
  } catch(e) { console.error("Error de solicitud",e); return error("Error del servidor",500); }
} };
