from fastapi import APIRouter, HTTPException
from .. import schemas
from ..services.scraper import ScraperService
from ..services.llm_parser import LLMParserService
from ..services.translator import TranslationService
from ..generators.sdk_gen import CodeGenerator
from ..parsers.openapi import NormalizedAPISpec, OpenAPIParser
import httpx
from typing import Any

router = APIRouter()
parser_service = LLMParserService()
code_generator = CodeGenerator()
translator_service = TranslationService()

@router.post("/generate", response_model=schemas.GenerateResponse)
async def generate_sdk(request: schemas.GenerateRequest):
    try:
        # 1. Scrape
        cleaned_text = await ScraperService.scrape(request.source_url)
        
        spec_dict = {}
        spec = None
        
        # 2. Parse
        if cleaned_text.startswith("RAW_SPEC_JSON:"):
            # Use deterministic parser for raw specs
            raw_content = cleaned_text.replace("RAW_SPEC_JSON:\n", "", 1)
            parser = OpenAPIParser()
            # This returns a NormalizedAPISpec object directly
            spec = parser.parse(raw_content)
            # Add metadata
            spec_dict = spec.dict()
            spec_dict["source"] = "direct_openapi_parser"
            spec_dict["is_mock"] = False
        else:
            # Use LLM for unstructured text
            spec_dict = await parser_service.parse_docs(cleaned_text)
            # Normalize for generator
            spec = NormalizedAPISpec(**spec_dict)
        
        # 4. Generate Python SDK
        sdk_code = code_generator.generate_python_sdk(spec)
        
        return schemas.GenerateResponse(
            name=spec.name,
            version=spec.version,
            spec=spec_dict,
            sdk_code=sdk_code,
            is_mock=spec_dict.get("is_mock", False),
            source=spec_dict.get("source")
        )
    except Exception as e:
        print(f"Error during generation: {e}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=400, detail=str(e))

@router.post("/playground/execute", response_model=schemas.ExecuteResponse)
async def execute_api_call(request: schemas.ExecuteRequest):
    async with httpx.AsyncClient() as client:
        # Construct URL
        url = request.base_url.rstrip("/") + "/" + request.path.lstrip("/")
        
        try:
            response = await client.request(
                method=request.method,
                url=url,
                params=request.params,
                headers=request.headers,
                json=request.json_body,
                timeout=30.0
            )
            
            # Identify if response is JSON
            try:
                raw_data = response.json()
                # Translate data strings to English
                data = await translator_service.translate_response(raw_data)
            except:
                data = response.text

            return schemas.ExecuteResponse(
                status_code=response.status_code,
                response=data
            )
        except Exception as e:
            raise HTTPException(status_code=400, detail=f"Request failed: {str(e)}")
