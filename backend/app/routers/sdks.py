from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session
from ..database import get_db
from .. import models, schemas
from ..generators.sdk_gen import CodeGenerator
import uuid

router = APIRouter()

class GenerationRequest(BaseModel):
    language: str = "python"

@router.post("/generate/{project_id}", response_model=dict)
async def generate_sdk(
    project_id: str,
    request: GenerationRequest,
    db: Session = Depends(get_db)
):
    language = request.language
    project = db.query(models.APIProject).filter(models.APIProject.id == project_id).first()
    if not project:
        raise HTTPException(status_code=404, detail="Project not found")

    # Load spec from DB
    from ..parsers.openapi import NormalizedAPISpec
    spec = NormalizedAPISpec(**project.api_spec)

    # Generate code
    generator = CodeGenerator()
    if language.lower() == "python":
        code = generator.generate_python_sdk(spec)
    else:
        raise HTTPException(status_code=400, detail=f"Language {language} not supported yet")

    # Save to DB
    db_sdk = models.GeneratedSDK(
        project_id=project.id,
        language=language,
        version="1.0.0",
        code_content=code,
        config={"language": language}
    )
    db.add(db_sdk)
    db.commit()
    db.refresh(db_sdk)

    return {
        "id": str(db_sdk.id),
        "language": db_sdk.language,
        "code": db_sdk.code_content[:200] + "...", # Truncated for response
        "status": "SDK generated successfully"
    }

@router.get("/{project_id}", response_model=list)
async def list_sdks(project_id: str, db: Session = Depends(get_db)):
    sdks = db.query(models.GeneratedSDK).filter(models.GeneratedSDK.project_id == project_id).all()
    return [
        {"id": str(s.id), "language": s.language, "generated_at": s.generated_at} for s in sdks
    ]
