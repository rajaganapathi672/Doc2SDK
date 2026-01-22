from pydantic import BaseModel
from typing import List, Optional, Dict, Any

class GenerateRequest(BaseModel):
    source_url: str

class GenerateResponse(BaseModel):
    name: str
    version: str
    spec: Dict[str, Any]
    sdk_code: str
    is_mock: bool = False
    source: Optional[str] = None

class ExecuteRequest(BaseModel):
    base_url: str
    path: str
    method: str
    params: Optional[Dict[str, Any]] = None
    headers: Optional[Dict[str, Any]] = None
    json_body: Optional[Dict[str, Any]] = None

class ExecuteResponse(BaseModel):
    status_code: int
    response: Any
