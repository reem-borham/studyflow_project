import os
import re

# Files to process
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
        continue
    
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    
    # Check if file uses getServerUrl
    needs_get_server = 'getServerUrl()' in content
    
    # Find existing config import
    config_import_match = re.search(r'import\s*{([^}]*)}\s*from\s*["\']([\.\/]*)config["\']\s*;', content)
    
    if config_import_match:
        imports = config_import_match.group(1)
        path = config_import_match.group(2)
        
        # Build new import list
        import_list = [i.strip() for i in imports.split(',')]
        
        # Add getServerUrl if needed and not present
        if needs_get_server and 'getServerUrl' not in imports:
            import_list.append('getServerUrl')
        
        # Rebuild import statement
        new_import = f'import {{ {", ".join(import_list)} }} from "{path}config";'
        content = re.sub(r'import\s*{[^}]*}\s*from\s*["\'][\.\/]*config["\']\s*;', new_import, content)
        
        print(f"✓ Fixed imports in {os.path.basename(full_path)}")
    
        # Write back
        with open(full_path, 'w', encoding='utf-8') as f:
            f.write(content)

print("\n✅ Done! Fixed all imports.")
