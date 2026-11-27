"""Aperçu SVG approximatif d'un fichier .excalidraw (pour contrôler la mise en page) + détection des chevauchements."""
import json, sys, html, os
src, out = sys.argv[1], sys.argv[2]
els = json.load(open(src))["elements"]
xs=[e["x"] for e in els]+[e["x"]+e["width"] for e in els]; ys=[e["y"] for e in els]+[e["y"]+e["height"] for e in els]
minx,miny,maxx,maxy=min(xs)-40,min(ys)-40,max(xs)+40,max(ys)+40
p=[f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{minx} {miny} {maxx-minx} {maxy-miny}" width="{(maxx-minx)/2:.0f}" height="{(maxy-miny)/2:.0f}"><rect x="{minx}" y="{miny}" width="{maxx-minx}" height="{maxy-miny}" fill="white"/>']
for e in els:
    if e["type"]=="rectangle":
        p.append(f'<rect x="{e["x"]}" y="{e["y"]}" width="{e["width"]}" height="{e["height"]}" rx="10" fill="{e["backgroundColor"] if e["backgroundColor"]!="transparent" else "none"}" stroke="#1e1e1e" stroke-dasharray="{"6,4" if e["strokeStyle"]=="dashed" else ""}"/>')
    elif e["type"] in ("line","arrow"):
        pts=" ".join(f'{e["x"]+a},{e["y"]+b}' for a,b in e["points"])
        p.append(f'<polyline points="{pts}" fill="none" stroke="#1e1e1e" stroke-dasharray="{"6,4" if e["strokeStyle"]=="dashed" else ""}"/>')
        if e["type"]=="arrow":
            (x0,y0),(x1,y1)=e["points"][0],e["points"][-1]
            if e.get("endArrowhead"): p.append(f'<circle cx="{e["x"]+x1}" cy="{e["y"]+y1}" r="5" fill="#1e1e1e"/>')
            if e.get("startArrowhead"): p.append(f'<rect x="{e["x"]+x0-6}" y="{e["y"]+y0-6}" width="12" height="12" fill="{"#1e1e1e" if e["startArrowhead"]=="diamond" else "white"}" stroke="#1e1e1e" transform="rotate(45 {e["x"]+x0} {e["y"]+y0})"/>')
for e in els:
    if e["type"]=="text":
        fam="monospace" if e["fontFamily"]==3 else "Comic Sans MS, cursive"
        lines=e["text"].split("\n")
        anchor={"left":"start","center":"middle"}[e["textAlign"]]
        x=e["x"] if anchor=="start" else e["x"]+e["width"]/2
        for i,l in enumerate(lines):
            bg='' 
            p.append(f'<text x="{x}" y="{e["y"]+(i+0.85)*e["fontSize"]*1.25}" font-size="{e["fontSize"]}" font-family="{fam}" text-anchor="{anchor}" fill="{e["strokeColor"]}">{html.escape(l)}</text>')
p.append("</svg>")
open(out,"w").write("\n".join(p))
# chevauchements entre rectangles de classes
rects=[e for e in els if e["type"]=="rectangle"]
def ov(a,b,m=8): return not (a["x"]+a["width"]+m<=b["x"] or b["x"]+b["width"]+m<=a["x"] or a["y"]+a["height"]+m<=b["y"] or b["y"]+b["height"]+m<=a["y"])
name=lambda r: next((t["text"].split("\n")[-1] for t in els if t["type"]=="text" and t["groupIds"]==r["groupIds"] and r["groupIds"] and t["fontFamily"]==1), "note")
bad=[(name(a),name(b)) for i,a in enumerate(rects) for b in rects[i+1:] if ov(a,b)]
# étiquettes d'arrêtes qui recouvrent une classe
labels=[t for t in els if t["type"]=="text" and t.get("containerId")]
hits=[(t["text"].split("\n")[0], name(r)) for t in labels for r in rects if ov(t,r,0)]
print(os.path.basename(src), "chevauchements classes:", bad, "| étiquettes sur une classe:", hits)
