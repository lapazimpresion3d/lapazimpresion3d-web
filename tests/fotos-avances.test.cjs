const test=require("node:test"),assert=require("node:assert/strict"),fs=require("node:fs");
const src=fs.readFileSync("src/index.js","utf8"),sql=fs.readFileSync("migrations/0009_fotos_avances.sql","utf8");
test("Fotos privadas separadas y limitadas",()=>{assert.match(sql,/REFERENCES proyectos_cliente/);assert.ok(src.includes('imagenAvance(env,p.id,fotoAvanceCliente[1])'));assert.ok(src.includes('WHERE proyecto_id=?1 AND id=?2'));assert.ok(src.includes('RETURNING proyecto_id,id'));assert.ok(src.includes('imagenReal(bytes,archivo.type)'));});
