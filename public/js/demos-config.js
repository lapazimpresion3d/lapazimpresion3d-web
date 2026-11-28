/* Demostraciones representativas; las rutas /panel son alias del Worker público de demos. */
(function(root){
'use strict';
const base='https://demos.lapazimpresion3d.com';
const representativos=Object.freeze({"cafe-mirador":"p1","barberia-elite":"p2","torque-automotriz":"p3","mundo-mascotas":"p3","bahia-tours":"p4","taqueria-el-comal":"p4"});
const negocios=Object.freeze(Object.keys(representativos));
const fichas=Object.freeze({"cafe-mirador":{"nombre":"Café Mirador","giro":"Cafetería","asset":"cafe-mirador"},"barberia-elite":{"nombre":"Barbería Élite","giro":"Barbería","asset":"barberia-elite"},"mundo-mascotas":{"nombre":"Mundo Mascotas","giro":"Tienda de mascotas","asset":"mundo-mascotas"},"torque-automotriz":{"nombre":"Torque Automotriz","giro":"Taller mecánico","asset":"auto-servicio-bahia"},"taqueria-el-comal":{"nombre":"Taquería El Comal","giro":"Restaurante","asset":"taqueria-el-comal"},"bahia-tours":{"nombre":"Bahía Tours","giro":"Turismo","asset":"bahia-tours"}});
const descripciones=Object.freeze({"p1":"Página comercial, información del negocio y catálogo.","p2":"Interacción con clientes mediante pedidos, citas o reservaciones, según el giro.","p3":"Herramientas de operación interna y gestión comercial, según el giro.","p4":"Administración avanzada y herramientas especializadas según la actividad."});
const planes=Object.freeze({p1:'presencia-digital',p2:'negocio-interactivo',p3:'gestion-comercial',p4:'gestion-profesional'});
const giros=Object.freeze({'cafe-mirador':'cafeteria','barberia-elite':'barberia','mundo-mascotas':'mascotas','torque-automotriz':'taller','taqueria-el-comal':'restaurante','bahia-tours':'turismo'});
function cotizacion(p,n){if(!Object.hasOwn(planes,p)||(n!==undefined&&!Object.hasOwn(giros,n)))return null;return 'cotizacion-web.html?paquete='+encodeURIComponent(planes[p])+(n===undefined?'':'&giro='+encodeURIComponent(giros[n]))+'#precios-paquetes';}
const vistasPracticaPublicas=true;
const verificadas=Object.freeze([]);
const generalesVerificadas=Object.freeze({galeria:false,comparador:false});
function url(n,p,v='cliente'){if(!Object.hasOwn(representativos,n)||!Object.hasOwn(planes,p)||!['cliente','panel'].includes(v))return null;return base+'/'+n+(v==='panel'?'/panel':'')+'?plan='+encodeURIComponent(p);}
function comparar(n,p){return Object.hasOwn(representativos,n)&&Object.hasOwn(planes,p)?base+'/demostraciones/configurar/?negocio='+encodeURIComponent(n)+'&plan='+encodeURIComponent(p):null;}
function general(t){return t==='galeria'?base+'/':t==='comparador'?base+'/demostraciones/configurar/':null;}
const api=Object.freeze({base,negocios,planes,giros,representativos,fichas,descripciones,cotizacion,comparar,vistasPracticaPublicas,verificadas,generalesVerificadas,url,general,verificada:(n,p)=>verificadas.includes(n+'/'+p)});
if(typeof module==='object'&&module.exports)module.exports=api;else root.LP_DEMOS=api;
})(globalThis);
