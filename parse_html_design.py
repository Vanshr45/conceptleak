import json
import base64
import gzip
import os

with open('/home/vansh/Downloads/ConceptLeak Standalone.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Extract __bundler/manifest
man_start = content.find('<script type="__bundler/manifest">')
man_start = content.find('{', man_start)
man_end = content.find('</script>', man_start)
manifest = json.loads(content[man_start:man_end])

# Extract __bundler/template
tpl_start = content.find('<script type="__bundler/template">')
tpl_start = content.find('"', tpl_start)
tpl_end = content.find('</script>', tpl_start)
template = json.loads(content[tpl_start:tpl_end])

decoded_files = {}
for k, v in manifest.items():
    data = base64.b64decode(v['data'])
    if v.get('compressed'):
        try:
            data = gzip.decompress(data)
        except:
            pass
    decoded_files[k] = data.decode('utf-8', errors='replace')

# Look for text/babel scripts in the template
import re
scripts = re.findall(r'<script type="text/babel"(?: data-filename="([^"]+)")?>(.*?)</script>', template, re.DOTALL)

os.makedirs('extracted_html', exist_ok=True)
with open('extracted_html/template.html', 'w', encoding='utf-8') as f:
    f.write(template)

for name, script_content in scripts:
    filename = name if name else 'script.tsx'
    print("Found script:", filename)
    with open(f'extracted_html/{filename}', 'w', encoding='utf-8') as f:
        f.write(script_content)

for k, content in decoded_files.items():
    if "import " in content or "function " in content:
        print(f"Decoded file {k} might be code")
        with open(f'extracted_html/{k[:8]}.js', 'w', encoding='utf-8') as f:
            f.write(content)

