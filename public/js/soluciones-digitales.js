(()=>{
'use strict';
const c=globalThis.LP_DEMOS;if(!c)return;
const revision=new URLSearchParams(location.search).get('revision-demos')==='1';
const accesoPractica=revision||c.vistasPracticaPublicas;
const publico=p=>['p1','p2'].includes(p);
const $=id=>document.getElementById(id);
const giro=$('demo-giro'),paquete=$('demo-paquete');if(!giro||!paquete)return;
$('aviso-revision-demos').hidden=!revision;
function enlace(a,url,activo){if(!a)return;a.hidden=!(url&&activo);if(a.hidden){a.removeAttribute('href');return;}a.href=url;a.target='_blank';a.rel='noopener noreferrer';}
function estado(n,p){return 'Ejemplo interactivo con datos de prueba.';}
for(const card of document.querySelectorAll('.tarjeta-demo[data-negocio]')){
 const n=card.dataset.negocio,p=card.dataset.paquete,activa=publico(p)&&(accesoPractica||c.verificada(n,p));
 enlace(card.querySelector('[data-vista=cliente]'),c.url(n,p),activa);
 enlace(card.querySelector('[data-vista=panel]'),c.url(n,p,'panel'),activa);
 card.querySelector('[data-estado-demo]').textContent=estado(n,p);
}
for(const card of document.querySelectorAll('#paginas-web [data-plan]')){
 const p=Object.keys(c.planes).find(p=>c.planes[p]===card.dataset.plan);
 const disponible=c.negocios.some(n=>c.verificada(n,p));
 card.querySelector('[data-estado]').textContent='Explora el ejemplo interactivo';
}
enlace($('demo-galeria'),c.general('galeria'),accesoPractica||c.generalesVerificadas.galeria);
enlace($('demo-comparador'),c.general('comparador'),accesoPractica||c.generalesVerificadas.comparador);
function actualizar(){const n=giro.value,p=paquete.value,activa=publico(p)&&(accesoPractica||c.verificada(n,p));const cot=$('demo-cotizar'),destino=publico(p)?c.cotizacion(p,n):null;cot.hidden=!destino;if(destino)cot.href=destino;else cot.removeAttribute('href');enlace($('demo-seleccionada'),c.url(n,p),activa);enlace($('demo-panel'),c.url(n,p,'panel'),activa);const combinado=$('demo-combinacion');if(combinado)combinado.textContent=destino?giro.selectedOptions[0].textContent+' — '+paquete.selectedOptions[0].textContent:'Selecciona un giro y un paquete válidos.';$('demo-resultado').textContent=destino?estado(n,p):'Selecciona una combinación disponible.';}
giro.addEventListener('change',actualizar);paquete.addEventListener('change',actualizar);window.addEventListener('pageshow',actualizar);actualizar();
})();
