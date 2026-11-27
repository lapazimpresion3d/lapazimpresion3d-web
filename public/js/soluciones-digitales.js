(()=>{
'use strict';
const c=globalThis.LP_DEMOS;if(!c)return;
const revision=new URLSearchParams(location.search).get('revision-demos')==='1';
const $=id=>document.getElementById(id);
const giro=$('demo-giro'),paquete=$('demo-paquete');if(!giro||!paquete)return;
$('aviso-revision-demos').hidden=!revision;
function enlace(a,url,activo){if(!a)return;a.hidden=!(url&&activo);if(a.hidden){a.removeAttribute('href');return;}a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
function estado(n,p){return c.verificada(n,p)?'Demostración de práctica verificada.':revision?'Vista previa de desarrollo · sin verificar.':'Validación pública pendiente.';}
for(const card of document.querySelectorAll('.tarjeta-demo[data-negocio]')){
 const n=card.dataset.negocio,p=card.dataset.paquete,activa=revision||c.verificada(n,p);
 enlace(card.querySelector('[data-vista=cliente]'),c.url(n,p),activa);
 enlace(card.querySelector('[data-vista=panel]'),c.url(n,p,'panel'),activa);
 card.querySelector('[data-estado-demo]').textContent=estado(n,p);
}
for(const card of document.querySelectorAll('#paginas-web [data-plan]')){
 const p=Object.keys(c.planes).find(p=>c.planes[p]===card.dataset.plan);
 const disponible=c.negocios.some(n=>c.verificada(n,p));
 card.querySelector('[data-estado]').textContent=disponible?'Demo de práctica disponible':'Demostración pendiente de validación';
}
enlace($('demo-galeria'),c.general('galeria'),revision||c.generalesVerificadas.galeria);
enlace($('demo-comparador'),c.general('comparador'),revision||c.generalesVerificadas.comparador);
function actualizar(){const n=giro.value,p=paquete.value,activa=revision||c.verificada(n,p);enlace($('demo-seleccionada'),c.url(n,p),activa);enlace($('demo-panel'),c.url(n,p,'panel'),activa);$('demo-resultado').textContent=estado(n,p);}
giro.addEventListener('change',actualizar);paquete.addEventListener('change',actualizar);window.addEventListener('pageshow',actualizar);actualizar();
})();
