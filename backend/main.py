from fastapi import FastAPI, UploadFile, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import shutil
import os
import tempfile
from resume_parser import (
    extract_text_from_pdf,
    extract_text_from_docx,
    parse_resume_with_llm,
    empty_parsed_resume,
)

app = FastAPI(title="Resume Parser API")

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allow all origins for simplicity in this demo
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/parse-resume")
async def parse_resume(file: UploadFile = File(...)):
    if not file:
        raise HTTPException(status_code=400, detail="No file uploaded")
    
    filename = file.filename.lower()
    if not (filename.endswith(".pdf") or filename.endswith(".docx")):
        raise HTTPException(status_code=400, detail="Unsupported file type. Please upload a PDF or DOCX file.")

    # Create a temporary file to save the upload
    try:
        suffix = ".pdf" if filename.endswith(".pdf") else ".docx"
        with tempfile.NamedTemporaryFile(delete=False, suffix=suffix) as tmp_file:
            shutil.copyfileobj(file.file, tmp_file)
            tmp_file_path = tmp_file.name

        # Extract text
        text = ""
        if filename.endswith(".pdf"):
            try:
                text = extract_text_from_pdf(tmp_file_path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to extract text from PDF: {str(e)}")
        elif filename.endswith(".docx"):
            try:
                text = extract_text_from_docx(tmp_file_path)
            except Exception as e:
                raise HTTPException(status_code=500, detail=f"Failed to extract text from DOCX: {str(e)}")
        
        if not text.strip():
            # Return an empty schema if no text could be extracted
            return JSONResponse(content=empty_parsed_resume())

        # Parse with LLM
        parsed_data = parse_resume_with_llm(text)
        return JSONResponse(content=parsed_data)

    finally:
        # Clean up temporary file
        if 'tmp_file_path' in locals() and os.path.exists(tmp_file_path):
            os.remove(tmp_file_path)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000) 


