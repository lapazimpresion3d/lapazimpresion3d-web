(() => {
  'use strict';
  // Registrar únicamente URLs HTTPS de demos ya desplegadas y verificadas.
  // Clave: paquete/giro. El Comal conserva su tarjeta independiente.
  const demos = Object.freeze({
    // 'presencia-digital/cafeteria': { url: URL verificada, listaParaContratar: false }
  });
  const selector = document.getElementById('selector-demos');
  const giro = document.getElementById('demo-giro');
  const paquete = document.getElementById('demo-paquete');
  const resultado = document.getElementById('demo-resultado');
  const enlace = document.getElementById('demo-seleccionada');
  if (!selector || !giro || !paquete || !resultado || !enlace) return;
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
  const giros = Array.from(giro.options);
  const paquetes = Array.from(paquete.options);
  const disponible = (p,g) => publicada(demos[p + '/' + g]);
  function actualizar() {
    // Mostrar únicamente combinaciones que cuentan con demo.
    for (const o of paquetes) {
      o.disabled = !disponible(o.value, giro.value);
      o.hidden = o.disabled;
    }
    if (!disponible(paquete.value, giro.value)) {
      const primero = paquetes.find(o => !o.disabled);
      if (primero) paquete.value = primero.value;
    }
    const demo = demos[paquete.value + '/' + giro.value];
    const activa = configurarEnlace(enlace, demo);
    resultado.textContent = activa ? 'Demostración disponible.' : 'Demostración en desarrollo.';
  }
  for (const card of document.querySelectorAll('#paginas-web [data-plan]')) {
    const entradas = giros.map(o => demos[card.dataset.plan + '/' + o.value]).filter(publicada);
    const demo = entradas.find(d => d.listaParaContratar === true) || entradas[0];
    const activa = configurarEnlace(card.querySelector('[data-demo]'), demo);
    card.querySelector('.plan-acciones').hidden = !activa;
    card.querySelector('[data-estado]').textContent = !activa ? 'En desarrollo' : demo.listaParaContratar === true ? 'Demo disponible' : 'Demo disponible · contratación en desarrollo';
  }
  for (const o of giros) {
    o.disabled = !paquetes.some(p => disponible(p.value, o.value));
    o.hidden = o.disabled;
  }
  const primero = giros.find(o => !o.disabled);
  if (!primero) return; // Sin demos de paquete: ni selector ni botones vacíos.
  if (!giros.some(o => o.value === giro.value && !o.disabled)) giro.value = primero.value;
  actualizar();
  selector.hidden = false;
  giro.addEventListener('change', actualizar);
  paquete.addEventListener('change', actualizar);
  window.addEventListener('pageshow', actualizar);
})();
