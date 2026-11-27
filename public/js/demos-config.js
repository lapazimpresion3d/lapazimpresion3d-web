/* URL base central. Activar únicamente tras validar ambas vistas y el aislamiento. */
(function(root){
'use strict';
const base='https://desarrollo-taqueria-el-comal.lapazimpresion3d.workers.dev';
const negocios=Object.freeze(['cafe-mirador','barberia-elite','mundo-mascotas','auto-servicio-bahia','taqueria-el-comal']);
const planes=Object.freeze({p1:'presencia-digital',p2:'negocio-interactivo',p3:'gestion-comercial',p4:'gestion-profesional'});
const verificadas=Object.freeze([]);
const generalesVerificadas=Object.freeze({galeria:false,comparador:false});
function url(n,p,v='cliente'){if(!negocios.includes(n)||!Object.hasOwn(planes,p)||!['cliente','panel'].includes(v))return null;return base+(v==='panel'?'/demostraciones/':'/demostraciones/negocio/')+'?negocio='+encodeURIComponent(n)+'&plan='+encodeURIComponent(p)+(v==='panel'?'&vista=administracion':'');}
function general(t){return Object.hasOwn(generalesVerificadas,t)?base+(t==='galeria'?'/demostraciones/ejemplos/':'/demostraciones/'):null;}
const api=Object.freeze({base,negocios,planes,verificadas,generalesVerificadas,url,general,verificada:(n,p)=>verificadas.includes(n+'/'+p)});
if(typeof module==='object'&&module.exports)module.exports=api;else root.LP_DEMOS=api;
})(globalThis);
