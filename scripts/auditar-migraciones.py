"""Local SQLite audit; no network or remote database access."""
import sqlite3
from pathlib import Path
import re

ROOT=Path(__file__).resolve().parents[1]
def main():
    files=sorted((ROOT/"migrations").glob("*.sql"))
    nums=[int(p.name.split("_")[0]) for p in files]
    assert nums==list(range(1,30)), f"Secuencia inesperada: {nums}"
    db=sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys=ON")
    for p in files:
        try:
            db.executescript(p.read_text(encoding="utf-8-sig"))
            assert not db.execute("PRAGMA foreign_key_check").fetchall()
        except Exception as e:
            raise RuntimeError(f"Migración {p.name}: {e}") from e
        print("OK",p.name)
    assert db.execute("PRAGMA integrity_check").fetchall()==[("ok",)]
    for t in ("servicio_informes_mensuales","servicio_retencion_copias","servicio_recuperaciones","servicio_reconciliaciones_respaldos"):
        assert db.execute("SELECT 1 FROM sqlite_master WHERE type='table' AND name=?",(t,)).fetchone(),t
    # Prepare literal SQL from the Worker, without executing mutations.
    source=(ROOT/"src/index.js").read_text(encoding="utf-8")
    import json
    passed=0
    failures=[]
    for m in re.finditer(r'\.prepare\(("(?:[^"\\]|\\.)*")\s*\)',source):
        sql=json.loads(m.group(1))
        if not re.match(r"\s*(SELECT|WITH|INSERT|UPDATE|DELETE|PRAGMA)\b",sql,re.I): continue
        try:
            # SQLite reports parameter count even if numbered placeholders are reused.
            try: db.execute("EXPLAIN "+sql)
            except sqlite3.ProgrammingError as e:
                n=re.search(r"uses (\d+)",str(e))
                if not n: raise
                db.execute("EXPLAIN "+sql,[None]*int(n.group(1)))
            passed+=1
        except sqlite3.Error as e:
            failures.append((source.count("\n",0,m.start())+1,str(e),sql[:160]))
    for row in failures: print("ERROR SQL",*row)
    print(f"Migraciones: {len(files)}; SQL literal preparado: {passed}; errores: {len(failures)}")
    print("No cubre SQL dinámico, semántica de datos, RPC, R2 ni D1 remoto.")
    if failures: raise SystemExit(1)
if __name__=="__main__": main()
