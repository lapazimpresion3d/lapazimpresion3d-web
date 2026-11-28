/* Adaptador de medición: desactivado salvo consentimiento y configuración explícitos.
 * No carga etiquetas externas, no almacena datos, no acepta datos libres.
 * La integración con GA4 y la gestión del consentimiento se habilitarán aparte.
 */
(function(root){
'use strict';
const services=Object.freeze(['llaveros','soporte_qr','fdm_medida','resina','web']);
const plans=Object.freeze(['presencia-digital','negocio-interactivo','gestion-comercial','gestion-profesional','a-medida','p1','p2','p3','p4']);
const origins=Object.freeze(['web','impresion','quiz']);
const empty=Object.freeze({});
const rules=Object.freeze({
 view_service:{service:services},
 view_demo:{plan:plans},
 view_admin_demo:{plan:plans},
 select_package:{plan:plans},
 quote_start:{source:origins},
 generate_lead:{source:origins},
 whatsapp_click:empty,
 view_gallery:empty,
 view_nfc_guide:empty
});
let sink=null, permitted=false;
function configure(options){
 permitted=options?.consent===true;
 sink=permitted&&typeof options?.send==='function'?options.send:null;
 return Boolean(sink);
}
function revoke(){permitted=false;sink=null;}
function emit(event,params={}){
 if(!permitted||!sink||!Object.hasOwn(rules,event))return false;
 const clean={};
 for(const [key,allowed] of Object.entries(rules[event])){
   if(allowed.includes(params?.[key]))clean[key]=params[key];
 }
 try{sink(event,clean);return true;}catch{return false;}
}
const api=Object.freeze({configure,revoke,emit});
if(typeof module==='object'&&module.exports)module.exports=api;
else root.LP_Medicion=api;
})(globalThis);
