import {readdirSync,readFileSync} from "node:fs";
import {spawnSync} from "node:child_process";
import {join} from "node:path";
const archivos=readdirSync("tests").filter(x=>/\.test\.(cjs|mjs)$/.test(x)).sort();
const loader="--experimental-loader=./tests/worker-loader.mjs";
let correctas=0;const fallidas=[];
for(const a of archivos){
 const r=spawnSync(process.execPath,[loader,"--test",join("tests",a)],{encoding:"utf8",timeout:60000});
 if(r.status===0){correctas++;console.log("OK",a);}
 else{fallidas.push(a);console.log("ERROR",a);console.log(r.stdout||"");console.log(r.stderr||"");if(r.error)console.log(String(r.error));}
}
console.log("Archivos de pruebas JavaScript:",archivos.length,"correctos:",correctas,"fallidos:",fallidas.length);
console.log("No equivale a ejecución real de Workers, navegador, D1 ni R2.");
if(fallidas.length)process.exitCode=1;
