/* Documento comercial privado: genera una vista de impresión, no un CFDI. */
(function(root){
"use strict";
const nombres=Object.freeze({"solo_fisico":"Productos físicos · pago único","presencia-digital":"Presencia digital","negocio-interactivo":"Negocio interactivo","gestion-comercial":"Gestión comercial","gestion-profesional":"Gestión profesional","a-medida":"Proyecto a medida"});
const dinero=n=>new Intl.NumberFormat("es-MX",{style:"currency",currency:"MXN"}).format(n/100);
function calcularDescuentoPropuesta(d){
 const campos=["implementacion","fabricacion","extras","mensualidad"];
 if(!d||!campos.every(k=>Number.isSafeInteger(d[k])&&d[k]>=0&&d[k]<=100000000))throw Error("Importes inválidos.");
 const bruto=Object.fromEntries(campos.map(k=>[k,d[k]])),v=d.descuento??{inicial:0,mensual:0,motivo:""};
 if(!v||typeof v!=="object"||Array.isArray(v)||!Number.isInteger(v.inicial)||v.inicial<0||v.inicial>10000||!Number.isInteger(v.mensual)||v.mensual<0||v.mensual>=10000||typeof v.motivo!=="string"||v.motivo.length>240)throw Error("Descuento inválido. Mensualidad inferior al 100%.");
 const suma=bruto.implementacion+bruto.fabricacion+bruto.extras;
 if((v.inicial&&!suma)||(v.mensual&&!bruto.mensualidad)||((v.inicial||v.mensual)&&!v.motivo.trim()))throw Error("Indica un importe base y el motivo del descuento.");
 const redondear=(n,p)=>Math.floor((n*p+5000)/10000);
 const neto={};let acumulado=0,anterior=0;
 for(const k of campos.slice(0,3)){acumulado+=bruto[k];const rebaja=redondear(acumulado,v.inicial);neto[k]=bruto[k]-(rebaja-anterior);anterior=rebaja;}
 neto.mensualidad=bruto.mensualidad-redondear(bruto.mensualidad,v.mensual);
 if(bruto.mensualidad&&!neto.mensualidad)throw Error("La mensualidad neta debe ser mayor que cero.");
 if(!campos.some(k=>neto[k]>0))throw Error("La propuesta debe conservar un importe positivo.");
 const detalle=v.inicial||v.mensual?{version:1,bruto,inicial:v.inicial,mensual:v.mensual,motivo:v.motivo.trim()}:null;
 return {neto,detalle,rebajaInicial:suma-neto.implementacion-neto.fabricacion-neto.extras,rebajaMensual:bruto.mensualidad-neto.mensualidad};
}
function modelo(x,d){
 const q=d?.propuesta;
 if(!q||!Object.hasOwn(nombres,q.paquete)||q.propuesta_id!==x.id)throw Error("No hay una propuesta guardada para esta solicitud.");
 const campos=[["Implementación web","implementacion"],["Fabricación y productos físicos","fabricacion"],["Servicios adicionales de pago único","extras"]];
 for(const k of [...campos.map(c=>c[1]),"mensualidad","total_inicial","total_mensual"])if(!Number.isSafeInteger(q[k])||q[k]<0)throw Error("Importes guardados inválidos.");
 if(q.iva_pct!==16||!Number.isSafeInteger(q.version)||q.version<1)throw Error("Versión o IVA inválidos.");
 const subtotal=campos.reduce((sum,c)=>sum+q[c[1]],0);
 const iva=n=>Math.floor((n*16+50)/100);
 if(q.total_inicial!==subtotal+iva(subtotal)||q.total_mensual!==q.mensualidad+iva(q.mensualidad))throw Error("Los totales guardados no coinciden. Revisa la propuesta.");
 if(q.paquete==="solo_fisico"&&(q.implementacion||q.mensualidad))throw Error("La propuesta física contiene importes digitales.");
 const guardado=q.descuento_json?JSON.parse(q.descuento_json):{};
 let rebajaInicial=0,rebajaMensual=0,bruto=q;
 if(guardado.bruto){if(guardado.version!==1)throw Error("Versión de descuento inválida.");const c=calcularDescuentoPropuesta({...guardado.bruto,descuento:{inicial:guardado.inicial,mensual:guardado.mensual,motivo:guardado.motivo}});if([...campos.map(x=>x[1]),"mensualidad"].some(k=>q[k]!==c.neto[k]))throw Error("Descuento guardado inconsistente.");bruto=guardado.bruto;rebajaInicial=c.rebajaInicial;rebajaMensual=c.rebajaMensual;}
 const aceptada=!!q.fecha_aceptacion;
 const pagado=aceptada?d.pagado:0;
 if(!Number.isSafeInteger(pagado)||pagado<0||pagado>q.total_inicial)throw Error("Saldo de pagos inválido.");
 const condiciones=[
 "Importes expresados en pesos mexicanos (MXN). IVA general del 16% desglosado. El alcance incluido es el indicado en esta propuesta.",
 "Los trabajos o cambios adicionales requieren una cotización y autorización previa."
 ];
 if(q.paquete!=="solo_fisico")condiciones.push("La implementación es un pago independiente. La disponibilidad de las funciones, dominio y servicios de terceros se confirma conforme al alcance acordado.");
 if(q.mensualidad>0)condiciones.push("Sin plazos forzosos de permanencia. Puedes cancelar futuras mensualidades sin penalización avisando antes de la siguiente renovación. El servicio permanece activo mientras la mensualidad esté vigente; los pagos previamente adquiridos siguen siendo exigibles.","La mensualidad cubre el uso, alojamiento, seguridad y mantenimiento técnico según el alcance contratado. No incluye nuevas funcionalidades ni soporte ilimitado.");
 if(q.paquete!=="solo_fisico")condiciones.push("Garantía de 60 días para errores atribuibles al desarrollo originalmente contratado, según el alcance aprobado.");
 if(!aceptada)condiciones.push("Propuesta para revisión del cliente. No implica contratación ni genera un cargo automático.");
 return {folio:String(x.folio),cliente:String(x.nombre||""),negocio:String(x.proyecto||""),telefono:String(x.telefono||""),paquete:nombres[q.paquete],alcance:String(q.alcance||""),version:q.version,fecha:String(q.fecha_actualizacion||"").slice(0,10),aceptada,fechaAceptacion:aceptada?String(q.fecha_aceptacion):"",conceptos:campos.filter(c=>bruto[c[1]]>0).map(c=>[c[0],bruto[c[1]]]),rebajaInicial,rebajaMensual,mensualidadBruta:bruto.mensualidad,subtotal,iva:iva(subtotal),total:q.total_inicial,mensualidad:q.mensualidad,ivaMensual:iva(q.mensualidad),totalMensual:q.total_mensual,pagado,saldo:q.total_inicial-pagado,condiciones};
}
function pintar(doc,m,origen,acciones){
 doc.documentElement.lang="es";
 doc.title="Cotizacion-"+m.folio+"-v"+m.version;
 doc.head.replaceChildren();
 const e=(tag,txt,clase)=>{const a=doc.createElement(tag);if(txt!==undefined)a.textContent=txt;if(clase)a.className=clase;return a;};
 const meta=e("meta");meta.charset="utf-8";const viewport=e("meta");viewport.name="viewport";viewport.content="width=device-width, initial-scale=1";const ref=e("meta");ref.name="referrer";ref.content="no-referrer";
 doc.head.append(meta,viewport,ref);
 const css=e("link");css.rel="stylesheet";css.href=origen+"/css/cotizacion-documento.css?v=1";
 const barra=e("div",undefined,"barra-impresion"),imprimir=e("button","Imprimir / guardar PDF"),cerrar=e("button","Cerrar vista previa"),aviso=e("p","En el diálogo de impresión, elige Guardar como PDF. Revisa las páginas antes de guardar.");
 imprimir.type=cerrar.type="button";imprimir.disabled=true;imprimir.addEventListener("click",acciones.imprimir);cerrar.addEventListener("click",acciones.cerrar);
 barra.append(imprimir,cerrar,aviso);
 const hoja=e("main",undefined,"documento");
 const cab=e("header",undefined,"cabecera-documento"),ident=e("div",undefined,"identidad-documento"),logo=e("img");logo.src=origen+"/images/logo.png";logo.alt="";logo.width=64;logo.height=64;
 const marca=e("div");marca.append(e("strong","Lapazimpresion3d"),e("p","La Paz, Baja California Sur"),e("p","lapazimpresion3d.com · WhatsApp 612 199 2396"));ident.append(logo,marca);
 const folio=e("div",undefined,"folio-documento");folio.append(e("h1","Cotización"),e("p",m.folio),e("p","Versión "+m.version+" · "+m.fecha),e("p",m.aceptada?"Aceptada el "+m.fechaAceptacion:"Propuesta para revisión","estado-documento"));cab.append(ident,folio);hoja.append(cab);
 function datos(t,pares){const sec=e("section",undefined,"datos-documento");sec.append(e("h2",t));const dl=e("dl");for(const [k,v] of pares){if(v){dl.append(e("dt",k),e("dd",v));}}sec.append(dl);return sec;}
 hoja.append(datos("Datos del cliente",[["Cliente",m.cliente],["Negocio / proyecto",m.negocio],["WhatsApp",m.telefono],["Solución",m.paquete]]));
 const alcance=e("section",undefined,"alcance-documento");alcance.append(e("h2","Alcance de la propuesta"),e("p",m.alcance,"texto-alcance"));hoja.append(alcance);
 function tabla(t,filas){const sec=e("section",undefined,"tabla-documento");sec.append(e("h2",t));const table=e("table"),thead=e("thead"),tr=e("tr");for(const k of ["Concepto","Importe MXN"]){const th=e("th",k);th.scope="col";tr.append(th);}thead.append(tr);table.append(thead);const body=e("tbody");
 for(const [k,n,total] of filas){const row=e("tr",undefined,total?"total-documento":undefined);const th=e("th",k);th.scope="row";row.append(th,e("td",dinero(n)));body.append(row);}
 table.append(body);sec.append(table);return sec;}
 hoja.append(tabla("Inversión inicial",[...m.conceptos,...(m.rebajaInicial?[["Descuento especial",-m.rebajaInicial]]:[]),["Subtotal",m.subtotal],["IVA 16%",m.iva],["Total inicial",m.total,true]]));
 if(m.mensualidad>0)hoja.append(tabla("Servicio mensual (independiente de la inversión inicial)",[...(m.rebajaMensual?[["Mensualidad antes de descuento",m.mensualidadBruta],["Descuento especial",-m.rebajaMensual]]:[]),["Mensualidad antes de IVA",m.mensualidad],["IVA 16%",m.ivaMensual],["Total mensual",m.totalMensual,true]]));
 if(m.aceptada)hoja.append(tabla("Resumen de pagos iniciales registrados",[["Total inicial",m.total],["Pagos recibidos",m.pagado],["Saldo pendiente",m.saldo,true]]));
 const condiciones=e("section",undefined,"condiciones-documento");condiciones.append(e("h2","Condiciones comerciales"));const ul=e("ul");for(const v of m.condiciones)ul.append(e("li",v));condiciones.append(ul);hoja.append(condiciones);
 hoja.append(e("footer","Documento comercial · No es factura fiscal (CFDI).","pie-documento"));
 doc.body.replaceChildren(barra,hoja);
 css.addEventListener("load",async()=>{try{await logo.decode();}catch{}imprimir.disabled=false;},{once:true});
 css.addEventListener("error",()=>{aviso.textContent="No fue posible cargar el diseño de impresión. Cierra la vista y vuelve a abrirla.";},{once:true});
 doc.head.append(css);
 return hoja;
}
const api=Object.freeze({modelo,pintar,dinero});
if(typeof module==="object"&&module.exports)module.exports=api;else root.LP_COTIZACION_DOCUMENTO=api;
})(globalThis);
