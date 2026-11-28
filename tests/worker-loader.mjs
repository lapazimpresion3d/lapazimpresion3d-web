// Test-only shim: supports imports, does not emulate Cloudflare runtime.
export async function resolve(specifier,context,nextResolve){
 if(specifier==="cloudflare:workers")return {url:"data:text/javascript,export class WorkerEntrypoint {}",shortCircuit:true};
 return nextResolve(specifier,context);
}
