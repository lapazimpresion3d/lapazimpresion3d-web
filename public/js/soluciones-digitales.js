(() => {
  'use strict';
  // Registrar exclusivamente URLs HTTPS desplegadas y verificadas (incluidas sus pruebas funcionales).
  // Clave: paquete/giro. No registrar El Comal aquí hasta validar el alcance del paquete.
  const demos = Object.freeze({
    // 'presencia-digital/cafeteria': { url: URL verificada, listaParaContratar: false }
  });
  const form = document.getElementById('explorar-demos');
  if (!form) return;
  const giro = form.elements.giro, paquete = form.elements.paquete;
  const resultado = document.getElementById('demo-resultado');
  const enlace = document.getElementById('demo-seleccionada');
  function publicada(demo) {
    if (!demo || typeof demo.url !== 'string') return false;
    try { return new URL(demo.url).protocol === 'https:'; } catch { return false; }
  }
  function configurarEnlace(a, demo) {
    const activa = publicada(demo);
    a.hidden = !activa;
    if (activa) a.href = demo.url; else a.removeAttribute('href');
    return activa;
  }
  function actualizar() {
    const demo = demos[paquete.value + '/' + giro.value];
    const activa = configurarEnlace(enlace, demo);
    resultado.textContent = activa ? (demo.listaParaContratar === true ? 'Demostración disponible.' : 'Demostración disponible; contratación en desarrollo.') : 'Demostración en desarrollo para este giro y paquete.';
  }
  for (const card of document.querySelectorAll('#paginas-web [data-plan]')) {
    const entradas = Array.from(giro.options).map(o => demos[card.dataset.plan + '/' + o.value]).filter(publicada);
    const demo = entradas.find(d => d.listaParaContratar === true) || entradas[0];
    const activa = configurarEnlace(card.querySelector('[data-demo]'), demo);
    card.querySelector('[data-demo-pendiente]').hidden = activa;
    card.querySelector('[data-estado]').textContent = !activa ? 'En desarrollo' : demo.listaParaContratar === true ? 'Demo disponible · consulta condiciones' : 'Demo disponible · contratación en desarrollo';
  }
  form.addEventListener('change', actualizar);
  window.addEventListener('pageshow', actualizar);
  actualizar();
})();
