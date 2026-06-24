import re

with open('inicio-nuevo.html', 'r') as f:
    inicio_html = f.read()

with open('presencial-ejemplo.html', 'r') as f:
    presencial_html = f.read()

# Extract header.header-default block from inicio-nuevo.html
# It starts at "    header.header-default {" (or similar)
# We can use regex to find the block between "/* ====================================================="
# "   HEADER FIJO" and the next big comment block.
inicio_match = re.search(r'/\* =====================================================\n\s*HEADER FIJO.*?\*/(.*?)/\* =====================================================\n\s*HERO', inicio_html, re.DOTALL)

presencial_match = re.search(r'/\* =====================================================\n\s*HEADER FIJO.*?\*/(.*?)/\* =====================================================\n\s*HERO', presencial_html, re.DOTALL)

if inicio_match and presencial_match:
    new_html = presencial_html[:presencial_match.start(1)] + inicio_match.group(1) + presencial_html[presencial_match.end(1):]
    with open('presencial-ejemplo.html', 'w') as f:
        f.write(new_html)
    print("Replaced successfully!")
else:
    print("Could not match the CSS blocks.")

