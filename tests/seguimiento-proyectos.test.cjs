const test=require("node:test"),assert=require("node:assert/strict");
const {etapas,estadoEtapa}=require("../public/js/seguimiento.js");
test("Etapas físicas y digitales independientes",()=>{assert.equal(etapas.fisica.length,6);assert.equal(etapas.web.length,7);assert.equal(etapas.fisica[3],"Fabricación");assert.equal(etapas.web[5],"Publicación");});
test("No se infieren etapas anteriores",()=>{const s={actual:3,completadas:[0]};assert.equal(estadoEtapa(s,0),"Completada");assert.equal(estadoEtapa(s,1),"Pendiente");assert.equal(estadoEtapa(s,3),"En proceso");});
