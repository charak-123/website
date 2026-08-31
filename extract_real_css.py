import re

with open('/tmp/charak_bundle.js', 'r', encoding='utf-8', errors='ignore') as f:
    text = f.read()

# Find all CSS loader push calls - using backtick template literals too
css_chunks = []

# Pattern 1: with backtick template strings
backtick_pattern = re.compile(r'___CSS_LOADER_EXPORT___\.push\(\[module\.id,\s*`((?:[^`\\]|\\.)*)`', re.DOTALL)
for m in backtick_pattern.finditer(text):
    css = m.group(1)
    css = css.replace('\\n', '\n').replace('\\t', '\t')
    css_chunks.append(('backtick', m.start(), css))

# Pattern 2: with double-quote strings  
dq_pattern = re.compile(r'___CSS_LOADER_EXPORT___\.push\(\[module\.id,\s*"((?:[^"\\]|\\.)*)"', re.DOTALL)
for m in dq_pattern.finditer(text):
    css = m.group(1)
    css = css.replace('\\n', '\n').replace('\\t', '\t').replace('\\"', '"').replace("\\'", "'").replace('\\\\', '\\')
    css_chunks.append(('dquote', m.start(), css))

# Sort by position
css_chunks.sort(key=lambda x: x[1])

print(f"Found {len(css_chunks)} CSS chunks total:")
for kind, pos, css in css_chunks:
    preview = css[:120].replace('\n', ' ').strip()
    print(f"  [{kind}] at {pos}: {len(css)} chars -> {preview}...")

# Write each chunk
for i, (kind, pos, css) in enumerate(css_chunks):
    with open(f'css_chunk_{i}.css', 'w', encoding='utf-8') as out:
        out.write(css)
    print(f"  Written css_chunk_{i}.css")
