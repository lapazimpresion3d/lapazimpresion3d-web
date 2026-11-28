(()=>{
'use strict';
const c=globalThis.LP_DEMOS,o=globalThis.LP_ORIENTACION_WEB;if(!c)return;
const revision=new URLSearchParams(location.search).get('revision-demos')==='1';
const accesoPractica=revision||c.vistasPracticaPublicas;
const $=id=>document.getElementById(id);
const aviso=$('aviso-revision-demos');if(aviso)aviso.hidden=!revision;
function enlace(a,url,activo,nueva=false){if(!a)return;a.hidden=!(url&&activo);if(a.hidden){a.removeAttribute('href');return;}a.href=url;if(nueva)a.target='_blank';else a.removeAttribute('target');a.rel='noopener noreferrer';}
for(const card of document.querySelectorAll('.tarjeta-demo[data-negocio]')){
 const n=card.dataset.negocio,p=card.dataset.paquete,activa=accesoPractica||c.verificada(n,p);
 enlace(card.querySelector('[data-vista=cliente]'),c.url(n,p),activa);
 enlace(card.querySelector('[data-vista=panel]'),c.url(n,p,'panel'),activa);
}
const controles=$('demo-controles');if(!controles||!o)return;
const negocios=[...controles.querySelectorAll('input[name="explorador-negocio"]')],paquetes=[...controles.querySelectorAll('input[name="explorador-paquete"]')];
const leer=grupo=>grupo.find(x=>x.checked)?.value;
const elegir=(grupo,valor)=>{for(const x of grupo)x.checked=x.value===valor;};
let actual=null;
function actualizar(){
 const n=leer(negocios),p=leer(paquetes),f=c.fichas[n],plan=o.planes[c.planes[p]];if(!f||!plan)return;
 $('demo-giro').value=n;$('demo-paquete').value=p;
 $('demo-combinacion').textContent=f.nombre;
 $('demo-resumen-giro').textContent=f.giro;
 $('demo-resumen-plan').textContent=p.toUpperCase()+' — '+plan.nombre;
 $('demo-resultado').textContent=c.descripciones[p];
 $('demo-resumen-precio').textContent=plan.precio;
 $('demo-resumen-foto').src='images/demos/'+f.asset+'-portada.webp';
 $('demo-resumen-logo').src='images/demos/'+f.asset+'-logo.svg'+(n==='torque-automotriz'?'?v=torque1':'');
 const activa=accesoPractica||c.verificada(n,p);
 enlace($('demo-seleccionada'),c.url(n,p),activa,true);
 enlace($('demo-panel'),c.url(n,p,'panel'),activa,true);
 enlace($('demo-cotizar'),c.cotizacion(p,n),true);
 enlace($('demo-comparar'),c.comparar(n,p),true,true);
 actual=n;
}
for(const x of negocios)x.addEventListener('change',()=>{if(x.checked&&x.value!==actual)elegir(paquetes,c.representativos[x.value]);actualizar();});
for(const x of paquetes)x.addEventListener('change',actualizar);
window.addEventListener('pageshow',actualizar);
actualizar();controles.hidden=false;
})();
