import os
import re

base_dir = os.path.join(os.path.dirname(__file__), "..", "src", "app", "pages")

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
            
            # Find all imports from "../../data" or "../data"
            imports_2 = re.findall(r'import\s+\{([^}]+)\}\s+from\s+"../../data";', content)
            
            if len(imports_2) > 1:
                all_names = set()
                for imp in imports_2:
                    names = [n.strip() for n in imp.split(",")]
                    for n in names:
                        if n: all_names.add(n)
                
                # Remove all matching lines
                content = re.sub(r'import\s+\{[^}]+\}\s+from\s+"../../data";\n?', '', content)
                
                if all_names:
                    merged = f'import {{ {", ".join(sorted(all_names))} }} from "../../data";\n'
                    # Insert after first import
                    content = re.sub(r'^(import.*?)\n', r'\1\n' + merged, content, count=1)
                
                with open(path, "w", encoding="utf-8") as f:
                    f.write(content)
                print(f"Deduped imports in {file}")
