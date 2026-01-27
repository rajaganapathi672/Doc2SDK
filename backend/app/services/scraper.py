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
        # Include more tags that might contain documentation components
        target_tags = ['h1', 'h2', 'h3', 'h4', 'h5', 'p', 'li', 'pre', 'code', 'table', 'tr', 'td', 'span', 'div']
        
        for tag in soup.find_all(target_tags):
            # For div and span, only include if they have text and aren't too deep/nested
            if tag.name in ['div', 'span'] and (len(tag.get_text(strip=True)) > 200 or len(tag.find_all(recursive=False)) > 5):
                continue
                
            text = tag.get_text().strip()
            if not text:
                continue

            if tag.name in ['h1', 'h2', 'h3', 'h4', 'h5']:
                text_content.append(f"\n{text}\n" + "="*len(text))
            elif tag.name in ['pre', 'code']:
                # Detect if it looks like an endpoint (e.g. "GET /v1/...")
                if re.match(r'^(GET|POST|PUT|DELETE|PATCH)\s+/', text):
                    text_content.append(f"\nENDPOINT_CANDIDATE: {text}\n")
                else:
                    text_content.append(f"\nCODE_BLOCK:\n{text}\n")
            elif tag.name == 'tr':
                # Table rows often contain parameter descriptions
                cells = [c.get_text(strip=True) for c in tag.find_all(['td', 'th'])]
                if cells:
                    text_content.append(f" | ".join(cells))
            else:
                text_content.append(text)

        cleaned_text = "\n".join(text_content)
        # remove excessive newlines and whitespace
        cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
        cleaned_text = re.sub(r' +', ' ', cleaned_text)
        
        return cleaned_text[:12000] # Slightly increased cap
