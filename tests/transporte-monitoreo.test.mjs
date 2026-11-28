import assert from "node:assert/strict";
import {ipv4Publica,destinoValido,comprobar} from "../scripts/transporte-monitoreo.mjs";
for(const ip of ["127.0.0.1","10.0.0.1","169.254.169.254","192.168.1.1","100.64.0.1","172.16.0.1","198.18.0.1","203.0.113.1","::1","224.1.1.1"])assert.equal(ipv4Publica(ip),false);
assert.equal(ipv4Publica("8.8.8.8"),true);
const s="https://cliente.example.com/",lista=[s];
assert(destinoValido(s,lista));assert(!destinoValido(s+"?x=1",lista));assert(!destinoValido("https://otro.example.com/",lista));
let called=false;
const r=await comprobar(s,lista,{resolver:async()=>[{address:"127.0.0.1",family:4}],https:()=>{called=true;throw Error("unexpected");}});
assert.equal(r.ok,false);assert.equal(called,false);
