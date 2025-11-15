import os
from pathlib import Path

try:
    from PIL import Image
except Exception as e:
    raise SystemExit("Pillow no está instalado. Ejecuta: python -m pip install pillow")

IMG_DIR = Path(__file__).resolve().parent.parent / "images"

def convert(path: Path):
    img = Image.open(path)
    base = path.with_suffix("")
    full = base.with_suffix(".webp")
    if not full.exists():
        im = img if img.mode in ("RGBA", "LA") else img.convert("RGB")
        im.save(full, format="WEBP", quality=85, method=6)
    widths = [480, 768, 1024, 1440]
    for w in widths:
        out = Path(f"{base}-{w}.webp")
        if out.exists():
            continue
        im = img.copy()
        im = im.convert("RGB")
        im.thumbnail((w, 9999), Image.Resampling.LANCZOS)
        im.save(out, format="WEBP", quality=85, method=6)

def main():
    exts = {".png", ".jpg", ".jpeg"}
    for entry in IMG_DIR.iterdir():
        if entry.is_file() and entry.suffix.lower() in exts:
            convert(entry)

if __name__ == "__main__":
    main()
