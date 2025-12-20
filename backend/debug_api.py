import urllib.request
import urllib.parse
import urllib.error
import json
import ssl

# Bypass SSL if needed (for localhost sometimes useful, though HTTP usually fine)
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

BASE_URL = "http://127.0.0.1:8000/api"

def make_request(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    if data:
        json_data = json.dumps(data).encode('utf-8')
        headers['Content-Type'] = 'application/json'
    else:
        json_data = None
        
    req = urllib.request.Request(url, data=json_data, headers=headers, method=method)
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            return response.status, response.read().decode('utf-8')
    except urllib.error.HTTPError as e:
        return e.code, e.read().decode('utf-8')
    except Exception as e:
        return 0, str(e)

def test_create_post():
    username = "debug_user_123"
    password = "password123"
    email = "debug@example.com"
    
    print(f"Attempting to register {username}...")
    status, body = make_request(f"{BASE_URL}/register/", "POST", {
        "username": username,
        "password": password,
        "email": email,
        "role": "student"
    })
    
    token = None
    if status == 201:
        print("Registration successful.")
        token = json.loads(body).get('token')
    else:
        # Check if user exists
        try:
             resp_json = json.loads(body)
        except:
             resp_json = {}
        
        if status == 400 and ("username" in resp_json or "A user with that username already exists" in str(body)):
             print("User exists, logging in...")
             status, body = make_request(f"{BASE_URL}/login/", "POST", {
                 "username": username,
                 "password": password
             })
             if status == 200:
                 print("Login successful.")
                 token = json.loads(body).get('token')
             else:
                 print(f"Login failed: {status} {body}")
                 return
        else:
            print(f"Registration failed: {status} {body}")
            return

    if not token:
        print("Could not get token.")
        return

    # 2. Create Post
    headers = {
        'Authorization': f'Token {token}'
    }
    payload = {
        "title": "Debug Post Title",
        "body": "This is a debug post body.",
        "tags": ["debug", "urllib"]
    }
    
    print("Attempting to create post...")
    status, body = make_request(f"{BASE_URL}/posts/", "POST", payload, headers)
    
    if status == 201:
        print("SUCCESS: Post created.")
        print(body)
    else:
        print(f"FAILURE: {status}")
        print(body)

if __name__ == "__main__":
    try:
        test_create_post()
    except Exception as e:
        print(f"Exception: {e}")
