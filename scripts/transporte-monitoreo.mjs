// Node transport core. No listener or public endpoint. Requires an authenticated private bridge.
import {lookup} from "node:dns/promises";
import {request} from "node:https";
import {isIPv4} from "node:net";
export function ipv4Publica(ip){
 if(!isIPv4(ip))return false;
 const [a,b,c]=ip.split(".").map(Number);
 return !(a===0||a===10||a===127||a>=224||a===100&&b>=64&&b<=127||a===169&&b===254||a===172&&b>=16&&b<=31||a===192&&(b===168||b===0||b===88&&c===99)||a===198&&(b===18||b===19||b===51&&c===100)||a===203&&b===0&&c===113);
}
export function destinoValido(s,lista){
 if(typeof s!=="string"||s.length>500||!Array.isArray(lista)||lista.length>100||!lista.includes(s))return false;
 try{const u=new URL(s);return u.href===s&&u.protocol==="https:"&&!u.username&&!u.password&&!u.port&&!u.search&&!u.hash&&/^([a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/.test(u.hostname)&&!/\.(local|internal|localhost|test|invalid|onion|example)$/.test(u.hostname)&&/^\/[a-zA-Z0-9._~/%-]*$/.test(u.pathname);}catch{return false;}
}
export async function comprobar(sitio,lista,{resolver=lookup,https=request}={}){
 if(!destinoValido(sitio,lista))return {ok:false,error:"no_autorizado"};
 const start=Date.now(),u=new URL(sitio);let timer;
 try{
  const rs=await Promise.race([resolver(u.hostname,{all:true,verbatim:true}),new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error("dns")),3000);})]);clearTimeout(timer);
  // IPv4 only; reject mixed or non-public answers rather than trusting a fallback.
  if(!Array.isArray(rs)||!rs.length||rs.length>32||rs.some(r=>r.family!==4||!ipv4Publica(r.address)))return {ok:false,error:"dns_no_permitido"};
  const ip=rs[0].address,restante=10000-(Date.now()-start);if(restante<=0)return {ok:false,error:"no_disponible"};
  return await new Promise(resolve=>{
   let done=false,t,req;
   const finish=(r)=>{if(done)return;done=true;clearTimeout(t);resolve(r);};
   const resultado=codigo=>({ok:true,codigo,ms:Math.min(10000,Math.max(0,Date.now()-start))});
   // Connect to the validated IP itself; TLS SNI and certificate verification remain on original hostname.
   req=https({hostname:ip,port:443,servername:u.hostname,method:"GET",path:u.pathname,agent:false,rejectUnauthorized:true,headers:{Host:u.hostname,"User-Agent":"Lapazimpresion3d-Monitor/1","Accept":"text/html,*/*;q=0.1","Connection":"close"}},res=>{finish(resultado(res.statusCode));res.destroy();});
   req.on("error",e=>{const observados=["ECONNREFUSED","ECONNRESET","ETIMEDOUT","EHOSTUNREACH","ENETUNREACH","CERT_HAS_EXPIRED","ERR_TLS_CERT_ALTNAME_INVALID","UNABLE_TO_VERIFY_LEAF_SIGNATURE","DEPTH_ZERO_SELF_SIGNED_CERT","SELF_SIGNED_CERT_IN_CHAIN"];finish(observados.includes(e.code)?resultado(null):{ok:false,error:"no_verificable"});});
   t=setTimeout(()=>{finish(resultado(null));req.destroy();},restante);req.end();
  });
 }catch{return {ok:false,error:"no_disponible"};}finally{clearTimeout(timer);}
}
