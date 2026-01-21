import httpx
import json

url = "http://127.0.0.1:8000/api/v1/generate"
payload = {
    "source_url": "https://petstore.swagger.io/v2/swagger.json"
}

try:
    print(f"Sending request to {url}...")
    with httpx.Client(timeout=60) as client:
        response = client.post(url, json=payload)
    print(f"Status Code: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        print(f"API Name: {data.get('name')}")
        print(f"SDK Code Sample:\n{data.get('sdk_code')[:200]}...")
    else:
        print(f"Error: {response.text}")
except Exception as e:
    print(f"Request failed: {e}")
