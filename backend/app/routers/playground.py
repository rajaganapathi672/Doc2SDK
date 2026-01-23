from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Dict, Any

router = APIRouter()

class TestRequest(BaseModel):
    project_id: str
    endpoint_id: str
    parameters: Dict[str, Any] = {}

@router.post("/test")
async def test_endpoint(request: TestRequest):
    # This is a stub for executing actual API calls
    # In a real implementation, this would use httpx to call the API
    return {
        "status": "success",
        "message": "Endpoint tested successfully (mocked)",
        "request": request.dict(),
        "response": {
            "status_code": 200,
            "data": {"message": "Success from AntiGravity Playground"}
        }
    }

@router.get("/")
async def get_playground():
    return {"message": "Welcome to AntiGravity Playground"}
