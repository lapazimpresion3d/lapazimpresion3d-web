const botonMenu = document.querySelector('#boton-menu');
const navegacion = document.querySelector('#navegacion');
const pantallaPequena = window.matchMedia('(width < 768px)');

function mostrarMenu(abierto) {
  botonMenu.setAttribute('aria-expanded', String(abierto));
  navegacion.hidden = pantallaPequena.matches && !abierto;
}

function ajustarMenu() {
  if (pantallaPequena.matches) {
    botonMenu.hidden = false;
    if (navegacion.contains(document.activeElement)) botonMenu.focus();
  } else if (document.activeElement === botonMenu) {
    navegacion.hidden = false;
    navegacion.querySelector('a').focus();
  }

  botonMenu.hidden = !pantallaPequena.matches;
  mostrarMenu(false);
}

botonMenu.addEventListener('click', () => {
  mostrarMenu(botonMenu.getAttribute('aria-expanded') !== 'true');
});

navegacion.addEventListener('click', (evento) => {
  const enlace = evento.target.closest('a');
  if (!enlace || !pantallaPequena.matches) return;

  const titulo = document.querySelector(enlace.hash)?.querySelector('h1, h2');
  titulo?.focus({ preventScroll: true });
  mostrarMenu(false);
});

botonMenu.closest('header').addEventListener('keydown', (evento) => {
  if (evento.key === 'Escape' && botonMenu.getAttribute('aria-expanded') === 'true') {
    mostrarMenu(false);
    botonMenu.focus();
  }
});

pantallaPequena.addEventListener('change', ajustarMenu);
ajustarMenu();
