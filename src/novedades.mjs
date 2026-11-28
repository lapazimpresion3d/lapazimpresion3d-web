export function novedadValida(d){
 const txt=(v,min,max)=>typeof v==="string"&&v.trim().length>=min&&v.length<=max;
 return !!d&&d.confirmar==="PUBLICAR"&&txt(d.titulo,3,120)&&txt(d.resumen,3,2000);
}
export function proyectarNovedad(q){return {id:q.id,titulo:q.titulo,resumen:q.resumen,categoria:q.categoria,fecha_aplicacion:q.fecha_aplicacion,fecha_publicacion:q.fecha_publicacion};}
