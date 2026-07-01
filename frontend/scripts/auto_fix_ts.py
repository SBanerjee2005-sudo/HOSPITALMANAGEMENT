import re
import os

with open("tsc_errors.txt", "r", encoding="utf-16") as f:
    lines = f.readlines()

actions = []
for line in lines:
    match = re.match(r'^(.+?)\((\d+),\d+\): error (TS\d+): (.*)', line.strip())
    if match:
        file_path = match.group(1).strip()
        line_num = int(match.group(2))
        err_code = match.group(3)
        msg = match.group(4)
        
        if err_code == "TS6198":
            actions.append((file_path, line_num, "delete_line", None))
        elif err_code == "TS6133":
            # 'hospitals' is declared but its value is never read.
            var_match = re.search(r"'([^']+)' is declared", msg)
            if var_match:
                actions.append((file_path, line_num, "remove_var", var_match.group(1)))
        elif err_code == "TS2451":
            # Cannot redeclare block-scoped variable 'appointments'.
            var_match = re.search(r"'([^']+)'", msg)
            if var_match:
                actions.append((file_path, line_num, "remove_var", var_match.group(1)))
        elif err_code == "TS2300":
            # Duplicate identifier 'getMedicalRecordByPatientId'.
            var_match = re.search(r"'([^']+)'", msg)
            if var_match:
                actions.append((file_path, line_num, "remove_var", var_match.group(1)))

# Group by file
files = {}
for a in actions:
    files.setdefault(a[0], []).append(a)

for fp, file_actions in files.items():
    if not os.path.exists(fp): continue
    with open(fp, "r", encoding="utf-8") as f:
        file_lines = f.readlines()
        
    for act in sorted(file_actions, key=lambda x: x[1], reverse=True):
        line_idx = act[1] - 1
        if line_idx >= len(file_lines): continue
        orig_line = file_lines[line_idx]
        
        if act[2] == "delete_line":
            file_lines[line_idx] = ""
        elif act[2] == "remove_var":
            var = act[3]
            # carefully remove var from { a, b, c }
            # handle cases: "{ var }", "{ var, ", ", var", " var "
            line_str = file_lines[line_idx]
            line_str = re.sub(r',\s*' + re.escape(var) + r'\b', '', line_str)
            line_str = re.sub(r'\b' + re.escape(var) + r'\s*,', '', line_str)
            line_str = re.sub(r'\{\s*' + re.escape(var) + r'\s*\}', '{}', line_str)
            # wait, if it's `{ var }` => `{}`
            # if it's `{ var: alias }` => remove
            
            # just delete the line if it becomes empty {}
            if "const {}" in line_str or "import {}" in line_str:
                file_lines[line_idx] = ""
            else:
                file_lines[line_idx] = line_str

    with open(fp, "w", encoding="utf-8") as f:
        f.writelines(file_lines)
    print(f"Fixed {fp}")
