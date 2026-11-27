(()=>{
'use strict';
const c=globalThis.LP_DEMOS;if(!c)return;
const revision=new URLSearchParams(location.search).get('revision-demos')==='1';
const accesoPractica=revision||c.vistasPracticaPublicas;
const publico=p=>Object.hasOwn(c.planes,p);
const $=id=>document.getElementById(id);
const giro=$('demo-giro'),paquete=$('demo-paquete');if(!giro||!paquete)return;
$('aviso-revision-demos').hidden=!revision;
function enlace(a,url,activo){if(!a)return;a.hidden=!(url&&activo);if(a.hidden){a.removeAttribute('href');return;}a.href=url;a.target='_blank';a.rel='noopener noreferrer';}

for(const card of document.querySelectorAll('.tarjeta-demo[data-negocio]')){
 const n=card.dataset.negocio,p=card.dataset.paquete,activa=publico(p)&&(accesoPractica||c.verificada(n,p));
 enlace(card.querySelector('[data-vista=cliente]'),c.url(n,p),activa);
 enlace(card.querySelector('[data-vista=panel]'),c.url(n,p,'panel'),activa);

}



function actualizar(){const n=giro.value,p=paquete.value,activa=publico(p)&&(accesoPractica||c.verificada(n,p));const cot=$('demo-cotizar'),destino=publico(p)?c.cotizacion(p,n):null;cot.hidden=!destino;if(destino)cot.href=destino;else cot.removeAttribute('href');enlace($('demo-seleccionada'),c.url(n,p),activa);enlace($('demo-panel'),c.url(n,p,'panel'),activa);const combinado=$('demo-combinacion');if(combinado)combinado.textContent=destino?giro.selectedOptions[0].textContent+' — '+paquete.selectedOptions[0].textContent:'Selecciona un giro y un paquete válidos.';$('demo-resultado').textContent=destino?'Selección lista.':'Selecciona una combinación válida.';}
giro.addEventListener('change',actualizar);paquete.addEventListener('change',actualizar);window.addEventListener('pageshow',actualizar);actualizar();
})();
