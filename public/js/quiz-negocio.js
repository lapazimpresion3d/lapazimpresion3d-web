/* Quiz comercial Lapazimpresion3d — diagnóstico y solicitud voluntaria por WhatsApp. */
(() => {
  "use strict";
  // Cinco preguntas sobre objetivos y circunstancias, no sobre productos.
  // Los IDs son estables: la futura ficha Quiz JSON debe usar estos campos.
  const preguntas = [
    { campo: "objetivo", texto: "¿Qué te gustaría conseguir?", opciones: [
      ["dar_a_conocer", "Que más personas conozcan mi negocio o proyecto."],
      ["mejorar_experiencia", "Ofrecer una mejor experiencia a mis clientes."],
      ["celebracion", "Preparar algo especial para una celebración."],
      ["ahorrar_tiempo", "Ahorrar tiempo en tareas que hago manualmente."],
      ["desarrollar_idea", "Tengo una idea, pero no sé cómo llevarla a cabo."]
    ] },
    { campo: "situacion", texto: "¿En qué situación te encuentras?", opciones: [
      ["comenzando", "Estoy comenzando algo nuevo."],
      ["negocio_existente", "Ya tengo un negocio y quiero mejorarlo."],
      ["organizando_evento", "Estoy organizando un evento."],
      ["regalo_detalle", "Quiero preparar un regalo o detalle."],
      ["explorando", "Estoy explorando posibilidades."]
    ] },
    { campo: "contacto_actual", texto: "¿Cómo te relacionas con las personas a las que quieres llegar?", opciones: [
      ["en_persona", "Principalmente en persona."],
      ["redes_mensajes", "A través de redes sociales y mensajes."],
      ["pedidos_citas", "Recibo pedidos, solicitudes o citas."],
      ["entregar_a_varios", "Estoy preparando algo para entregar a varias personas."],
      ["sin_forma_definida", "Todavía no tengo una forma definida."]
    ] },
    { campo: "mejora_deseada", texto: "¿Qué te gustaría mejorar de esa experiencia?", opciones: [
      ["recordar_marca_evento", "Que recuerden mi marca o mi evento."],
      ["encontrar_informacion", "Que encuentren información fácilmente."],
      ["menos_mensajes", "Que puedan solicitar algo sin tantos mensajes."],
      ["original_personalizado", "Ofrecer algo original y personalizado."],
      ["organizar_atencion", "Organizar mejor la atención o el trabajo."]
    ] },
    { campo: "preparacion", texto: "¿Qué tan avanzado tienes tu proyecto?", opciones: [
      ["diseno_idea", "Ya tengo un diseño o una idea definida."],
      ["fotos_referencias", "Tengo fotografías o referencias."],
      ["mejorar_existente", "Tengo algo funcionando, pero quiero mejorarlo."],
      ["necesita_orientacion", "Necesito ayuda para definir la solución."],
      ["solo_explorando", "Por ahora solo quiero conocer posibilidades."]
    ] }
  ];

  const servicios = {
    R1: { titulo: "Llaveros y artículos personalizados en 3D", descripcion: "Una forma de crear recuerdos, regalos o detalles distintivos a partir de tu idea, fotografía o diseño.", beneficios: ["Personalización para negocios, eventos o regalos", "Posibilidad de trabajar desde un diseño o referencia", "Opciones según la cantidad y el tipo de pieza"] },
    R2: { titulo: "Soportes QR personalizados y acceso digital", descripcion: "Una pieza física personalizada que ayuda a las personas a encontrar información desde su teléfono. El contenido puede actualizarse sin cambiar el soporte QR.", beneficios: ["Un acceso visible en mesas o mostradores", "Enlace a información y medios de contacto", "Posibilidad de integrar NFC opcional"] },
    R3: { titulo: "Página web, menú o catálogo digital", descripcion: "Una manera de reunir y organizar información para que tus clientes la encuentren fácilmente desde su celular.", beneficios: ["Información y servicios en un mismo lugar", "Presentación de productos, fotografías o enlaces", "Fácil de compartir desde redes sociales"] },
    R4: { titulo: "Solución web para pedidos y organización", descripcion: "Podemos estudiar una página con funciones para gestionar solicitudes, pedidos o citas de acuerdo con la operación real de tu negocio.", beneficios: ["Reduce la repetición de información por mensajes", "Permite definir un flujo de solicitudes", "Puede incorporar herramientas de administración por etapas"] },
    R5: { titulo: "Proyecto combinado y personalizado", descripcion: "Podemos explorar una combinación de impresión 3D y recursos digitales para dar forma a tu proyecto sin asumir funciones que todavía no has elegido.", beneficios: ["Artículos físicos personalizados", "Información accesible desde un teléfono", "Alcance adaptable a tu idea y presupuesto"] }
  };

  function obtenerRecomendacion(r) {
    // Señales ponderadas; ninguna pregunta pide elegir un producto de catálogo.
    // Una necesidad concreta tiene más peso que un contexto amplio.
    const puntos = { R1: 0, R2: 0, R3: 0, R4: 0, R5: 0 };
    const sumar = (id, cantidad) => { puntos[id] += cantidad; };
    const reglas = {
      objetivo: {
        dar_a_conocer: { R1: 2, R2: 1, R3: 2 },
        mejorar_experiencia: { R2: 1, R3: 2, R4: 1 },
        celebracion: { R1: 5 },
        ahorrar_tiempo: { R4: 5 },
        desarrollar_idea: { R1: 1, R5: 2 }
      },
      situacion: {
        comenzando: { R1: 1, R3: 1 },
        negocio_existente: { R2: 1, R3: 1, R4: 1 },
        organizando_evento: { R1: 5 },
        regalo_detalle: { R1: 5 },
        explorando: { R5: 1 }
      },
      contacto_actual: {
        en_persona: { R1: 1, R2: 2 },
        redes_mensajes: { R3: 2 },
        pedidos_citas: { R4: 3 },
        entregar_a_varios: { R1: 3 },
        sin_forma_definida: { R5: 1 }
      },
      mejora_deseada: {
        recordar_marca_evento: { R1: 5 },
        encontrar_informacion: { R2: 3, R3: 4 },
        menos_mensajes: { R4: 5 },
        original_personalizado: { R1: 4, R5: 1 },
        organizar_atencion: { R4: 5 }
      },
      preparacion: {
        diseno_idea: { R1: 1, R5: 1 },
        fotos_referencias: { R1: 1, R3: 1 },
        mejorar_existente: { R3: 1, R4: 1 },
        necesita_orientacion: { R5: 1 },
        solo_explorando: { R5: 1 }
      }
    };
    for (const [campo, mapa] of Object.entries(reglas)) {
      const aportes = mapa[r[campo]] || {};
      for (const [id, cantidad] of Object.entries(aportes)) sumar(id, cantidad);
    }

    // Los eventos, regalos y recuerdos no deben perder frente a señales digitales generales.
    const ocasion = r.objetivo === "celebracion" || ["organizando_evento", "regalo_detalle"].includes(r.situacion);
    const operacion = r.objetivo === "ahorrar_tiempo" || ["menos_mensajes", "organizar_atencion"].includes(r.mejora_deseada);
    const memorabilidad = r.mejora_deseada === "recordar_marca_evento" || r.mejora_deseada === "original_personalizado";
    let id;
    if (ocasion && !operacion) id = "R1";
    else if (operacion) id = "R4";
    else if (memorabilidad) id = "R1";
    else {
      // Selección estable en empates: servicio específico antes que uno combinado.
      const orden = ["R3", "R2", "R1", "R4", "R5"];
      id = orden.reduce((mejor, candidato) => puntos[candidato] > puntos[mejor] ? candidato : mejor);
      // Dos necesidades respaldadas y equilibradas justifican valorar una combinación.
      const fisico = puntos.R1 + puntos.R2;
      const digital = puntos.R3 + puntos.R4;
      if (fisico >= 5 && digital >= 5 && Math.abs(fisico - digital) <= 2 && !["pedidos_citas"].includes(r.contacto_actual)) id = "R5";
    }
    const base = servicios[id];
    let complemento = null;
    if (id === "R1" && r.objetivo === "dar_a_conocer") complemento = "Si quieres compartir además tu información, podemos valorar una página digital o un QR como complemento.";
    else if (id === "R3" && r.contacto_actual === "en_persona") complemento = "Si atiendes en un local, un soporte QR personalizado puede facilitar el acceso a esa información.";
    else if (id === "R4" && r.contacto_actual === "en_persona") complemento = "Podemos estudiar un acceso por QR desde el mostrador o las mesas, si resulta útil.";
    else if (id === "R5") complemento = "Antes de elegir componentes, revisaremos contigo qué parte debe ser física y cuál digital.";
    return { id, titulo: base.titulo, descripcion: base.descripcion, beneficios: [...base.beneficios], complemento, demo: null };
  }

  // Estructura de intercambio compartida con Arquitecto / Jan AI (esquema 2.0).
  const VERSION_FICHA_QUIZ = "2.0";
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

  function descargarFichaQuiz(r) {
    const ficha = crearFichaDiagnostico(r);
    const contenido = JSON.stringify(ficha, null, 2) + "\n";
    const archivo = new Blob([contenido], { type: "application/json;charset=utf-8" });
    const url = URL.createObjectURL(archivo);
    const enlace = document.createElement("a");
    enlace.href = url;
    enlace.download = `lapazimpresion3d-ficha-quiz-${ficha.fecha_generacion.slice(0, 10)}.json`;
    enlace.hidden = true;
    document.body.append(enlace);
    enlace.click();
    enlace.remove();
    // El navegador necesita completar el inicio de la descarga antes de liberar el recurso.
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  function construirMensajeWhatsApp(r) {
    const ficha = crearFichaDiagnostico(r);
    const lineas = [
      "Hola, visité Lapazimpresion3d y respondí el cuestionario.",
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

  function limpiarRespuestas() {
    Object.keys(respuestas).forEach((clave) => delete respuestas[clave]);
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
    const enlaceWhatsApp = document.createElement("a");
    enlaceWhatsApp.className = "quiz-accion-whatsapp";
    enlaceWhatsApp.textContent = "Solicitar propuesta por WhatsApp";
    enlaceWhatsApp.href = `https://wa.me/${WHATSAPP_COMERCIAL}?text=${encodeURIComponent(construirMensajeWhatsApp(respuestas))}`;
    enlaceWhatsApp.target = "_blank";
    enlaceWhatsApp.rel = "noopener noreferrer";
    const avisoWhatsApp = document.createElement("p");
    avisoWhatsApp.className = "quiz-aviso-whatsapp";
    avisoWhatsApp.textContent = "Se abrirá WhatsApp con un mensaje preparado. Puedes revisarlo y editarlo antes de enviarlo.";
    // La demo solo se muestra para recomendaciones relacionadas con menús o pedidos.
    if (RECOMENDACIONES_CON_DEMO.has(resultado.id)) {
      const enlaceDemo = document.createElement("a");
      enlaceDemo.className = "quiz-accion-secundaria";
      enlaceDemo.textContent = "Ver demo de Taquería El Comal";
      enlaceDemo.href = DEMO_RESTAURANTE;
      enlaceDemo.target = "_blank";
      enlaceDemo.rel = "noopener noreferrer";
      acciones.append(enlaceDemo);
    }
    const botonDescarga = document.createElement("button");
    botonDescarga.type = "button";
    botonDescarga.className = "quiz-accion-secundaria";
    botonDescarga.textContent = "Descargar mi diagnóstico (JSON)";
    botonDescarga.addEventListener("click", () => descargarFichaQuiz(respuestas));
    const notaDescarga = document.createElement("p");
    notaDescarga.className = "quiz-aviso-whatsapp";
    notaDescarga.textContent = "Archivo para conservar tus respuestas o compartirlo con nosotros. No incluye datos personales ni se envía automáticamente.";
    acciones.append(enlaceWhatsApp, avisoWhatsApp);
    acciones.append(botonDescarga, notaDescarga);
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
  // La exportación se genera en el navegador; no hay almacenamiento ni envío automático.
})();
