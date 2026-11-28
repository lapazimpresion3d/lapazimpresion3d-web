const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs"),vm=require("node:vm");
const {etapasDe,origenes}=require("../public/js/seguimiento.js");
const src=fs.readFileSync("src/index.js","utf8");
const ctx={};vm.createContext(ctx);vm.runInContext(src.slice(src.indexOf("const ETAPAS_SEGUIMIENTO="),src.indexOf("async function leerSeguimiento(")),ctx);
test("formatos compatibles",()=>{assert.equal(etapasDe({modalidad:"fisica"}).length,6);for(const modalidad of ["fisica","web","combinada"])assert.equal(etapasDe({modalidad,formato:"simplificado"}).length,4);});
test("recepción externa completa solo etapa inicial",()=>{const r=vm.runInContext('aplicarRecepcion({actual:0,completadas:[]},{origen:"whatsapp",observaciones:"Logo recibido"},"2026-11-28")',ctx);assert.equal(r.actual,1);assert.deepEqual(Array.from(r.completadas),[0]);assert.equal(r.recepcion.origen,"whatsapp");});
test("no retrocede proyecto avanzado",()=>{assert.equal(vm.runInContext('aplicarRecepcion({actual:3,completadas:[1]},{origen:"correo",observaciones:"Recibido"},"2026-11-28").actual',ctx),3);});
test("valida origen y observaciones",()=>{assert.equal(vm.runInContext('recepcionValida({origen:"whatsapp",observaciones:" "})',ctx),false);assert.equal(vm.runInContext('recepcionValida({origen:"whatsapp",observaciones:"Logo"})',ctx),true);assert.equal(Object.keys(origenes).length,7);});
