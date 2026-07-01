import os
import re

directory = r"C:\Users\baner\Downloads\MediSync\frontend\src\app\pages"

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # If it only imports types from data, skip injection but keep types
    if "from \"../../data\"" not in content and "from '../data'" not in content:
        return
        
    # We will just change data.ts to export types and functions, but for variables we use hooks.
    # Actually, the user asked to connect completely. 
    pass

if __name__ == "__main__":
    for root, dirs, files in os.walk(directory):
        for file in files:
            if file.endswith(".tsx"):
                process_file(os.path.join(root, file))
