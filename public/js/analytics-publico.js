/* GA4 público: consentimiento previo, sin parámetros personales ni medición automática de URL. */
(()=>{
'use strict';
const ID='G-P5R9WVDCYZ', KEY='lp_analytics_consent_v1', api=globalThis.LP_Medicion;
if(!api)return;
const pages=Object.freeze({
 '/':'/','/index.html':'/','/llaveros-personalizados.html':'/llaveros-personalizados.html','/soportes-qr.html':'/soportes-qr.html','/paginas-web.html':'/paginas-web.html','/impresion-resina.html':'/impresion-resina.html','/impresion-3d-a-medida.html':'/impresion-3d-a-medida.html','/guia-nfc.html':'/guia-nfc.html','/ejemplos.html':'/ejemplos.html','/paquetes-web.html':'/paquetes-web.html','/cotizacion-web.html':'/cotizacion-web.html','/cotizar-impresion.html':'/cotizar-impresion.html'
});
if(!Object.hasOwn(pages,location.pathname))return;
const canonical=location.origin+pages[location.pathname];
let active=false, loaded=false;
function read(){try{return localStorage.getItem(KEY)}catch{return null}}
function store(v){try{localStorage.setItem(KEY,v)}catch{}}
function tag(){globalThis.dataLayer.push(arguments)}
function enable(){
 if(active)return;
 active=true;globalThis['ga-disable-'+ID]=false;
 if(!loaded){
  loaded=true;globalThis.dataLayer=globalThis.dataLayer||[];
  tag('consent','default',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});
  tag('js',new Date());
  tag('consent','update',{analytics_storage:'granted'});
  tag('config',ID,{send_page_view:false,allow_google_signals:false,allow_ad_personalization_signals:false,page_location:canonical,page_referrer:'',page_title:document.title});
  const script=document.createElement('script');script.async=true;script.src='https://www.googletagmanager.com/gtag/js?id='+ID;document.head.append(script);
 }else tag('consent','update',{analytics_storage:'granted'});
 api.configure({consent:true,send:(event,params)=>tag('event',event,{...params,send_to:ID,page_location:canonical,page_referrer:''})});
 tag('event','page_view',{send_to:ID,page_location:canonical,page_title:document.title,page_referrer:''});
 const service={'/llaveros-personalizados.html':'llaveros','/soportes-qr.html':'soporte_qr','/paginas-web.html':'web','/impresion-resina.html':'resina','/impresion-3d-a-medida.html':'fdm_medida'}[pages[location.pathname]];
 if(service)api.emit('view_service',{service});
 if(pages[location.pathname]==='/ejemplos.html')api.emit('view_gallery');
 if(pages[location.pathname]==='/guia-nfc.html')api.emit('view_nfc_guide');
}
function disable(){
 active=false;api.revoke();
 if(loaded){tag('consent','update',{analytics_storage:'denied',ad_storage:'denied',ad_user_data:'denied',ad_personalization:'denied'});globalThis['ga-disable-'+ID]=true;}
 for(const item of document.cookie.split(';')){
  const name=item.split('=')[0].trim();
  if(name==='_ga'||name.startsWith('_ga_'))for(const domain of ['',location.hostname,'.'+location.hostname])document.cookie=name+'=; Max-Age=0; path=/'+(domain?'; domain='+domain:'');
 }
}
const panel=document.createElement('section');panel.className='lp-consent-panel';panel.hidden=true;panel.setAttribute('aria-label','Preferencias de estadísticas');panel.innerHTML='<strong>Estadísticas opcionales</strong><p>Con tu permiso utilizamos Google Analytics para conocer las visitas y mejorar nuestros servicios. Puedes rechazarlo sin afectar las cotizaciones. <a href="aviso-privacidad.html">Aviso de privacidad</a>.</p><div class="lp-consent-actions"><button type="button" data-choice="deny">Rechazar</button><button type="button" data-choice="allow">Aceptar estadísticas</button></div>';
const prefs=document.createElement('button');prefs.type='button';prefs.className='lp-consent-prefs';prefs.textContent='Preferencias de estadísticas';prefs.setAttribute('aria-expanded','false');
const footer=document.querySelector('footer')||document.body;footer.append(prefs);document.body.append(panel);
function show(open){panel.hidden=!open;prefs.setAttribute('aria-expanded',String(open));if(open)panel.querySelector('button').focus()}
prefs.addEventListener('click',()=>show(panel.hidden));
panel.addEventListener('click',e=>{const choice=e.target.closest('[data-choice]')?.dataset.choice;if(!choice)return;store(choice);if(choice==='allow')enable();else disable();show(false);prefs.focus({preventScroll:true});});
const choice=read();if(choice==='allow')enable();else if(choice==='deny')disable();else{panel.hidden=false;prefs.setAttribute('aria-expanded','true');}
window.addEventListener('storage',e=>{if(e.key!==KEY)return;if(e.newValue==='allow')enable();else disable();});
const sections={'llaveros':'llaveros','soportes-qr':'soporte_qr','paginas-web':'web','impresion-resina':'resina','piezas-a-medida':'fdm_medida'};
document.addEventListener('toggle',e=>{const el=e.target;if(el.tagName!=='DETAILS'||!el.open||!el.classList.contains('servicio-desplegable'))return;const service=sections[el.parentElement?.id];if(service)api.emit('view_service',{service});},true);
document.addEventListener('click',e=>{
 const a=e.target.closest('a[href]');if(!a)return;
 let u;try{u=new URL(a.href)}catch{return}
 if(['wa.me','api.whatsapp.com','web.whatsapp.com'].includes(u.hostname)){api.emit('whatsapp_click');return;}
 const card=a.closest('[data-paquete]');const plan=card?.dataset.paquete||document.querySelector('#demo-paquete')?.value;
 if(a.dataset.vista==='cliente'||a.id==='demo-seleccionada')api.emit('view_demo',{plan});
 if(a.dataset.vista==='panel'||a.id==='demo-panel')api.emit('view_admin_demo',{plan});
 if(u.origin===location.origin&&u.pathname==='/cotizacion-web.html'){const p=u.searchParams.get('paquete');if(p)api.emit('select_package',{plan:p});api.emit('quote_start',{source:'web'});}
 if(u.origin===location.origin&&u.pathname==='/cotizar-impresion.html')api.emit('quote_start',{source:'impresion'});
});
})();
