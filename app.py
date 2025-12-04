from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
import PyPDF2
import pytesseract
import spacy
import camelot
import pandas as pd
from pdf2image import convert_from_bytes
from io import BytesIO
from langdetect import detect
import logging
import datetime

nlp = spacy.load("en_core_web_sm")

app = FastAPI(title="Intelligent PDF Reader Agent", version="2.0")

logging.basicConfig(filename="pdf_agent.log", level=logging.INFO)


# ------------------------
# CLEAN TEXT FUNCTION
# ------------------------

def clean_text(text: str):
    return " ".join(text.replace("\n", " ").split())


# ------------------------
# KEYWORD DETECTION
# ------------------------

IMPORTANT_KEYWORDS = [
    "cable", "wire", "voltage", "standard",
    "certification", "test", "quantity",
    "length", "specification"
]


def detect_keywords(text):
    found = []
    for k in IMPORTANT_KEYWORDS:
        if k.lower() in text.lower():
            found.append(k)
    return found


# ------------------------
# ENTITY EXTRACTION
# ------------------------

def extract_entities(text):
    doc = nlp(text)
    result = {}
    for ent in doc.ents:
        if ent.label_ not in result:
            result[ent.label_] = []
        result[ent.label_].append(ent.text)
    return result


# ------------------------
# SECTION DETECTION (Basic)
# ------------------------

HEADERS = ["scope", "requirement", "specification", "delivery", "price", "testing"]

def detect_sections(text):
    sections = {}
    lines = text.split("\n")

    current = "General"
    sections[current] = ""

    for line in lines:
        line_lower = line.lower()
        if any(h in line_lower for h in HEADERS):
            current = line.strip()
            sections[current] = ""
        else:
            sections[current] += " " + line

    return sections


# ------------------------
# OCR FOR SCANNED PDF
# ------------------------

def run_ocr(file_bytes):
    images = convert_from_bytes(file_bytes)
    text = ""
    for img in images:
        text += pytesseract.image_to_string(img)
    return text


# ------------------------
# TABLE EXTRACTION
# ------------------------

def extract_tables(file_bytes):
    with open("temp.pdf", "wb") as f:
        f.write(file_bytes)

    tables = camelot.read_pdf("temp.pdf", pages="all")
    extracted_tables = []

    for table in tables:
        df = table.df
        extracted_tables.append(df.to_dict())

    return extracted_tables


# ------------------------
# MAIN ENDPOINT
# ------------------------

@app.post("/extract-text")
async def extract_text(file: UploadFile = File(...)):
    try:
        if not file.filename.endswith(".pdf"):
            return JSONResponse({"error": "Invalid file type"}, status_code=400)

        raw = await file.read()
        reader = PyPDF2.PdfReader(BytesIO(raw))

        full_text = ""

        for page in reader.pages:
            if page.extract_text():
                full_text += page.extract_text()

        # If no text -> use OCR
        used_ocr = False
        if not full_text.strip():
            full_text = run_ocr(raw)
            used_ocr = True

        cleaned = clean_text(full_text)

        # Advanced analysis
        language = detect(cleaned)
        entities = extract_entities(cleaned[:4000])
        keywords = detect_keywords(cleaned)
        sections = detect_sections(cleaned)
        tables = extract_tables(raw)

        # Logging
        logging.info(f"{datetime.datetime.now()} | {file.filename} | OCR:{used_ocr}")

        return {
            "status": "success",
            "filename": file.filename,
            "usedOCR": used_ocr,
            "language": language,
            "keywords": keywords,
            "entities": entities,
            "sections": sections,
            "tables": tables,
            "text": cleaned
        }

    except Exception as e:
        logging.error(str(e))
        return JSONResponse({"error": str(e)}, status_code=500)
