import assert from "node:assert/strict";
import {respaldosHabilitados,resultadoRespaldoValido,proximaCopia,ejecutarRespaldos} from "../src/respaldos-programados.mjs";
assert.equal(respaldosHabilitados({}),false);
assert.equal((await ejecutarRespaldos({RESPALDOS_AUTOMATICOS_HABILITADOS:"si",QUIZ_DB:{}})).habilitado,false);
assert.equal(resultadoRespaldoValido({ok:true,resultado:"correcto",referencia:"copia-01",observaciones:""}),true);
assert.equal(resultadoRespaldoValido({ok:true,resultado:"correcto",referencia:"https://privado.example/",observaciones:""}),false);
assert.equal(resultadoRespaldoValido({ok:true,resultado:"parcial",referencia:"",observaciones:"Faltan archivos"}),false);
assert.equal(proximaCopia({inicio:"2026-11-28",frecuencia_dias:7}),"2026-11-28");
assert.equal(proximaCopia({ultimo_correcto:"2026-11-28",frecuencia_dias:7}),"2026-12-05");
