import os
import json
import google.generativeai as genai
from typing import Any, Dict
from dotenv import load_dotenv

load_dotenv()

class TranslationService:
    def __init__(self):
        self.model = None
        self._initialize_model()

    def _initialize_model(self):
        api_key = os.getenv("GEMINI_API_KEY")
        if not api_key or api_key == "your_gemini_api_key_here":
            return

        try:
            genai.configure(api_key=api_key)
            self.model = genai.GenerativeModel("models/gemini-2.0-flash")
        except Exception as e:
            print(f"DEBUG: Failed to initialize Gemini model for translation: {str(e)}")

    async def translate_response(self, data: Any) -> Any:
        """
        Translates all string values in a JSON-like object to English using AI.
        """
        if not self.model or not data:
            return data

        prompt = f"""
        You are a translator. Translate all human-readable string values in the following JSON to English. 
        Keep the keys and structure EXACTLY the same. 
        Only translate values that are likely to be human-readable text (sentences, titles, names, etc.).
        Do not translate technical identifiers, IDs, or URLs.

        JSON Data:
        {json.dumps(data, indent=2)}
        """

        try:
            response = self.model.generate_content(
                prompt,
                generation_config={"response_mime_type": "application/json"},
            )
            return json.loads(response.text)
        except Exception as e:
            print(f"DEBUG: Translation failed ({str(e)}). Returning raw data.")
            return data
