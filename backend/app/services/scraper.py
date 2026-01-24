import httpx
from bs4 import BeautifulSoup
import re

class ScraperService:
    @staticmethod
    async def scrape(url: str) -> str:
        async with httpx.AsyncClient(follow_redirects=True) as client:
            try:
                response = await client.get(url, timeout=30.0)
                response.raise_for_status()
                
                # Direct detection of API specs (JSON)
                content_type = response.headers.get("content-type", "").lower()
                if "application/json" in content_type or url.endswith(".json"):
                    return f"RAW_SPEC_JSON:\n{response.text}"
                
                html = response.text
            except Exception as e:
                raise ValueError(f"Failed to fetch documentation from {url}: {str(e)}")

        soup = BeautifulSoup(html, 'html.parser')

        # Remove irrelevant elements
        for element in soup(['script', 'style', 'nav', 'footer', 'aside', 'header', 'iframe']):
            element.decompose()

        # Extract text and code blocks
        # We want to preserve structure roughly
        text_content = []
        for tag in soup.find_all(['h1', 'h2', 'h3', 'h4', 'p', 'li', 'pre', 'code']):
            text = tag.get_text().strip()
            if text:
                if tag.name in ['h1', 'h2', 'h3', 'h4']:
                    text_content.append(f"\n{text}\n" + "="*len(text))
                elif tag.name in ['pre', 'code']:
                    text_content.append(f"\nCODE_BLOCK:\n{text}\n")
                else:
                    text_content.append(text)

        cleaned_text = "\n".join(text_content)
        # remove excessive newlines
        cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
        
        return cleaned_text[:10000] # Cap to 10k chars for LLM tokens
