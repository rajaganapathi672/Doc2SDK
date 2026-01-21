import requests
import json

url = "http://127.0.0.1:8000/api/v1/projects/"
data = {
    "name": "Petstore V2",
    "source_url": "https://petstore.swagger.io/v2/swagger.json",
    "source_type": "openapi"
}

try:
    response = requests.post(url, json=data)
    print(f"Status Code: {response.status_code}")
    print(f"Response: {response.json()}")
except Exception as e:
    print(f"Error: {e}")
