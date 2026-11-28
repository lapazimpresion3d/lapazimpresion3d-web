"""Prueba de regresión en SQLite aislado; nunca accede a D1 remoto."""
import json
import sqlite3
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
db = sqlite3.connect(":memory:")
db.execute("PRAGMA foreign_keys=ON")
for filename in ("0003_propuestas.sql", "0005_control_economico.sql"):
    db.executescript((ROOT/"migrations"/filename).read_text(encoding="utf-8-sig"))
for pid in ("hist", "draft"):
    db.execute("INSERT INTO quiz_propuestas(id,folio,fecha,nombre,telefono,servicio_id,ficha_json) VALUES (?,?,?,?,?,?,?)",
               (pid,pid,"2026-11-28","Prueba","0000000000","WEB","{}"))
db.execute("INSERT INTO propuestas_economicas(propuesta_id,paquete,alcance,implementacion,fabricacion,extras,mensualidad,total_inicial,total_mensual,fecha_actualizacion,fecha_aceptacion) VALUES ('hist','presencia-digital','Prueba',75000,0,0,14900,87000,17284,'2026-11-28','2026-11-28')")
original = db.execute("SELECT * FROM propuestas_economicas WHERE propuesta_id='hist'").fetchone()
db.executescript((ROOT/"migrations"/"0030_descuentos_propuestas.sql").read_text(encoding="utf-8-sig"))
assert db.execute("SELECT * FROM propuestas_economicas WHERE propuesta_id='hist'").fetchone() == original + ("{}",)
detalle = json.dumps({"version":1,"bruto":{"implementacion":250000,"fabricacion":10000,"extras":0,"mensualidad":34900},"inicial":1000,"mensual":500,"motivo":"Prueba"})
args = ("draft","gestion-comercial","Prueba",225000,9000,0,33155,271440,38460,"2026-11-28",detalle)
insert = "INSERT INTO propuestas_economicas(propuesta_id,paquete,alcance,implementacion,fabricacion,extras,mensualidad,total_inicial,total_mensual,fecha_actualizacion,descuento_json) VALUES (?1,?2,?3,?4,?5,?6,?7,?8,?9,?10,?11) ON CONFLICT(propuesta_id) DO NOTHING"
update = "UPDATE propuestas_economicas SET paquete=?2,alcance=?3,implementacion=?4,fabricacion=?5,extras=?6,mensualidad=?7,total_inicial=?8,total_mensual=?9,fecha_actualizacion=?10,version=version+1,descuento_json=?12 WHERE propuesta_id=?1 AND version=?11 AND fecha_aceptacion IS NULL"
source = (ROOT/"src/index.js").read_text(encoding="utf-8")
assert insert in source and update in source
assert db.execute(insert,args).rowcount == 1
assert db.execute(insert,args).rowcount == 0
assert db.execute(update,args[:10]+(1,detalle)).rowcount == 1
assert db.execute(update,args[:10]+(1,detalle)).rowcount == 0
assert db.execute(update,("hist",)+args[1:10]+(1,detalle)).rowcount == 0
assert db.execute("SELECT * FROM propuestas_economicas WHERE propuesta_id='hist'").fetchone() == original + ("{}",)
assert db.execute("SELECT total_inicial,total_mensual,version,descuento_json FROM propuestas_economicas WHERE propuesta_id='draft'").fetchone() == (271440,38460,2,detalle)
assert db.execute("PRAGMA foreign_key_check").fetchall() == []
assert db.execute("PRAGMA integrity_check").fetchone() == ("ok",)
print("OK: migración 0030, registros históricos, descuentos, versiones concurrentes e integridad.")
