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
        
        # Helper to process a node
        def process_node(node):
            if node.name in ['script', 'style', 'nav', 'footer', 'aside', 'header', 'iframe', 'svg']:
                return ""
            
            text = ""
            if node.name in ['h1', 'h2', 'h3', 'h4']:
                text = f"\n\n### {node.get_text().strip()} ###\n"
            elif node.name in ['pre', 'code']:
                text = f"\n```\n{node.get_text().strip()}\n```\n"
            elif node.name == 'table':
                # Attempt to format table as text
                rows = []
                for tr in node.find_all('tr'):
                    cells = [td.get_text().strip() for td in tr.find_all(['td', 'th'])]
                    rows.append(" | ".join(cells))
                text = "\n" + "\n".join(rows) + "\n"
            elif node.name in ['p', 'li', 'div', 'span']:
                 # Only add meaningful text
                 t = node.get_text().strip()
                 if len(t) > 2: # Reduce noise
                    text = f"{t}\n"
            
            return text

        # Instead of finding specific tags, iterate over main content areas or just body
        # But to keep it simple and robust, let's target the likely content containers
        # If we can't find a main container, we fallback to body
        content_root = soup.find('main') or soup.find('article') or soup.find('body')
        
        if content_root:
            # Get text with separator to preserve some layout
            # separator=" " might merge too much, so we stick to our manual iteration or use get_text
            cleaned_text = content_root.get_text(separator="\n", strip=True)
        else:
             # Fallback
             cleaned_text = soup.get_text(separator="\n", strip=True)

        # Post-processing to remove excessive whitespace
        cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
        # remove excessive newlines
        cleaned_text = re.sub(r'\n{3,}', '\n\n', cleaned_text)
        
        return cleaned_text[:50000] # Cap to 50k chars (Balance between depth and speed)
