import os
import json
import google.generativeai as genai
from typing import Dict, Any, Optional
from dotenv import load_dotenv

load_dotenv()

class LLMParserService:
    def __init__(self):
        self.model = None
        self.model_name = None
        self._initialize_model()

    def _initialize_model(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            self.model = None
            return

        try:
            genai.configure(api_key=api_key)
            # Find the best available gemini model
            models = [m.name for m in genai.list_models() if "gemini" in m.name]
            
            # Preference order
            preferred = ["models/gemini-2.0-flash", "models/gemini-1.5-flash", "models/gemini-1.5-pro", "models/gemini-pro"]
            for p in preferred:
                if p in models:
                    self.model_name = p
                    break
            
            if not self.model_name and models:
                self.model_name = models[0]
                
            if self.model_name:
                self.model = genai.GenerativeModel(self.model_name)
                print(f"DEBUG: Initialized with model: {self.model_name}")
        except Exception as e:
            print(f"DEBUG: Failed to initialize Gemini model: {str(e)}")
            self.model = None

    async def parse_docs(self, cleaned_text: str) -> Dict[str, Any]:
        if not self.model:
            self._initialize_model()

        # 1. Spec-First Bypass: If scraper found a raw JSON spec, parse it directly
        if "RAW_SPEC_JSON:" in cleaned_text:
            try:
                json_start = cleaned_text.find("{")
                if json_start != -1:
                    raw_json = cleaned_text[json_start:]
                    spec = json.loads(raw_json)
                    
                    # Normalize basic properties if missing
                    res = {
                        "name": spec.get("info", {}).get("title", spec.get("name", "Extracted API")),
                        "version": spec.get("info", {}).get("version", spec.get("version", "1.0.0")),
                        "base_url": spec.get("servers", [{"url": ""}])[0].get("url", spec.get("base_url", "")),
                        "description": spec.get("info", {}).get("description", spec.get("description", "")),
                        "authentication": spec.get("authentication", {"type": "none"}),
                        "endpoints": spec.get("endpoints", []),
                        "source": "direct_extraction",
                        "is_mock": False
                    }
                    
                    if not res["endpoints"] and "paths" in spec:
                        # Attempt to extract endpoints from paths if it's a raw OpenAPI spec
                        endpoints = []
                        for path, methods in spec["paths"].items():
                            for method, details in methods.items():
                                if method.upper() in ["GET", "POST", "PUT", "DELETE", "PATCH"]:
                                    endpoints.append({
                                        "method": method.upper(),
                                        "path": path,
                                        "summary": details.get("summary", ""),
                                        "parameters": {
                                            "path": [],
                                            "query": [],
                                            "header": []
                                        },
                                        "responses": {"200": {"description": "Success"}}
                                    })
                        res["endpoints"] = endpoints
                    
                    if res["endpoints"]:
                        return res
            except Exception as e:
                print(f"DEBUG: Direct extraction failed: {str(e)}")

        # 2. LLM Parsing with Gemini
        prompt = f"""
        You are an expert API architect. Extract the API structure and return a STRICT JSON object.
        IMPORTANT: All descriptive strings (name, summary, description, parameter names, etc.) MUST be translated to English if they are in another language.

        API Documentation Text:
        {cleaned_text}

        Return a JSON object with this structure:
        {{
            "name": "API Name",
            "version": "1.0.0",
            "base_url": "https://api.example.com/v1",
            "description": "Short description",
            "authentication": {{
                "type": "bearer" or "apiKey" or "none",
                "name": "Header/Param name if apiKey",
                "in": "header" or "query"
            }},
            "endpoints": [
                {{
                    "method": "GET",
                    "path": "/resource/{{id}}",
                    "summary": "Summary",
                    "parameters": {{
                        "path": [{{ "name": "id", "type": "string", "required": true }}],
                        "query": [],
                        "header": []
                    }},
                    "request_body": {{}},
                    "responses": {{ "200": {{ "description": "Success" }} }}
                }}
            ]
        }}
        """

        if not self.model:
            raise Exception("AI service unavailable: No Gemini model initialized. Please check your GEMINI_API_KEY.")

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            
            spec_json = json.loads(response.text)
            return {**spec_json, "source": f"gemini_{self.model_name.split('/')[-1]}", "is_mock": False}
        except Exception as e:
            print(f"DEBUG: Gemini parsing failed ({str(e)})")
            raise Exception(f"AI Generation failed: {str(e)}")

