/* Turnstile: verificación justo antes de enviar, token nuevo para cada intento. */
(()=>{
'use strict';
const sitekey='0x4AAAAAAGWpaj6C2ok-6hpD';
const actions=new Set(['cotizacion_web','cotizacion_impresion','cotizacion_quiz','admin_login']);
let loading;
function load(){
 if(globalThis.turnstile?.render)return Promise.resolve(globalThis.turnstile);
 if(loading)return loading;
 loading=new Promise((resolve,reject)=>{
  const s=document.createElement('script');
  s.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
  s.async=true;
  const timeout=setTimeout(()=>{s.remove();reject(new Error('No se pudo cargar la verificación de seguridad. Intenta nuevamente.'));},20000);
  s.onload=()=>{clearTimeout(timeout);if(globalThis.turnstile?.render)resolve(globalThis.turnstile);else reject(new Error('Verificación no disponible.'));};
  s.onerror=()=>{clearTimeout(timeout);s.remove();reject(new Error('No se pudo cargar la verificación de seguridad.'));};
  document.head.append(s);
 }).catch(e=>{loading=null;throw e;});
 return loading;
}
async function token(action,button){
 if(!actions.has(action)||!button?.parentNode)throw new Error('No se pudo iniciar la verificación.');
 const cf=await load();
 const mount=document.createElement('div');
 mount.style.cssText='flex-basis:100%;max-width:100%;margin:8px 0';
 mount.setAttribute('aria-label','Verificación de seguridad');
 button.parentNode.insertBefore(mount,button);
 let widget,timer;
 try{
  return await new Promise((resolve,reject)=>{
   const fail=()=>reject(new Error('No se completó la verificación de seguridad. Intenta nuevamente.'));
   timer=setTimeout(fail,120000);
   widget=cf.render(mount,{sitekey,action,size:'flexible',execution:'execute',appearance:'interaction-only',callback:resolve,'error-callback':fail,'expired-callback':fail,'timeout-callback':fail,retry:'never'});
   cf.execute(widget);
  });
 }finally{clearTimeout(timer);if(widget!==undefined)try{cf.remove(widget)}catch{}mount.remove();}
}
globalThis.LP_Turnstile=Object.freeze({token});
})();
