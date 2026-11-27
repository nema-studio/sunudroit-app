"""
Génère les diagrammes de classes SunuDroit au format Excalidraw (.excalidraw = JSON).
Source : docs/modelisation/05-modele-domaine.md
Usage : python3 gen.py <dossier_de_sortie>
"""
import json, random, sys, os, math

random.seed(42)
OUT = sys.argv[1] if len(sys.argv) > 1 else "."

MONO = 3        # Cascadia (monospace) : attributs alignés
HAND = 1        # Virgil (manuscrit) : noms de classes, titres
CHAR_MONO = 14 * 0.6
LINE_H = 1.25

def rid():
    return ''.join(random.choice('abcdefghijklmnopqrstuvwxyz0123456789') for _ in range(20))

def base(kind, x, y, w, h, **kw):
    e = {
        "id": rid(), "type": kind, "x": x, "y": y, "width": w, "height": h, "angle": 0,
        "strokeColor": "#1e1e1e", "backgroundColor": "transparent", "fillStyle": "solid",
        "strokeWidth": 1, "strokeStyle": "solid", "roughness": 1, "opacity": 100,
        "groupIds": [], "frameId": None, "roundness": None, "seed": random.randint(1, 2**31),
        "version": 1, "versionNonce": random.randint(1, 2**31), "isDeleted": False,
        "boundElements": [], "updated": 1764000000000, "link": None, "locked": False,
    }
    e.update(kw)
    return e

def text(x, y, s, size=14, family=MONO, align="left", color="#1e1e1e", container=None, w=None):
    lines = s.split("\n")
    cw = size * (0.6 if family == MONO else 0.55)
    width = w if w else max(len(l) for l in lines) * cw + 4
    height = len(lines) * size * LINE_H
    return base("text", x, y, width, height, text=s, originalText=s, fontSize=size, fontFamily=family,
                textAlign=align, verticalAlign="top" if container is None else "middle",
                containerId=container, lineHeight=LINE_H, autoResize=True, strokeColor=color, boundElements=None)

