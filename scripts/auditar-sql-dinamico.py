"""Prepare selected dynamic SQL variants; never execute writes."""
import json,re,sqlite3
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
LIT=r'"(?:[^"\\]|\\.)*"'
def preparar(db,sql):
    try: db.execute("EXPLAIN "+sql)
    except sqlite3.ProgrammingError as e:
        n=re.search(r"uses (\d+)",str(e))
        if not n: raise
        db.execute("EXPLAIN "+sql,[None]*int(n.group(1)))
def decodificar(s):
    # JS double-quoted literals also allow an escaped apostrophe, unlike JSON.
    return json.loads(re.sub(r"(?<!\\)\\'", "'", s))
def constante(text,name):
    m=re.search(r"\bconst "+name+r"=("+LIT+r");",text)
    if not m: raise ValueError("Constante ausente: "+name)
    return decodificar(m[1])
def concatenar(expr,variables):
    # Restricted grammar, no evaluation of JavaScript.
    tokens=re.findall(LIT+r"|[A-Za-z_]\w*|\+",expr)
    if re.sub(r"\s+","",expr)!=re.sub(r"\s+","","".join(tokens)) or len(tokens)%2!=1 or any(x!="+" for x in tokens[1::2]): raise ValueError(expr)
    return "".join(decodificar(x) if x.startswith('"') else variables[x] for x in tokens[::2])
def variantes(text,variables,required,casos,label):
    count=0
    for i,line in enumerate(text.splitlines(),1):
        for m in re.finditer(r"\.prepare\((.*?)\)\.(?:bind|all|first|run)\(",line):
            expr=m[1]
            tokens=re.sub(LIT,"",expr)
            if not any(re.search(r"\b"+k+r"\b",tokens) for k in required): continue
            casos.append((f"{label}:{i}",concatenar(expr,variables)));count+=1
    return count
def main():
    db=sqlite3.connect(":memory:")
    db.execute("PRAGMA foreign_keys=ON")
    for p in sorted((ROOT/"migrations").glob("*.sql")): db.executescript(p.read_text(encoding="utf-8-sig"))
    src=(ROOT/"src/index.js").read_text(encoding="utf8")
    rpc=(ROOT/"src/integracion-comercial.mjs").read_text(encoding="utf8")
    casos=[]
    for tabla,filtro,cols in [("servicio_costos","","0 AS version,'original' AS accion"),("servicio_costos_vigentes"," AND accion<>'anular'","version,accion")]:
        patron=r'\(conCorrecciones\?"version,accion":'+LIT+r'\)'
        text,n=re.subn(patron,lambda _:json.dumps(cols),src)
        assert n==1, "Expresión de columnas de costos no encontrada"
        assert variantes(text,{"tablaCostos":tabla,"filtroCosto":filtro},["tablaCostos"],casos,tabla)==4
    g=constante(rpc,"guardiaVinculo")
    j=constante(rpc,"joinsTicket")
    col=constante(rpc,"columnasSoporte")
    gt="c.vinculo_id=?3 AND c.soporte_id=?4 AND v.id=c.vinculo_id AND v.propuesta_id=t.propuesta_id AND "+g
    assert variantes(rpc,{"guardiaVinculo":g,"guardiaTicket":gt,"joinsTicket":j,"columnasSoporte":col},["guardiaVinculo","guardiaTicket","joinsTicket","columnasSoporte"],casos,"RPC")>=20
    guardia="EXISTS(SELECT 1 FROM quiz_propuestas WHERE id=?1 AND "+constante(src,"desbloqueada")+")"
    for m in re.finditer(r'\bborrar\(('+LIT+r'),('+LIT+r')\)',src):
        casos.append(("borrado "+m[1],"DELETE FROM "+json.loads(m[1])+" WHERE "+json.loads(m[2])+" AND "+guardia))
    assert len(casos)>20
    failures=[]
    for label,sql in casos:
        try: preparar(db,sql)
        except sqlite3.Error as e: failures.append((label,str(e),sql[:200]))
    for row in failures: print("ERROR",*row)
    print(f"SQL dinámico seleccionado: {len(casos)}; errores: {len(failures)}")
    print("Cobertura parcial: rentabilidad, RPC y borrado literal. No ejecuta mutaciones ni cubre todas las ramas.")
    if failures: raise SystemExit(1)
if __name__=="__main__": main()
