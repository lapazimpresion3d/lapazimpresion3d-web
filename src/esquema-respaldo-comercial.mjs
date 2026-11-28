// Explicit projection from inspected commercial schemas. No arbitrary SQL from caller.
export const FORMATO_AMPLIADO="lapaz-comercio-respaldo-v2";
export const ESPECIFICACION=Object.freeze([
  {
    "nombre": "empresa",
    "campos": [
      "id",
      "nombre",
      "activa"
    ],
    "tabla": "empresas",
    "condicion": "id=?"
  },
  {
    "nombre": "perfil",
    "campos": [
      "empresa",
      "giro",
      "nombre_publico",
      "descripcion",
      "lema",
      "color",
      "color_secundario",
      "color_acento",
      "color_fondo",
      "color_texto",
      "logotipo",
      "portada",
      "zona_horaria",
      "horario_semanal",
      "excepciones_horario",
      "presentacion",
      "revision"
    ],
    "tabla": "comercio_perfiles_privados",
    "condicion": "empresa=?"
  },
  {
    "nombre": "sucursales",
    "campos": [
      "empresa",
      "id",
      "nombre",
      "activa",
      "revision",
      "horario"
    ],
    "tabla": "sucursales",
    "condicion": "empresa=? ORDER BY id"
  },
  {
    "nombre": "principal",
    "campos": [
      "empresa",
      "sucursal",
      "revision"
    ],
    "tabla": "comercio_sucursal_principal",
    "condicion": "empresa=?"
  },
  {
    "nombre": "personal",
    "campos": [
      "empresa",
      "id",
      "codigo",
      "nombre",
      "puesto",
      "especialidad",
      "incorporacion",
      "activo",
      "revision"
    ],
    "tabla": "comercio_empleados",
    "condicion": "empresa=? ORDER BY id"
  },
  {
    "nombre": "servicios",
    "campos": [
      "empresa",
      "id",
      "codigo",
      "nombre",
      "activo",
      "revision"
    ],
    "tabla": "comercio_servicios_personal",
    "condicion": "empresa=? ORDER BY id"
  },
  {
    "nombre": "asignaciones",
    "campos": [
      "empresa",
      "empleado",
      "revision",
      "principal",
      "sucursales",
      "servicios",
      "fecha"
    ],
    "tabla": "comercio_asignaciones_personal",
    "condicion": "empresa=? ORDER BY empleado,revision"
  },
  {
    "nombre": "turnos",
    "campos": [
      "empresa",
      "empleado",
      "revision",
      "turnos",
      "fecha"
    ],
    "tabla": "comercio_turnos_laborales",
    "condicion": "empresa=? ORDER BY empleado,revision"
  },
  {
    "nombre": "recursos",
    "campos": [
      "empresa",
      "id",
      "sucursal",
      "codigo",
      "nombre",
      "tipo",
      "activo",
      "revision",
      "horario",
      "servicios"
    ],
    "tabla": "comercio_recursos_laborales",
    "condicion": "empresa=? ORDER BY id"
  },
  {
    "nombre": "roles",
    "campos": [
      "empresa",
      "id",
      "nombre"
    ],
    "tabla": "roles",
    "condicion": "empresa=? ORDER BY id"
  },
  {
    "nombre": "permisos",
    "campos": [
      "empresa",
      "rol",
      "permiso"
    ],
    "tabla": "rol_permisos",
    "condicion": "empresa=? ORDER BY rol,permiso"
  },
  {
    "nombre": "contrato",
    "campos": [
      "empresa",
      "plan",
      "version",
      "fecha"
    ],
    "tabla": "comercial_contratos_iniciales",
    "condicion": "empresa=?"
  },
  {
    "nombre": "suscripcion",
    "campos": [
      "empresa",
      "plan",
      "version",
      "estado",
      "inicio",
      "vence",
      "revision"
    ],
    "tabla": "comercial_suscripciones",
    "condicion": "empresa=?"
  },
  {
    "nombre": "historial_contractual",
    "campos": [
      "empresa",
      "revision",
      "plan",
      "version",
      "estado",
      "inicio",
      "vence",
      "fecha"
    ],
    "tabla": "comercial_suscripcion_historial",
    "condicion": "empresa=? ORDER BY revision"
  },
  {
    "nombre": "activacion",
    "campos": [
      "empresa",
      "revision",
      "modulos",
      "fecha"
    ],
    "tabla": "comercial_activaciones",
    "condicion": "empresa=?"
  },
  {
    "nombre": "ciclo",
    "campos": [
      "empresa",
      "revision",
      "anterior",
      "posterior",
      "accion",
      "fecha"
    ],
    "tabla": "comercial_ciclo_vida",
    "condicion": "empresa=? ORDER BY revision"
  },
  {
    "nombre": "finanzas",
    "campos": [
      "empresa",
      "sucursal",
      "id",
      "fecha",
      "tipo",
      "importe",
      "metodo",
      "original"
    ],
    "tabla": "comercio_movimientos_financieros",
    "condicion": "empresa=? ORDER BY fecha,id"
  },
  {
    "nombre": "membresias",
    "campos": [
      "empresa",
      "usuario",
      "rol",
      "activa",
      "alcance"
    ],
    "tabla": "membresias",
    "condicion": "empresa=? ORDER BY usuario"
  },
  {
    "nombre": "asignaciones_membresia",
    "campos": [
      "empresa",
      "usuario",
      "sucursal"
    ],
    "tabla": "membresia_sucursales",
    "condicion": "empresa=? ORDER BY usuario,sucursal"
  },
  {
    "nombre": "restricciones",
    "campos": [
      "empresa",
      "usuario",
      "permiso"
    ],
    "tabla": "membresia_permisos_denegados",
    "condicion": "empresa=? ORDER BY usuario,permiso"
  }
]);
export function validarDatosAmpliados(p,empresa){
 if(!p||p.formato!==FORMATO_AMPLIADO||p.empresa!==empresa||!Number.isSafeInteger(p.fecha)||p.fecha<0||!p.datos||Array.isArray(p.datos)||Object.keys(p.datos).length!==ESPECIFICACION.length)return false;
 for(const x of ESPECIFICACION){
  const rows=p.datos[x.nombre];if(!Array.isArray(rows)||rows.length>1000)return false;
  for(const r of rows){if(!r||typeof r!=="object"||Array.isArray(r)||(x.nombre==="empresa"?r.id:r.empresa)!==empresa||Object.keys(r).length!==x.campos.length||!x.campos.every(k=>Object.hasOwn(r,k)&&(r[k]===null||["string","number"].includes(typeof r[k])&&(typeof r[k]!=="number"||Number.isFinite(r[k])))))return false;}
 }
 return p.datos.empresa.length===1&&p.datos.contrato.length===1;
}
