/* Quiz comercial Lapazimpresion3d — diagnóstico y solicitud voluntaria por WhatsApp. */
(() => {
  "use strict";
  // Cinco preguntas: también cubren fabricación funcional, prototipos y resina.
  // Los IDs son estables: la futura ficha Quiz JSON debe usar estos campos.
  const preguntas = [
    { campo: "objetivo", texto: "¿Qué te gustaría conseguir principalmente con este proyecto?", opciones: [
      ["dar_a_conocer", "Que más personas conozcan mi negocio o proyecto."],
      ["mejorar_experiencia", "Ofrecer una experiencia más fluida y profesional a mis clientes."],
      ["celebracion", "Preparar algo único y memorable para una celebración o evento."],
      ["automatizar", "Automatizar tareas repetitivas o gestión de pedidos y citas."],
      ["destacar", "Destacar frente a la competencia con algo original y diferente."],
      ["pieza_funcional", "Crear, reemplazar o mejorar una pieza física que cumpla una función."],
      ["figura_detallada", "Crear una figura u objeto con muchos detalles visuales."]
    ] },
    { campo: "situacion", texto: "¿En qué situación te encuentras ahora mismo?", opciones: [
      ["comenzando", "Estoy comenzando algo nuevo desde cero."],
      ["negocio_existente", "Ya tengo un negocio en marcha y quiero mejorarlo."],
      ["organizando_evento", "Estoy organizando un evento especial."],
      ["regalo_detalle", "Quiero preparar un regalo o detalle personalizado."],
      ["explorando", "Estoy explorando posibilidades para el futuro."],
      ["pieza_reproducir", "Tengo una pieza que necesito reproducir o adaptar."],
      ["modelo_fabricar", "Tengo un modelo o diseño que quiero convertir en un objeto físico."]
    ] },
    { campo: "contacto_actual", texto: "¿Cómo se utilizará o compartirá el resultado de tu proyecto?", opciones: [
      ["en_persona", "Principalmente en persona: en un local, oficina, stand o cara a cara."],
      ["internet", "A través de internet: redes sociales, WhatsApp o mensajería digital."],
      ["reservas_pedidos", "Recibo reservas, pedidos o citas recurrentes."],
      ["fecha_fija", "Voy a reunir a varias personas o entregar detalles en una fecha fija."],
      ["sin_canal", "Todavía no tengo un canal definido."],
      ["uso_funcional", "Se instalará, ensamblará o utilizará como parte de otro objeto."],
      ["pieza_visual", "Será una figura, maqueta o pieza para exhibir y apreciar de cerca."]
    ] },
    { campo: "mejora_deseada", texto: "¿Qué es lo más importante para tu proyecto?", opciones: [
      ["recuerdo_fisico", "Que recuerden mi marca o mi evento por un buen detalle físico."],
      ["acceso_inmediato", "Que accedan a mi menú, catálogo o información al instante."],
      ["menos_mensajes", "Que puedan solicitar o comprar algo sin depender de tantos mensajes manuales."],
      ["producto_personalizado", "Ofrecer un producto físico original y 100% personalizado."],
      ["organizar_trabajo", "Organizar mejor mi tiempo, atención o flujo de trabajo."],
      ["ajuste_resistencia", "Que una pieza tenga las medidas, el ajuste o la resistencia adecuados."],
      ["detalle_acabado", "Que una figura o pieza tenga detalles finos y buen acabado visual."]
    ] },
    { campo: "preparacion", texto: "¿Qué tan avanzado tienes tu proyecto o material de apoyo?", opciones: [
      ["logo_diseno", "Ya tengo mi logo, diseño o idea bien clara."],
      ["fotos_referencias", "Tengo fotografías, referencias o un manual básico."],
      ["presencia_existente", "Ya tengo presencia (redes/web), pero quiero dar el siguiente salto."],
      ["ayuda_desde_cero", "Necesito que me ayuden a aterrizar la solución desde cero."],
      ["cotizando", "Por ahora solo estoy cotizando y viendo posibilidades."],
      ["medidas_modelo", "Tengo medidas, planos, una pieza de muestra o un archivo 3D."],
      ["referencia_figura", "Tengo una imagen, escultura o referencia de la figura que quiero."]
    ] }
  ];

  const servicios = {
    R1: { titulo: "Llaveros y artículos personalizados en 3D", descripcion: "Convierte tu idea en recuerdos, regalos o piezas promocionales que las personas puedan conservar.", beneficios: ["Diseños personalizados para eventos, negocios y regalos", "Opciones de acabado y cantidad según tu proyecto", "Podemos trabajar a partir de un logotipo, referencia o idea"] },
    R2: { titulo: "Soportes QR/NFC personalizados", descripcion: "Conecta la atención presencial con la información digital a través de un soporte diseñado para tu negocio.", beneficios: ["Acceso a información desde el teléfono", "Soportes de mesa o mostrador con diseño personalizado", "NFC opcional para teléfonos compatibles"] },
    R3: { titulo: "Página web, menú o catálogo digital", descripcion: "Presenta tus servicios o productos de manera clara y accesible desde el celular, incluso cuando no puedes contestar mensajes.", beneficios: ["Información organizada para tus visitantes", "Fotografías, descripciones y medios de contacto", "Una dirección web que puedes compartir fácilmente"] },
    R4: { titulo: "Sistema web personalizado", descripcion: "Estudiamos contigo las tareas que más tiempo consumen para proponer funciones de pedidos, citas o administración adecuadas a tu negocio.", beneficios: ["Flujos de solicitud más ordenados", "Posibilidad de panel de administración", "Funciones implementadas según necesidades y alcance acordados"] },
    R5: { titulo: "Proyecto combinado: impresión 3D y soluciones digitales", descripcion: "Podemos conectar una pieza física personalizada con una experiencia digital diseñada para el mismo objetivo.", beneficios: ["Un artículo o soporte físico distintivo", "Acceso a información o experiencias desde el teléfono", "Componentes físicos y digitales cotizados según el proyecto"] },
    R6: { titulo: "Piezas funcionales y prototipos en impresión 3D", descripcion: "Podemos revisar la fabricación de repuestos, adaptadores, carcasas, soportes y prototipos a medida.", beneficios: ["Revisión de medidas, archivos o pieza de muestra", "Material y proceso según uso, tolerancias y exigencias", "Viabilidad y precio sujetos a evaluación técnica"] },
    R7: { titulo: "Figuras y piezas detalladas en resina 3D", descripcion: "Para miniaturas, figuras, modelos decorativos o piezas donde destacan los detalles finos. Evaluaremos si la resina es adecuada para su uso.", beneficios: ["Detalles finos y geometrías complejas según diseño", "Revisión de referencias y dimensiones", "Acabado, material y viabilidad sujetos a cotización"] }
  };

  // Reglas deterministas: las preguntas 3 y 4 pesan x2. La prioridad
  // funcional evita que R5 se active solo por una suma de señales vagas.
  function obtenerRecomendacion(r) {
    const puntos = { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 };
    const tabla = {
      objetivo: {
        dar_a_conocer: {R1:2,R3:2,R2:1}, mejorar_experiencia:{R2:1,R3:2,R4:1},
        celebracion:{R1:5}, automatizar:{R4:6}, destacar:{R1:2,R2:1,R5:1}
      },
      situacion: {
        comenzando:{R1:1,R3:1}, negocio_existente:{R2:1,R3:1,R4:1},
        organizando_evento:{R1:5}, regalo_detalle:{R1:5}, explorando:{R3:1}
      },
      contacto_actual: {
        en_persona:{R1:1,R2:3}, internet:{R3:3}, reservas_pedidos:{R4:4},
        fecha_fija:{R1:4}, sin_canal:{R3:1}
      },
      mejora_deseada: {
        recuerdo_fisico:{R1:5}, acceso_inmediato:{R2:3,R3:4},
        menos_mensajes:{R4:6}, producto_personalizado:{R1:5}, organizar_trabajo:{R4:6}
      },
      preparacion: {
        logo_diseno:{R1:1,R2:1}, fotos_referencias:{R1:1,R3:1},
        presencia_existente:{R3:1,R4:1}, ayuda_desde_cero:{R3:1}, cotizando:{}
      }
    };
    for (const campo of Object.keys(tabla)) {
      const peso = ["contacto_actual", "mejora_deseada"].includes(campo) ? 2 : 1;
      for (const [id, valor] of Object.entries(tabla[campo][r[campo]] || {})) puntos[id] += valor*peso;
    }
    const evento = r.objetivo === "celebracion" || ["organizando_evento", "regalo_detalle"].includes(r.situacion);
    const fisicoExplicito = ["recuerdo_fisico", "producto_personalizado"].includes(r.mejora_deseada);
    const operativo = r.objetivo === "automatizar" || ["menos_mensajes", "organizar_trabajo"].includes(r.mejora_deseada);
    const info = r.mejora_deseada === "acceso_inmediato";
    const presencial = r.contacto_actual === "en_persona";
    const pedir = r.contacto_actual === "reservas_pedidos";
    const funcional = r.objetivo === "pieza_funcional" || r.situacion === "pieza_reproducir" || r.contacto_actual === "uso_funcional" || r.mejora_deseada === "ajuste_resistencia";
    const figura = r.objetivo === "figura_detallada" || r.contacto_actual === "pieza_visual" || r.mejora_deseada === "detalle_acabado";
    let id;
    // Las necesidades técnicas explícitas ganan a señales comerciales genéricas.
    // Si se mezclan funcionalidad y detalle, priorizar evaluación de la función.
    if (funcional) id = "R6";
    else if (figura) id = "R7";
    else if (r.situacion === "modelo_fabricar" && r.preparacion === "medidas_modelo") id = "R6";
    else if (r.situacion === "modelo_fabricar" && r.preparacion === "referencia_figura") id = "R7";
    else if (operativo) id = "R4";
    else if (evento && (fisicoExplicito || r.contacto_actual === "fecha_fija" || !info)) id = "R1";
    else if (fisicoExplicito) id = "R1";
    else if (info && presencial) id = "R2";
    else if (info || r.contacto_actual === "internet") id = "R3";
    else if (pedir) id = "R4";
    else {
      const preferencia = ["R1", "R3", "R2", "R4"];
      id = preferencia.reduce((mejor, candidato) => puntos[candidato] > puntos[mejor] ? candidato : mejor);
    }
    // R5 solo se recomienda cuando hay evidencia independiente y explícita
    // de necesidad física Y digital; no por organizar una celebración.
    const fisico = fisicoExplicito || (evento && r.contacto_actual === "fecha_fija");
    const digital = info || operativo || (r.objetivo === "mejorar_experiencia" && r.contacto_actual === "internet");
    if (fisico && digital && !operativo && !evento && !funcional && !figura) id = "R5";
    const base = servicios[id];
    let complemento = null;
    if (id === "R1" && evento) complemento = "También podemos integrar NFC en los recuerdos para enlazar una galería de fotos y videos, redes sociales o una página del evento con mensajes de invitados. La página y sus funciones se cotizan aparte; cualquier publicación de mensajes requiere moderación y privacidad.";
    else if (id === "R1" && r.objetivo === "dar_a_conocer") complemento = "Podemos añadir NFC o un QR que lleve a tus redes o a una página de contacto.";
    else if (id === "R2") complemento = "Si todavía no tienes un destino digital, podemos crear una página, menú o catálogo para enlazarlo al soporte.";
    else if (id === "R3" && presencial) complemento = "Un soporte QR para mostrador o mesa puede facilitar el acceso a la página.";
    else if (id === "R4" && presencial) complemento = "Podemos explorar códigos QR de mesa o mostrador cuando encajen con tu operación.";
    else if (id === "R6") complemento = "Puedes compartir fotografías, medidas o un archivo 3D al solicitar la propuesta. Las piezas de uso crítico, estructural o de seguridad requieren evaluación especial y podrían no ser viables.";
    else if (id === "R7") complemento = "Comparte fotos, dimensiones o un modelo 3D para evaluar los detalles, el acabado y si conviene resina u otro proceso.";
    else if (id === "R5") complemento = "Definiremos por separado el diseño físico y la función digital, para que elijas qué incluir.";
    return {id, titulo:base.titulo, descripcion:base.descripcion, beneficios:[...base.beneficios], complemento, demo:null};
  }

  // Esquema 4.0: admite siete recomendaciones; diagnósticos anteriores se conservan.
  const VERSION_FICHA_QUIZ = "4.0";
  const TIPO_FICHA_QUIZ = "ficha_quiz";
  const WHATSAPP_COMERCIAL = "526121999963"; // Mismo número que los CTA existentes del sitio.
  // URL ya utilizada en el botón de demostración de la página principal.
  const DEMO_RESTAURANTE = "https://desarrollo-taqueria-el-comal.lapazimpresion3d.workers.dev/";
  const RECOMENDACIONES_CON_DEMO = new Set(["R3", "R4"]);

  function crearFichaDiagnostico(r) {
    const recomendacion = obtenerRecomendacion(r);
    const respuestasNormalizadas = Object.fromEntries(
      preguntas.map((pregunta) => [pregunta.campo, r[pregunta.campo] ?? null])
    );
    return {
      tipo_documento: TIPO_FICHA_QUIZ,
      version_esquema: VERSION_FICHA_QUIZ,
      id_diagnostico: null, // Sin backend no se asigna un identificador persistente.
      id_proyecto: null,
      origen: "lapazimpresion3d_web",
      fecha_generacion: new Date().toISOString(),
      respuestas: respuestasNormalizadas,
      recomendacion: {
        id: recomendacion.id,
        titulo: recomendacion.titulo,
        estado: "orientativa",
        complemento_sugerido: recomendacion.complemento
      }
    };
  }

  function construirMensajeWhatsApp(r, referencia) {
    const ficha = crearFichaDiagnostico(r);
    const lineas = [
      "Hola, visité Lapazimpresion3d y respondí el cuestionario.",
      ...(referencia ? [`Referencia de mi diagnóstico: ${referencia}`] : []),
      "",
      "Mis respuestas:"
    ];
    preguntas.forEach((pregunta, indice) => {
      const elegida = pregunta.opciones.find(([id]) => id === ficha.respuestas[pregunta.campo]);
      lineas.push(`${indice + 1}. ${pregunta.texto}`);
      lineas.push(elegida ? elegida[1] : "Sin responder");
    });
    lineas.push("", `Recomendación recibida: ${ficha.recomendacion.titulo}.`);
    if (ficha.recomendacion.complemento_sugerido) {
      lineas.push(`Complemento sugerido: ${ficha.recomendacion.complemento_sugerido}`);
    }
    lineas.push("", "Me gustaría recibir información para valorar una propuesta.");
    return lineas.join("\n");
  }

  const seccion = document.getElementById("quiz-negocio");
  if (!seccion) return;
  const botonInicio = document.getElementById("quiz-iniciar");
  const presentacion = document.getElementById("quiz-presentacion");
  const panel = document.getElementById("quiz-panel");
  const contenido = document.getElementById("quiz-pregunta-contenedor");
  const progresoTexto = document.getElementById("quiz-progreso-texto");
  const progresoBarra = document.getElementById("quiz-progreso-barra");
  const progresoRelleno = document.getElementById("quiz-progreso-relleno");
  const anterior = document.getElementById("quiz-anterior");
  const reiniciar = document.getElementById("quiz-reiniciar");
  const cerrar = document.getElementById("quiz-cerrar");
  const respuestas = Object.create(null);
  let paso = 0;
  let idSolicitud = null;
  function obtenerIdSolicitud() {
    if (!idSolicitud && typeof crypto !== "undefined" && crypto.randomUUID) idSolicitud = crypto.randomUUID();
    return idSolicitud;
  }

  function limpiarRespuestas() {
    Object.keys(respuestas).forEach((clave) => delete respuestas[clave]);
    idSolicitud = null;
  }
  function etiquetaDe(pregunta, valor) {
    return pregunta.opciones.find(([id]) => id === valor)?.[1] || "Sin responder";
  }
  function enfocar() {
    // Al cambiar la pregunta, ubicar a usuarios de teclado y lectores de pantalla.
    const encabezado = contenido.querySelector("[tabindex='-1']");
    if (encabezado) encabezado.focus({ preventScroll: true });
    const rect = seccion.getBoundingClientRect();
    if (rect.top < 0 || rect.top > innerHeight * .75) {
      seccion.scrollIntoView({ behavior: "instant", block: "start" });
    }
  }
  function progreso(actual) {
    progresoTexto.textContent = actual === 5 ? "Cuestionario completado · 5 de 5" : `Pregunta ${actual + 1} de 5`;
    progresoBarra.setAttribute("aria-valuenow", String(actual));
    progresoRelleno.style.width = `${actual * 20}%`;
  }
  function mostrarResumen() {
    progreso(5);
    contenido.replaceChildren();
    const resultado = obtenerRecomendacion(respuestas);
    const etiqueta = document.createElement("p");
    etiqueta.className = "quiz-resultado-etiqueta";
    etiqueta.textContent = "TU RECOMENDACIÓN";
    const titulo = document.createElement("h3");
    titulo.className = "quiz-pregunta-titulo";
    titulo.tabIndex = -1;
    titulo.textContent = resultado.titulo;
    const descripcion = document.createElement("p");
    descripcion.className = "quiz-resultado-descripcion";
    descripcion.textContent = resultado.descripcion;
    const beneficiosTitulo = document.createElement("h4");
    beneficiosTitulo.className = "quiz-beneficios-titulo";
    beneficiosTitulo.textContent = "¿Qué puedes conseguir?";
    const beneficios = document.createElement("ul");
    beneficios.className = "quiz-beneficios";
    resultado.beneficios.forEach((beneficio) => {
      const li = document.createElement("li");
      li.textContent = beneficio;
      beneficios.append(li);
    });
    contenido.append(etiqueta, titulo, descripcion, beneficiosTitulo, beneficios);
    if (resultado.complemento) {
      const complemento = document.createElement("p");
      complemento.className = "quiz-complemento";
      complemento.textContent = resultado.complemento;
      contenido.append(complemento);
    }
    const nota = document.createElement("p");
    nota.className = "quiz-resultado-nota";
    nota.textContent = "Esta es una orientación inicial, no una cotización ni una función contratada.";
    contenido.append(nota);

    const detalles = document.createElement("details");
    detalles.className = "quiz-detalles";
    const resumenTitulo = document.createElement("summary");
    resumenTitulo.textContent = "Revisar mis cinco respuestas";
    detalles.append(resumenTitulo);
    const lista = document.createElement("dl");
    lista.className = "quiz-resumen";
    preguntas.forEach((pregunta) => {
      const fila = document.createElement("div");
      const dt = document.createElement("dt");
      dt.textContent = pregunta.texto;
      const dd = document.createElement("dd");
      dd.textContent = etiquetaDe(pregunta, respuestas[pregunta.campo]);
      fila.append(dt, dd);
      lista.append(fila);
    });
    detalles.append(lista);
    contenido.append(detalles);

    const acciones = document.createElement("div");
    acciones.className = "quiz-acciones-resultado";
    const botonPropuesta = document.createElement("button");
    botonPropuesta.type = "button";
    botonPropuesta.className = "quiz-accion-whatsapp";
    botonPropuesta.textContent = "Solicitar una propuesta";
    acciones.append(botonPropuesta);
    const preguntaWA = document.createElement("a");
    preguntaWA.className = "quiz-accion-secundaria";
    preguntaWA.textContent = "Prefiero hacer una pregunta por WhatsApp";
    preguntaWA.href = `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent("Hola, tengo una pregunta sobre sus servicios de Lapazimpresion3d.")}`;
    preguntaWA.target = "_blank";
    preguntaWA.rel = "noopener noreferrer";
    acciones.append(preguntaWA);
    if (RECOMENDACIONES_CON_DEMO.has(resultado.id)) {
      const enlaceDemo = document.createElement("a");
      enlaceDemo.className = "quiz-accion-secundaria";
      enlaceDemo.textContent = "Ver demo de Taquería El Comal";
      enlaceDemo.href = DEMO_RESTAURANTE;
      enlaceDemo.target = "_blank";
      enlaceDemo.rel = "noopener noreferrer";
      acciones.append(enlaceDemo);
    }
    const formulario = document.createElement("form");
    formulario.className = "quiz-formulario-contacto";
    formulario.hidden = true;
    formulario.noValidate = false;
    const formTitulo = document.createElement("h4");
    formTitulo.textContent = "Datos para preparar tu propuesta";
    formulario.append(formTitulo);
    const formNota = document.createElement("p");
    formNota.textContent = "Registraremos tu solicitud aquí. No necesitas enviar un mensaje por WhatsApp.";
    formulario.append(formNota);
    function campo(nombre, etiqueta, opts={}) {
      const label = document.createElement("label");
      label.textContent = etiqueta;
      const inp = opts.multiline ? document.createElement("textarea") : document.createElement("input");
      inp.name = nombre;
      if (!opts.multiline) inp.type = opts.type || "text";
      if (opts.required) inp.required = true;
      inp.maxLength = opts.max || 120;
      inp.autocomplete = opts.autocomplete || "off";
      if (opts.placeholder) inp.placeholder = opts.placeholder;
      label.append(inp); formulario.append(label); return inp;
    }
    const nombre = campo("nombre", "Tu nombre *", {required:true,max:100,autocomplete:"name"});
    const proyecto = campo("proyecto", "Negocio, evento o proyecto (opcional)", {max:120});
    const telefono = campo("telefono", "WhatsApp de contacto (10 dígitos) *", {required:true,type:"tel",max:25,autocomplete:"tel",placeholder:"Ej. 6121234567"});
    const comentario = campo("comentario", "Cuéntanos algo más (opcional)", {multiline:true,max:800});
    const consentimiento = document.createElement("label");
    consentimiento.className = "quiz-consentimiento";
    const check = document.createElement("input"); check.type="checkbox"; check.required=true;
    const txt = document.createElement("span");
    txt.append("He leído el ");
    const aviso = document.createElement("a"); aviso.href="/aviso-privacidad.html"; aviso.target="_blank"; aviso.rel="noopener noreferrer"; aviso.textContent="aviso de privacidad";
    txt.append(aviso," y autorizo el uso de mis datos para responder esta solicitud.");
    consentimiento.append(check,txt); formulario.append(consentimiento);
    const enviar = document.createElement("button"); enviar.type="submit"; enviar.className="quiz-accion-whatsapp"; enviar.textContent="Enviar solicitud"; formulario.append(enviar);
    const estadoSolicitud = document.createElement("p"); estadoSolicitud.className="quiz-estado-solicitud"; estadoSolicitud.setAttribute("role","status"); formulario.append(estadoSolicitud);
    botonPropuesta.addEventListener("click",()=>{formulario.hidden=false;botonPropuesta.hidden=true;nombre.focus();});
    formulario.addEventListener("submit",async e=>{
      e.preventDefault();
      if (!formulario.reportValidity()) return;
      const numero=telefono.value.replace(/\D/g,"");
      if (!/^\d{10}$/.test(numero)) {estadoSolicitud.textContent="Introduce un WhatsApp de 10 dígitos.";telefono.focus();return;}
      enviar.disabled=true; estadoSolicitud.textContent="Registrando solicitud…";
      const ficha=crearFichaDiagnostico(respuestas);
      ficha.id_diagnostico=obtenerIdSolicitud();
      try {
        const r=await fetch("/api/quiz/propuestas",{method:"POST",headers:{"Content-Type":"application/json"},credentials:"same-origin",body:JSON.stringify({ficha,contacto:{nombre:nombre.value.trim(),proyecto:proyecto.value.trim(),telefono:numero,comentario:comentario.value.trim()},acepta_privacidad:check.checked})});
        const data=await r.json().catch(()=>({}));
        if(!r.ok || !data.ok) throw new Error(data.error||"No se pudo registrar. Intenta de nuevo.");
        const confirmacion=document.createElement("div");confirmacion.className="quiz-confirmacion";
        const h=document.createElement("h4");h.textContent="Solicitud recibida";
        const folio=document.createElement("p");folio.textContent=`Tu folio es ${data.folio}. Guárdalo para cualquier consulta.`;
        const detalle=document.createElement("p");detalle.textContent="Revisaremos tu proyecto y te contactaremos. El envío de esta solicitud no constituye una compra ni confirma un precio.";
        const seguir=document.createElement("a");seguir.className="quiz-accion-secundaria";seguir.textContent="Continuar por WhatsApp (opcional)";
        seguir.href=`https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(`Hola, registré una solicitud en Lapazimpresion3d. Mi folio es ${data.folio}.`)}`;
        seguir.target="_blank";seguir.rel="noopener noreferrer";
        confirmacion.append(h,folio,detalle,seguir);formulario.replaceWith(confirmacion);
        preguntaWA.hidden=true;
      } catch(err) {estadoSolicitud.textContent=err.message;enviar.disabled=false;}
    });
    acciones.append(formulario);
    contenido.append(acciones);
    anterior.disabled = false;
    enfocar();
  }
  function mostrarPaso() {
    if (paso >= preguntas.length) { mostrarResumen(); return; }
    const pregunta = preguntas[paso];
    progreso(paso);
    contenido.replaceChildren();
    const titulo = document.createElement("h3");
    titulo.id = "quiz-pregunta-titulo";
    titulo.className = "quiz-pregunta-titulo";
    titulo.tabIndex = -1;
    titulo.textContent = pregunta.texto;
    const opciones = document.createElement("div");
    opciones.className = "quiz-opciones";
    opciones.setAttribute("role", "group");
    opciones.setAttribute("aria-labelledby", titulo.id);
    pregunta.opciones.forEach(([id, etiqueta]) => {
      const boton = document.createElement("button");
      boton.type = "button";
      boton.className = "quiz-opcion";
      boton.textContent = etiqueta;
      boton.setAttribute("aria-pressed", String(respuestas[pregunta.campo] === id));
      boton.addEventListener("click", () => {
        if (respuestas[pregunta.campo] !== id) idSolicitud = null;
        respuestas[pregunta.campo] = id;
        paso += 1;
        mostrarPaso();
      });
      opciones.append(boton);
    });
    contenido.append(titulo, opciones);
    anterior.disabled = paso === 0;
    enfocar();
  }
  botonInicio.addEventListener("click", () => {
    presentacion.hidden = true;
    panel.hidden = false;
    botonInicio.setAttribute("aria-expanded", "true");
    mostrarPaso();
  });
  anterior.addEventListener("click", () => {
    if (paso > 0) { paso -= 1; mostrarPaso(); }
  });
  reiniciar.addEventListener("click", () => {
    limpiarRespuestas();
    paso = 0;
    mostrarPaso();
  });
  cerrar.addEventListener("click", () => {
    panel.hidden = true;
    presentacion.hidden = false;
    botonInicio.setAttribute("aria-expanded", "false");
    botonInicio.focus();
  });
  // El JSON queda como formato interno. La captura requiere Worker + D1 configurados.
})();
