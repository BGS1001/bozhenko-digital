"""Bring back the everyday "Magic" look after Christmas.

The Christmas Magic look (holly green, berry red, gold, snow, "Nollaig Shona")
replaced the original film-studio Magic look (electric blue, sunny yellow,
pink) on 20 Nov 2026. The original is kept two ways:

1. Git: commit e66642a on main is the whole site just before the change.
2. This script: it swaps the Christmas colours back to the original ones and
   removes the snow and the "Nollaig Shona" line, without touching anything
   else that changed since (new videos, prices, texts stay as they are).

Run from the site folder:   python3 seasonal/restore-studio-look.py
"""
import re, pathlib

ROOT = pathlib.Path(__file__).resolve().parent.parent

# Christmas colour -> original studio colour
HEX = [("12402F", "2A35E8"), ("0E211A", "120F2E"), ("E9BE5A", "FFD43B"), ("F2D07E", "FFE070"),
       ("E4646B", "FF9ACB"), ("EE8A8F", "FFB3D7"), ("CFE3D6", "C9CCFF"), ("E6EFE9", "E4E6FF"),
       ("F6C9C6", "FFD1E7"), ("C8323C", "8C7BFF"), ("FFF8EC", "FFF8F1"), ("EEF5F0", "EEF0FF")]
RGB = [("228,100,107", "255,154,203"), ("200,50,60", "140,123,255"), ("233,190,90", "255,212,59"),
       ("207,227,214", "201,204,255"), ("18,64,47", "42,53,232")]


def recolour(s):
    for a, b in HEX:
        s = re.sub("#" + a, "#" + b, s, flags=re.I)
    for a, b in RGB:
        s = s.replace(a, b)
    return s


for name in ("styles.css", "script.js", "index.html"):
    p = ROOT / name
    s = recolour(p.read_text(encoding="utf-8"))
    if name == "index.html":
        s = s.replace('<div class="snow studio-only" aria-hidden="true"></div>\n', "")
        s = s.replace('<span class="xmas studio-only">Nollaig Shona ·</span>', "")
        s = s.replace("our Christmas studio look", "our creative studio look")
    if name == "script.js":
        s = s.replace("our Christmas studio look", "our creative studio look")
    if name == "styles.css":
        s = s.replace("an Irish Christmas film studio", "electric blue film studio")
    p.write_text(s, encoding="utf-8")

print("Done: the Magic button now switches to the original blue/yellow/pink studio look.")
