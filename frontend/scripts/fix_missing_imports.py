import os
import re

MISSING_FUNCS = [
    "getDepartmentsByHospital",
    "getDoctorsByHospitalAndDepartment",
    "getDoctorById",
    "getHospitalNameById",
    "getPatientsByHospital",
    "getDoctorsByHospital",
    "getAppointmentsByHospital",
    "getStaffNotifications",
    "getHospitalReportSummary",
    "getHospitalMonthlyRevenue",
    "getHospitalYearlyRevenue",
    "getNetworkMonthlyRevenue",
    "getMedicalRecordByPatientId",
    "getDoctorSchedulesByDoctor",
    "getDoctorSchedulesByHospital",
    "getAppointmentsByDoctor",
    "getDoctorNotifications",
]

base_dir = os.path.join(os.path.dirname(__file__), "..", "src", "app", "pages")

for root, _, files in os.walk(base_dir):
    for file in files:
        if file.endswith(".tsx"):
            path = os.path.join(root, file)
            with open(path, "r", encoding="utf-8") as f:
                content = f.read()

            funcs_to_add = []
            for func in MISSING_FUNCS:
                # Basic check if it's used in the file
                if re.search(r'\b' + func + r'\b', content):
                    funcs_to_add.append(func)
            
            if funcs_to_add:
                # Find if we already import from "../../data"
                if 'from "../../data"' in content:
                    # Append it right below the first import block
                    import_statement = f"import {{ {', '.join(funcs_to_add)} }} from \"../../data\";\n"
                    # Add after the first line (hacky but works since all start with imports)
                    lines = content.split('\n')
                    lines.insert(2, import_statement)
                    with open(path, "w", encoding="utf-8") as f:
                        f.write('\n'.join(lines))
                    print(f"Fixed {file} by importing {funcs_to_add}")
                else:
                    import_statement = f"import {{ {', '.join(funcs_to_add)} }} from \"../../data\";\n"
                    lines = content.split('\n')
                    lines.insert(2, import_statement)
                    with open(path, "w", encoding="utf-8") as f:
                        f.write('\n'.join(lines))
                    print(f"Fixed {file} by importing {funcs_to_add}")
