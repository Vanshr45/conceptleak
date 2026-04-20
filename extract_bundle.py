import json
import base64
import gzip
import os

with open('/home/vansh/Downloads/ConceptLeak Standalone.html', 'r', encoding='utf-8') as f:
    content = f.read()

start = content.find('<script type="__bundler/manifest">')
if start == -1:
    print("Manifest not found")
    exit(1)
start = content.find('{', start)
end = content.find('</script>', start)
manifest_json = content[start:end]

try:
    manifest = json.loads(manifest_json)
except Exception as e:
    print("JSON parse error:", e)
    with open('manifest_err.json', 'w') as f:
        f.write(manifest_json)
    manifest = {}

os.makedirs('extracted_html', exist_ok=True)
for k, v in manifest.items():
    data = base64.b64decode(v['data'])
    if v.get('compressed'):
        try:
            data = gzip.decompress(data)
        except:
            pass
    # Usually we don't know the filenames directly from this manifest unless there's a file path
    # Let's see if there's a template or other script.