class Diagram:
    def __init__(self, title, subtitle):
        self.els = []
        self.boxes = {}
        self.els.append(text(0, -150, title, size=36, family=HAND))
        self.els.append(text(0, -95, subtitle, size=16, family=HAND, color="#495057"))
        self.m_classes, self.m_rels, self.names, self.external = [], [], {}, set()

    def cls(self, key, name, attrs, x, y, fill, stereotype=None, min_w=0):
        """Une classe : rectangle + nom (+ stéréotype) + filet + attributs, groupés."""
        gid = rid()
        header = ([f"«{stereotype}»"] if stereotype else []) + [name]
        name_w = max(len(h) for h in header) * 20 * 0.55 + 40
        attr_w = (max((len(a) for a in attrs), default=0)) * CHAR_MONO + 32
        w = max(name_w, attr_w, 220, min_w)
        head_h = len(header) * 20 * LINE_H + 20
        body_h = max(1, len(attrs)) * 14 * LINE_H + 24
        h = head_h + body_h
        rect = base("rectangle", x, y, w, h, backgroundColor=fill, groupIds=[gid], roundness={"type": 3})
        self.els.append(rect)
        hy = y + 10
        for i, line in enumerate(header):
            size = 14 if (stereotype and i == 0) else 20
            t = text(x, hy, line, size=size, family=HAND, align="center", w=w, groupIds=None) if False else \
                text(x, hy, line, size=size, family=HAND, align="center", w=w)
            t["groupIds"] = [gid]
            self.els.append(t)
            hy += size * LINE_H
        sep = base("line", x, y + head_h, w, 0, points=[[0, 0], [w, 0]], groupIds=[gid],
                   lastCommittedPoint=None, startBinding=None, endBinding=None, startArrowhead=None, endArrowhead=None)
        self.els.append(sep)
        if attrs:
            body = text(x + 14, y + head_h + 12, "\n".join(attrs), size=14, family=MONO)
            body["groupIds"] = [gid]
            self.els.append(body)
        self.boxes[key] = rect
        self.names[key] = name
        if stereotype != "énumération":
            if attrs and attrs[0].startswith("(module"):
                self.external.add(key)
            else:
                self.m_classes.append((name, stereotype, attrs))
        return rect

    def note(self, s, x, y, w=420):
        r = base("rectangle", x, y, w, 10, backgroundColor="#fff9db", strokeStyle="dashed", roundness={"type": 3})
        t = text(x + 14, y + 12, s, size=14, family=HAND)
        r["height"] = t["height"] + 24
        r["width"] = max(w, t["width"] + 28)
        self.els += [r, t]

    def rel(self, a, b, kind, label="", ma="", mb="", wp=None, loop="right"):
        """Relation de la boîte a vers la boîte b.
        kind : composition (◆ côté a), aggregation (◇ côté a), association (→ vers b), dependency (⇢ vers b)."""
        self.m_rels.append((a, b, kind, label, ma, mb))
        A, B = self.boxes[a], self.boxes[b]
        acx, acy = A["x"] + A["width"] / 2, A["y"] + A["height"] / 2
        bcx, bcy = B["x"] + B["width"] / 2, B["y"] + B["height"] / 2
        if a == b and loop == "top":   # relation réflexive : boucle au-dessus
            sx, sy = A["x"] + A["width"] * 0.25, A["y"]
            pts = [[0, 0], [0, -60], [A["width"] * 0.4, -60], [A["width"] * 0.4, 0]]
        elif a == b:   # relation réflexive : boucle sur le côté droit
            sx, sy = A["x"] + A["width"], A["y"] + A["height"] * 0.35
            pts = [[0, 0], [70, 0], [70, A["height"] * 0.3], [0, A["height"] * 0.3]]
        elif wp:   # flèche coudée qui contourne les classes
            sx, sy = edge(A, *wp[0])
            ex, ey = edge(B, *wp[-1])
            pts = [[0, 0]] + [[px - sx, py - sy] for px, py in wp] + [[ex - sx, ey - sy]]
        else:
            sx, sy = edge(A, bcx, bcy)
            ex, ey = edge(B, acx, acy)
            pts = [[0, 0], [ex - sx, ey - sy]]
        heads = {
            "composition": ("diamond", None, "solid"),
            "aggregation": ("diamond_outline", None, "solid"),
            "association": (None, "arrow", "solid"),
            "dependency": (None, "arrow", "dashed"),
        }[kind]
        xs = [p[0] for p in pts]; ys = [p[1] for p in pts]
        arrow = base("arrow", sx, sy, max(xs) - min(xs), max(ys) - min(ys), points=pts,
                     startArrowhead=heads[0], endArrowhead=heads[1], strokeStyle=heads[2],
                     startBinding={"elementId": A["id"], "focus": 0, "gap": 4},
                     endBinding={"elementId": B["id"], "focus": 0, "gap": 4},
                     lastCommittedPoint=None, roundness={"type": 2} if a == b else None, elbowed=False)
        A["boundElements"].append({"type": "arrow", "id": arrow["id"]})
        if B is not A:
            B["boundElements"].append({"type": "arrow", "id": arrow["id"]})
        self.els.append(arrow)
        mult = f"{ma} → {mb}" if (ma or mb) else ""
        lab = "\n".join(s for s in [label, mult] if s)
        if lab:
            k = len(pts) // 2
            if a == b and loop == "top":
                mx, my = sx + A["width"] * 0.2, sy - 85
            else:
                mx = sx + (pts[k][0] + pts[k - 1][0]) / 2 if a != b else sx + 70
                my = sy + (pts[k][1] + pts[k - 1][1]) / 2 if a != b else sy + A["height"] * 0.15
            t = text(mx, my, lab, size=14, family=HAND, align="center", container=arrow["id"])
            t["x"] = mx - t["width"] / 2; t["y"] = my - t["height"] / 2
            arrow["boundElements"] = [{"type": "text", "id": t["id"]}]
            self.els.append(t)

    def legend(self, x, y):
        self.els.append(text(x, y, "Légende", size=20, family=HAND))
        items = [("composition", "composition : la partie n'existe pas sans le tout"),
                 ("aggregation", "agrégation : la partie peut exister seule"),
                 ("association", "association : référence vers une autre classe"),
                 ("dependency", "dépendance : utilise ou désigne")]
        for i, (k, lbl) in enumerate(items):
            yy = y + 40 + i * 34
            a = base("rectangle", x, yy, 1, 1, strokeColor="transparent")
            b = base("rectangle", x + 90, yy, 1, 1, strokeColor="transparent")
            self.els += [a, b]
            heads = {"composition": ("diamond", None, "solid"), "aggregation": ("diamond_outline", None, "solid"),
                     "association": (None, "arrow", "solid"), "dependency": (None, "arrow", "dashed")}[k]
            self.els.append(base("arrow", x, yy, 90, 0, points=[[0, 0], [90, 0]], startArrowhead=heads[0],
                                 endArrowhead=heads[1], strokeStyle=heads[2], startBinding=None, endBinding=None,
                                 lastCommittedPoint=None, elbowed=False))
            self.els.append(text(x + 110, yy - 9, lbl, size=14, family=HAND))
        self.els.append(text(x, y + 40 + 4 * 34 + 6, "« 1 → 1..* » : multiplicités (côté source → côté cible)", size=14, family=HAND, color="#495057"))

    def mermaid(self):
        out = ["classDiagram", "    direction LR", ""]
        for name, stereo, attrs in self.m_classes:
            out.append(f"    class {name} {{")
            if stereo:
                out.append(f"        <<{stereo}>>")
            for a in attrs:
                a = a[2:] if a.startswith("+ ") else a
                if "(" in a:                       # méthode : name() : Type
                    n, t = a.split(" : ")
                    out.append(f"        +{n} {t}")
                    continue
                n, t = a.split(" : ")
                opt = t.endswith(" [0..1]")
                t = t.replace(" [0..1]", "").replace("<", "~").replace(">", "~")
                out.append(f"        +{t} {n}" + ("  %% optional" if False else "") + (" [0..1]" if opt else ""))
            out.append("    }")
            out.append("")
        sym = {"composition": "*--", "aggregation": "o--", "association": "-->", "dependency": "..>"}
        for a, b, kind, label, ma, mb in self.m_rels:
            A, B = self.names[a], self.names[b]
            lab = f" : {label}" if label else ""
            if kind == "dependency":
                out.append(f"    {A} ..> {B}{lab}")
            else:
                out.append(f'    {A} "{ma}" {sym[kind]} "{mb}" {B}{lab}')
        return "\n".join(out)

    def save(self, name):
        # retire les rectangles techniques invisibles de la légende
        self.els = [e for e in self.els if not (e["type"] == "rectangle" and e["width"] == 1)]
        doc = {"type": "excalidraw", "version": 2, "source": "https://excalidraw.com",
               "elements": self.els, "appState": {"gridSize": None, "viewBackgroundColor": "#ffffff"}, "files": {}}
        path = os.path.join(OUT, name)
        with open(path, "w") as f:
            json.dump(doc, f, ensure_ascii=False, indent=1)
        with open(os.path.join(OUT, name.replace(".excalidraw", ".mmd")), "w") as f:
            f.write(self.mermaid() + "\n")
        return path, len(self.els)

def edge(box, tx, ty):
    """Point sur le bord du rectangle, en direction de (tx, ty)."""
    cx, cy = box["x"] + box["width"] / 2, box["y"] + box["height"] / 2
    dx, dy = tx - cx, ty - cy
    if dx == 0 and dy == 0:
        return cx, cy
    hw, hh = box["width"] / 2, box["height"] / 2
    t = min(hw / abs(dx) if dx else math.inf, hh / abs(dy) if dy else math.inf)
    return cx + dx * t, cy + dy * t

def enum_row(d, enums, x0, y0, fill="#f1f3f5", max_w=1900):
    """Range les énumérations en lignes, sous le diagramme."""
    x, y, row_h = x0, y0, 0
    for name, values in enums:
        w = max(len(name) * 11 + 40, max(len(v) for v in values) * CHAR_MONO + 32, 200)
        if x + w > x0 + max_w:
            x, y, row_h = x0, y + row_h + 40, 0
        r = d.cls("enum_" + name, name, values, x, y, fill, stereotype="énumération")
        x += r["width"] + 40
        row_h = max(row_h, r["height"])
    return y + row_h

