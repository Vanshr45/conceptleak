import json
import base64
import gzip
import os
from bs4 import BeautifulSoup
import re

with open('/home/vansh/Downloads/ConceptLeak Standalone.html', 'r', encoding='utf-8') as f:
    soup = BeautifulSoup(f, 'html.parser')

manifest_script = soup.find('script', type='__bundler/manifest')
template_script = soup.find('script', type='__bundler/template')

if not manifest_script or not template_script:
    print("Could not find manifest or template")
    exit(1)

manifest = json.loads(manifest_script.string)
template_str = json.loads(template_script.string)

os.makedirs('extracted_html', exist_ok=True)
with open('extracted_html/template.html', 'w', encoding='utf-8') as f:
    f.write(template_str)

# Look for text/babel scripts
scripts = re.findall(r'<script type="text/babel"(?: data-filename="([^"]+)")?>(.*?)</script>', template_str, re.DOTALL)
for name, script_content in scripts:
    filename = name if name else 'script.tsx'
    print("Found script:", filename)
    with open(f'extracted_html/{filename}', 'w', encoding='utf-8') as f:
        f.write(script_content)

for k, v in manifest.items():
    data = base64.b64decode(v['data'])
    if v.get('compressed'):
        try:
            data = gzip.decompress(data)
        except:
            pass
    try:
        text = data.decode('utf-8')
        if "import " in text or "function " in text or "const " in text:
            print(f"Decoded file {k} might be code")
            with open(f'extracted_html/{k[:8]}.js', 'w', encoding='utf-8') as f:
                f.write(text)
    except:
        pass
