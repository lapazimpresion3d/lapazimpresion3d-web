(()=>{'use strict';
const c=globalThis.LP_ORIENTACION_WEB, $=id=>document.getElementById(id);
const panel=$('asistente-controles');if(!c||!panel)return;
const giro=$('asistente-giro'),opciones=[...panel.querySelectorAll('input[name="necesidad-web"]')],resultado=$('asistente-recomendacion');
function actualizar(){
 const r=c.orientar(giro.value,opciones.filter(o=>o.checked).map(o=>o.value));
 resultado.hidden=!r;
 if(!r){$('asistente-aviso').textContent='Elige tu giro para obtener una recomendación.';return;}
 const plan=c.planes[r.paquete];
 $('asistente-nombre').textContent=plan?.nombre||'Proyecto a medida';
 $('asistente-precio').textContent=plan?.precio||'Bajo cotización';
 const lista=$('asistente-funciones');lista.replaceChildren(...r.funciones.map(f=>{const li=document.createElement('li');li.textContent=f;return li;}));
 $('asistente-extra').hidden=!r.adicionales.length;
 $('asistente-cotizar').href=c.url(r);
 $('asistente-aviso').textContent=(plan?.nombre||'Proyecto a medida')+' · '+r.funciones.length+' funciones seleccionadas. Puedes modificar la selección en cualquier momento.';
}
panel.addEventListener('change',actualizar);
$('asistente-limpiar').addEventListener('click',()=>{giro.value='';for(const o of opciones)o.checked=false;actualizar();giro.focus();});
panel.hidden=false;actualizar();
})();