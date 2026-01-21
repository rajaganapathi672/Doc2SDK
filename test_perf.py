import time
import asyncio
import httpx
import json

async def test_performance():
    url = "http://localhost:8000/api/v1/generate"
    payload = {"source_url": "https://dog.ceo/dog-api/documentation"}
    
    start_time = time.time()
    async with httpx.AsyncClient(timeout=60.0) as client:
        print(f"Sending request to {url}...")
        response = await client.post(url, json=payload)
        
    end_time = time.time()
    
    print(f"\nResponse Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"API Name: {data.get('name')}")
        print(f"Source: {data.get('source')}")
    else:
        print(f"Error: {response.text}")
        
    print(f"\nTotal Time Taken: {end_time - start_time:.2f} seconds")

if __name__ == "__main__":
    asyncio.run(test_performance())
