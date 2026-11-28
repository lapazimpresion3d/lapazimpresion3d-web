# Descuentos especiales por cliente
Panel privado > Solicitudes > Propuesta económica y pagos. Descuentos porcentuales independientes para el subtotal inicial (todos sus conceptos) y mensualidad, antes del IVA. El motivo es interno y no sale en la cotización. El descuento mensual afecta la tarifa acordada de todos los periodos futuros, no es una promoción temporal. El inicial se reparte proporcionalmente entre conceptos en centavos; el servidor calcula los netos y mantiene los totales originales coherentes con D1. No se cambia una propuesta aceptada, un pago ni una suscripción existente. Los descuentos se guardan por propuesta, no como regla permanente por teléfono. El registro manual de una propuesta ya aceptada conserva su flujo sin descuentos explícitos: para desglose, crear solicitud sin aceptar, preparar borrador y registrar aceptación. Aplicar migración 0030 tras respaldo y prueba; sin ella los borradores normales continúan funcionando, descuentos devuelven aviso. No se ejecutan cobros. Pruebas locales requeridas antes de publicar.

## Despliegue seguro
Desde el directorio del repositorio actualizado, con Wrangler autenticado y permisos D1:
1. `npx wrangler d1 migrations list lapazimpresion3d-quiz --remote` — comprobar que solo esté pendiente 0030 o revisar las demás antes de aplicar.
2. `npx wrangler d1 export lapazimpresion3d-quiz --remote --output=respaldo-descuentos.sql` — guardar el respaldo fuera del repositorio y verificarlo.
3. `npx wrangler d1 migrations apply lapazimpresion3d-quiz --remote` — aplica todas las pendientes; no continuar si hay migraciones no revisadas.
4. `npx wrangler d1 execute lapazimpresion3d-quiz --remote --command="PRAGMA table_info(propuestas_economicas)"` — verificar descuento_json.
5. Probar desde panel con una solicitud de prueba, sin modificar importes de clientes reales. Confirmar el despliegue del Worker y los recursos estáticos.
Auditoría local: `python3 scripts/auditar-migraciones.py`, `python3 scripts/probar-descuentos.py`, `node --test tests/control-economico.test.cjs tests/cotizacion-documento.test.cjs`.
