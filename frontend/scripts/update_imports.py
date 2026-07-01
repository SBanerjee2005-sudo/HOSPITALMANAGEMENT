import os
import re

pages_dir = r"c:\Users\baner\Downloads\MediSync\frontend\src\app\pages"

def process_file(filepath):
    with open(filepath, "r", encoding="utf-8") as f:
        content = f.read()

    # Find import from data
    # import { getHospitalById, type Doctor } from "../../data";
    # We want to change this.
    # Because there are so many variations, let's just use a heuristic:
    # If the file imports hospitals, getHospitalById, etc., we inject useDashboardData
    
    changed = False
    
    if "import " in content and "from \"../../data\"" in content:
        # Check if it imports only types
        match = re.search(r'import\s+\{([^}]+)\}\s+from\s+"../../data"', content)
        if match:
            imports = [x.strip() for x in match.group(1).split(",")]
            non_types = [x for x in imports if not x.startswith("type ")]
            
            if len(non_types) > 0:
                # Needs refactoring
                print(f"Refactoring {filepath}")
                # Replace import to just types, and import useDashboardData
                types_only = [x for x in imports if x.startswith("type ")]
                new_import = ""
                if types_only:
                    new_import += f"import {{ {', '.join(types_only)} }} from \"../../data\";\n"
                
                # We also need to import the hooks.
                # Let's import all of them just in case, or match based on usage.
                hooks_import = "import { useDashboardData } from \"../../hooks/useDashboardData\";\nimport { useDoctorData } from \"../../hooks/useDoctorData\";\nimport { useStaffData } from \"../../hooks/useStaffData\";\n"
                
                content = content[:match.start()] + new_import + hooks_import + content[match.end():]
                
                # Now inject hook call at the top of the default export component
                # export default function ComponentName() {
                comp_match = re.search(r'export default function [A-Za-z0-9_]+\([^)]*\)\s*\{', content)
                if comp_match:
                    injection = "\n  const { hospitals, doctors, appointments, adminPatients, getHospitalById } = useDashboardData();\n  const { schedule: docSchedule, notifications: docNotif } = useDoctorData();\n  const { schedule: staffSchedule, notifications: staffNotif } = useStaffData();\n"
                    content = content[:comp_match.end()] + injection + content[comp_match.end():]
                    changed = True

    if changed:
        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Updated {filepath}")

for root, dirs, files in os.walk(pages_dir):
    for f in files:
        if f.endswith(".tsx"):
            process_file(os.path.join(root, f))
