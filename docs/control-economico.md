# Control económico · etapa inicial

- Una propuesta económica por solicitud, editable como borrador; el administrador registra explícitamente la aceptación externa y su fecha. Al aceptar, se bloquean importes y alcance y la solicitud pasa a cotizado si no está cerrada. El flujo previo de creación de proyectos sigue disponible para registros históricos.
- Importes independientes: implementación, fabricación, extras y mensualidad; solo físico exige implementación y mensualidad cero. Todos los importes se almacenan en centavos MXN antes de IVA; IVA general fijo 16%, redondeado al centavo por subtotal inicial y mensualidad. No es un sistema de facturación fiscal.
- Pagos manuales ya recibidos, únicamente sobre total inicial con IVA. Fecha, método, referencia y UUID idempotente. El servidor impide exceder saldo mediante escritura condicional. No se cobra dinero, no se programan cargos, no se generan CFDI, no se envían propuestas automáticamente. No se registra historial mensual ni rectificaciones de pagos todavía. No editar una propuesta aceptada; futura etapa: revisiones y ajustes trazables.
- API privada bajo /api/admin/propuestas/:id/economica; autorización de administrador y mismo origen para escrituras; control de versión en borradores y aceptación. La consulta económica se abre a petición, por lo que el listado previo no depende de las nuevas tablas.
- Migración 0005 crea tablas nuevas con FK RESTRICT; verificar respaldo, pruebas locales, y migraciones pendientes antes de aplicar en producción. No ejecutar remotamente sin autorización. El panel muestra un aviso si el módulo no está disponible.

## Despliegue
`npx wrangler d1 migrations list lapazimpresion3d-quiz --remote`

Tras respaldo, prueba de D1 local y autorización: `npx wrangler d1 migrations apply lapazimpresion3d-quiz --remote`. Verificar que 0004 esté aplicada también.
