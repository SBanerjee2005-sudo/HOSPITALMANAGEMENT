import os
import re

base_dir = os.path.join(os.path.dirname(__file__), "..", "src", "app", "pages")

# The exact line that is mostly unused
TARGET = "const { hospitals, doctors, appointments, adminPatients, getHospitalById } = useDashboardData();"

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()
                
            if TARGET in content:
                # We want to replace it only if those variables are not used elsewhere.
                # Actually, if we just check if "hospitals" is used outside of that line.
                # A quick heuristic: Count occurrences of "hospitals", if it's 1, it's unused.
                hospitals_count = len(re.findall(r'\bhospitals\b', content))
                doctors_count = len(re.findall(r'\bdoctors\b', content))
                adminPatients_count = len(re.findall(r'\badminPatients\b', content))
                getHospitalById_count = len(re.findall(r'\bgetHospitalById\b', content))
                
                parts_to_keep = []
                if hospitals_count > 1: parts_to_keep.append("hospitals")
                if doctors_count > 1: parts_to_keep.append("doctors")
                if len(re.findall(r'\bappointments\b', content)) > 1: parts_to_keep.append("appointments")
                if adminPatients_count > 1: parts_to_keep.append("adminPatients")
                if getHospitalById_count > 1: parts_to_keep.append("getHospitalById")
                
                if not parts_to_keep:
                    new_content = content.replace(TARGET, "")
                else:
                    new_line = f"const {{ {', '.join(parts_to_keep)} }} = useDashboardData();"
                    new_content = content.replace(TARGET, new_line)
                    
                with open(path, "w", encoding="utf-8") as f:
                    f.write(new_content)
                print(f"Fixed {file}, kept {parts_to_keep}")
