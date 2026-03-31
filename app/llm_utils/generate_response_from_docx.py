#from docx import Document

#from app.llm_utils.generate_response_from_LLM import generate_response_from_LLM


def extract_text_from_docx(file_path: str) -> str:
    doc = Document(file_path)
    full_text = [para.text for para in doc.paragraphs if para.text.strip()]
    return "\n".join(full_text)

async def generate_response_from_docx(file_path: str) -> str:
    docx_text = extract_text_from_docx(file_path)
    print("Text din document", docx_text)
    return await generate_response_from_LLM("Rezuma urmatorul text"+docx_text)
