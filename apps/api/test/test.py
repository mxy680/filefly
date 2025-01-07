import requests

url = "http://localhost:10000/index/"
files = {'file': ('example.pptx', open('data/example.pptx', 'rb'), 'application/vnd.openxmlformats-officedocument.presentationml.presentation')}
data = {'apiKey': 'your_api_key'}

response = requests.post(url, files=files, data=data)
print(response.json())
