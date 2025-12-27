import os
import re

# Files to process (found via grep)
files_to_update = [
    r'c:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\src\pages\UserPage.tsx',
    r'c:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\src\pages\student\Dashboard.tsx',
    r'c:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\src\pages\QuestionDetail.tsx',
    r'c:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\src\pages\instructor\Dashboard.tsx',
    r'c:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\src\pages\HomePage.tsx',
    r'c:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\src\pages\Explore.tsx',
    r'c:\Users\sarah\Desktop\StudyFlow\studyflow_project\frontend\src\components\posts.tsx',
]

for full_path in files_to_update:
    if not os.path.exists(full_path):
        print(f"Skipping {os.path.basename(full_path)} - not found")
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Count occurrences
    count = len(re.findall(r'127\.0\.0\.1:8000', content))
    if count == 0:
        print(f"Skipping {os.path.basename(full_path)} - already clean")
        continue
    
    # Determine correct import path based on file location
    if 'components' in full_path:
        import_line = 'import { apiUrl } from "../config";\n'
    elif 'student' in full_path or 'instructor' in full_path:
        import_line = 'import { apiUrl } from "../../config";\n'
    else:
        import_line = 'import { apiUrl } from "../config";\n'
    
    # Add import if not present
    if 'apiUrl' not in content and 'config' not in content:
        # Find position after imports
        lines = content.split('\n')
        insert_pos = 0
        for i, line in enumerate(lines):
            if line.strip().startswith('import'):
                insert_pos = i+1
        lines.insert(insert_pos, import_line.rstrip())
        content = '\n'.join(lines)
    
    # Replace URLs - handle both single and double quotes, and template literals
    # Pattern 1: "http://127.0.0.1:8000/api/path/" -> apiUrl("api/path/")
    content = re.sub(r'["\']http://127\.0\.0\.1:8000(/api/[^\'"]*)["\']', 
                     lambda m: f'apiUrl("{m.group(1)[1:]}")', content)  # Remove leading /
    
    # Pattern 2: Template literals `http://127.0.0.1:8000${...}`  -> `${getServerUrl()}${...}`
    content = re.sub(r'`http://127\.0\.0\.1:8000([^`]*)`', 
                     lambda m: f'`${{getServerUrl()}}{m.group(1)}`', content)
    
    # Add getServerUrl import if needed
    if 'getServerUrl' in content and 'getServerUrl' not in re.findall(r'import.*from.*config', content):
        content = re.sub(r'(import\s*{[^}]*)(}\s*from\s*["\'][\.\/]*config["\'])',
                        r'\1, getServerUrl\2', content)
    
    # Write back
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    
    print(f"✓ Updated {os.path.basename(full_path)} - replaced {count} URLs")

print("\n✅ Done! All localhost URLs replaced.")
