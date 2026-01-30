import os
import json
import re
import pdfplumber
import docx
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.prompts import PromptTemplate
from dotenv import load_dotenv
try:
    import fitz  # PyMuPDF
except Exception:
    fitz = None

# Load environment variables
load_dotenv()

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF using pdfplumber first, then PyMuPDF as fallback, with normalization."""
    text = ""
    try:
        with pdfplumber.open(file_path) as pdf:
            for page in pdf.pages:
                extracted = page.extract_text()
                if extracted:
                    text += extracted + "\n"
    except Exception:
        pass

    # Fallback to PyMuPDF if little or no text was extracted
    if (not text or len(text.strip()) < 100) and fitz is not None:
        try:
            with fitz.open(file_path) as doc:
                for page in doc:
                    text += page.get_text("text") + "\n"
        except Exception:
            pass

    return normalize_text(text)

def extract_text_from_docx(file_path: str) -> str:
    """Extracts text from a DOCX file using python-docx."""
    doc = docx.Document(file_path)
    text = []
    for paragraph in doc.paragraphs:
        text.append(paragraph.text)
    return normalize_text("\n".join(text))

def normalize_text(text: str) -> str:
    """Normalize whitespace, bullets, and hyphenation to improve LLM parsing."""
    if not text:
        return ""
    text = re.sub(r"[•·●◦]", "- ", text)
    text = re.sub(r"\r", "\n", text)
    text = re.sub(r"[ \t]+\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text)
    text = re.sub(r"(\w)-\n(\w)", r"\1\2", text)
    return text.strip()

def empty_parsed_resume() -> dict:
    """Empty schema used when text is missing or LLM returns invalid JSON."""
    return {
        "full_name": None,
        "email": None,
        "phone_number": None,
        "location": None,
        "professional_summary": None,
        "total_years_of_experience": None,
        "technical_skills": {
            "languages": [],
            "developer_tools": [],
            "frameworks": [],
            "databases": [],
            "soft_skills": [],
            "coursework": [],
            "areas_of_interest": []
        },
        "education": [],
        "work_experience": [],
        "projects": [],
        "position_of_responsibility": [],
        "achievements": []
    }

def parse_resume_with_llm(resume_text: str) -> dict:
    """Parses resume text using LangChain and Google Gemini."""
    
    api_key = os.getenv("GOOGLE_API_KEY")
    if not api_key:
        raise ValueError("GOOGLE_API_KEY environment variable is not set.")

    # Initialize Gemini
    llm = ChatGoogleGenerativeAI(model="gemini-2.5-flash", google_api_key=api_key, temperature=0.1)

    # Detailed, structured prompt
    template = """You are a resume parsing assistant. 
    Given the raw text of a resume, extract the information accurately and return the result strictly in valid JSON format. 
    
    Extract the following structure:
    - full_name
    - email
    - phone_number
    - location
    - professional_summary
    - total_years_of_experience
    - technical_skills:
        - languages (array of strings)
        - developer_tools (array of strings)
        - frameworks (array of strings)
        - databases (array of strings)
        - soft_skills (array of strings)
        - coursework (array of strings)
        - areas_of_interest (array of strings)
    - education (array of objects with: degree, institution, year)
    - work_experience (array of objects with: job_title, company, start_date, end_date, responsibilities)
    - projects (array of objects with: title, description, technologies)
    - position_of_responsibility (array of objects with: title, organization, duration, description)
    - achievements (array of strings)
    
    Rules: 
    - Do not guess or hallucinate missing information. 
    - Use null for missing fields. 
    - Return ONLY valid JSON.
    - Do NOT use markdown formatting (no ```json or ```).
    - If a skill category is not explicitly present, infer it from the context if possible, otherwise use an empty array.
    
    Resume Text:
    {resume_text}
    """
    
    prompt = PromptTemplate(
        input_variables=["resume_text"],
        template=template,
    )

    chain = prompt | llm
    result = chain.invoke({"resume_text": resume_text or ""})
    response = result.content
    
    # Extract JSON object and strip markdown if present
    match = re.search(r"\{[\s\S]*\}", response)
    if match:
        cleaned_response = match.group(0)
    else:
        cleaned_response = response.strip()
    if cleaned_response.startswith("```json"):
        cleaned_response = cleaned_response[7:]
    elif cleaned_response.startswith("```"):
        cleaned_response = cleaned_response[3:]
    if cleaned_response.endswith("```"):
        cleaned_response = cleaned_response[:-3]
    cleaned_response = cleaned_response.strip()
    
    try:
        parsed_json = json.loads(cleaned_response)
        return parsed_json
    except json.JSONDecodeError:
        return empty_parsed_resume()

