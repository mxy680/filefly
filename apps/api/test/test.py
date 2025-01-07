import requests

url = "http://localhost:10000/index/"
files = {'file': ('example.png', open('data/example.png', 'rb'), 'image/png')}
data = {'apiKey': 'your_api_key'}

response = requests.post(url, files=files, data=data)
print(response.json())
