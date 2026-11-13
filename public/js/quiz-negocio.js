/* Quiz comercial Lapazimpresion3d — etapa 3. Recomendaciones deterministas, sin envío de datos. */
(() => {
  "use strict";
  const preguntas = [
    { campo: "tipo_negocio", texto: "¿Qué tipo de negocio tienes?", opciones: [
      ["restaurante_cafeteria", "Restaurante o cafetería"], ["barberia_estetica", "Barbería o estética"],
      ["tienda_comercio", "Tienda o comercio"], ["turismo_servicios", "Turismo o servicios"], ["otro_negocio", "Otro negocio"]
    ] },
    { campo: "objetivo", texto: "¿Qué te gustaría mejorar?", opciones: [
      ["mostrar_productos_servicios", "Mostrar mis productos o servicios"], ["recibir_pedidos_reservaciones", "Recibir pedidos o reservaciones"],
      ["facilitar_contacto", "Que me contacten fácilmente"], ["organizar_negocio", "Organizar mejor mi negocio"]
    ] },
    { campo: "atencion_actual", texto: "¿Cómo atiendes actualmente a tus clientes?", opciones: [
      ["whatsapp_redes", "WhatsApp y redes sociales"], ["local_fisico", "Principalmente en mi local"],
      ["pagina_sistema", "Ya tengo una página o sistema"], ["comenzando", "Apenas estoy comenzando"]
    ] },
    { campo: "funcion_deseada", texto: "¿Qué te gustaría ofrecer a tus clientes?", opciones: [
      ["catalogo_menu", "Un catálogo o menú digital"], ["pedidos_citas", "Pedidos o citas en línea"],
      ["qr_nfc", "Un QR o NFC personalizado"], ["solucion_completa", "Una solución más completa"]
    ] },
    { campo: "alcance", texto: "¿Qué necesitas por ahora?", opciones: [
      ["sencillo", "Algo sencillo para comenzar"], ["varias_funciones", "Una solución con varias funciones"],
      ["mejorar_existente", "Mejorar lo que ya tengo"], ["explorando", "Todavía estoy explorando"]
    ] }
  ];

  // Recomendaciones orientativas. No son presupuestos ni requisitos confirmados.
  const servicios = {
    R1: { titulo: "Página de contacto y presencia digital", descripcion: "Una página sencilla donde tus clientes encuentren tus datos, redes sociales y formas de contactarte desde su teléfono.", beneficios: ["Facilita el contacto por WhatsApp", "Reúne ubicación y redes en un solo lugar", "Comparte tu información con un enlace"] },
    R2: { titulo: "Menú o catálogo digital", descripcion: "Muestra tus productos o servicios organizados para que tus clientes consulten opciones desde su celular.", beneficios: ["Organiza productos o servicios por categorías", "Muestra fotografías y descripciones", "Facilita consultas de tus clientes"] },
    R3: { titulo: "Sistema de pedidos o reservaciones", descripcion: "Permite recibir solicitudes de pedidos o reservaciones desde una página adaptada a tu operación. Las funciones concretas se definen contigo.", beneficios: ["Facilita el registro de solicitudes", "Reduce mensajes repetitivos al tomar pedidos o citas", "Puede ampliarse según el funcionamiento del negocio"] },
    R4: { titulo: "Página digital con QR/NFC personalizado", descripcion: "Conecta un soporte físico personalizado con una página de información, menú o catálogo que tus clientes pueden abrir en su teléfono.", beneficios: ["Un acceso rápido desde un código QR", "Puedes actualizar la página sin reemplazar el soporte QR", "NFC opcional en dispositivos compatibles"] },
    R5: { titulo: "Solución web personalizada", descripcion: "Una página con varias funciones o herramientas de administración adaptadas a tus necesidades reales, sin añadir complejidad innecesaria.", beneficios: ["Combina funciones según tus prioridades", "Permite definir herramientas para la operación", "Puede desarrollarse progresivamente"] }
  };

  function obtenerRecomendacion(r) {
    // Prioridad 1: intención funcional concreta de recibir pedidos o citas.
    const requierePedidos = r.objetivo === "recibir_pedidos_reservaciones" || r.funcion_deseada === "pedidos_citas";
    const requiereAdministracion = r.objetivo === "organizar_negocio";
    const requiereVarias = r.alcance === "varias_funciones";
    const deseaSolucionCompleta = r.funcion_deseada === "solucion_completa";
    const requiereCatalogo = r.objetivo === "mostrar_productos_servicios" || r.funcion_deseada === "catalogo_menu";
    const solicitaQR = r.funcion_deseada === "qr_nfc";
    let id;
    if (requierePedidos) id = "R3";
    else if (requiereAdministracion || (deseaSolucionCompleta && requiereVarias)) id = "R5";
    else if (solicitaQR) id = "R4";
    else if (requiereCatalogo) id = "R2";
    else if (r.objetivo === "facilitar_contacto") id = "R1";
    else if (deseaSolucionCompleta) id = "R5";
    else if (requiereVarias) id = "R5";
    else if (r.tipo_negocio === "restaurante_cafeteria" && r.atencion_actual === "local_fisico") id = "R2";
    else id = "R1";

    const base = servicios[id];
    let complemento = null;
    if (solicitaQR && id !== "R4") complemento = "Puedes complementar tu solución con soportes QR personalizados o NFC opcional.";
    else if (id === "R3" && r.tipo_negocio === "restaurante_cafeteria") complemento = "Si atiendes en mesas, también podemos valorar soportes QR personalizados para acceder al menú.";
    else if (id === "R4" && requiereCatalogo) complemento = "El QR puede enlazar a un menú o catálogo digital, según lo que necesites mostrar.";
    else if (id === "R2" && r.atencion_actual === "pagina_sistema") complemento = "Podemos revisar tu página o sistema actual antes de proponer cambios.";
    return { id, titulo: base.titulo, descripcion: base.descripcion, beneficios: [...base.beneficios], complemento, demo: null };
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
  // IDs alineados con ficha_quiz v1.0. Exportación JSON y WhatsApp quedan para etapas posteriores.
})();
