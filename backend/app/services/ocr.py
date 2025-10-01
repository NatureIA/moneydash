import json, cv2, pytesseract, re
from typing import Dict, Any
from ..config import settings
from datetime import datetime

def preprocess_image(path: str) -> str | None:
    img = cv2.imread(path)
    if img is None: return None
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    gray = cv2.bilateralFilter(gray, 11, 17, 17)
    thr = cv2.adaptiveThreshold(gray,255,cv2.ADAPTIVE_THRESH_GAUSSIAN_C, cv2.THRESH_BINARY,31,2)
    tmp = path + ".prep.png"; cv2.imwrite(tmp, thr); return tmp

def parse_brazilian_receipt(text: str) -> Dict[str, Any]:
    cnpj = re.search(r"\b(\d{2}\.?\d{3}\.?\d{3}/?\d{4}-?\d{2})\b", text)
    total = None
    tot = re.search(r"TOTAL(?:\s*R?\$?)?\s*([0-9]+[.,][0-9]{2})", text, re.IGNORECASE)
    if tot: total = float(tot.group(1).replace(".","").replace(",", "."))
    else:
        vals = [float(x.replace(".","").replace(",", ".")) for x in re.findall(r"\b\d{1,6}[.,]\d{2}\b", text)]
        if vals: total = max(vals)
    dt = None
    mdt = re.search(r"\b(\d{2}/\d{2}/\d{4})\b", text)
    if mdt:
        try: dt = datetime.strptime(mdt.group(1), "%d/%m/%Y").date().isoformat()
        except: dt = None
    vendor = None
    lines = [l.strip() for l in text.splitlines() if l.strip()]
    if lines:
        cand = lines[0]
        vendor = cand.title() if len(cand) <= 60 else None
    return {"vendor": vendor, "cnpj": cnpj.group(1) if cnpj else None, "date": dt, "total": total, "raw_text_snippet": text[:1000]}

def run_ocr(path: str) -> Dict[str, Any]:
    prep = preprocess_image(path)
    img_path = prep or path
    text = pytesseract.image_to_string(img_path, lang=settings.OCR_LANG)
    return parse_brazilian_receipt(text)
