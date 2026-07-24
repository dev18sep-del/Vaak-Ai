import sys
import json
import os
import urllib.request
import urllib.error

def main():
    try:
        # Read input from stdin
        input_data = sys.stdin.read()
        if not input_data:
            return
            
        data = json.loads(input_data)
        api_key = os.environ.get("GEMINI_API_KEY")
        if not api_key:
            sys.stderr.write("Missing GEMINI_API_KEY\n")
            sys.exit(1)
            
        contents = data.get("contents", [])
        system_instruction = data.get("systemInstruction", "")
        
        # We will use the REST API for streaming
        url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-3.6-flash:streamGenerateContent?alt=sse&key={api_key}"
        
        body = {
            "contents": contents,
            "generationConfig": {
                "temperature": 0.7
            }
        }
        
        if system_instruction:
            body["systemInstruction"] = {
                "parts": [{"text": system_instruction}]
            }
            
        req = urllib.request.Request(
            url, 
            data=json.dumps(body).encode("utf-8"), 
            headers={"Content-Type": "application/json"}
        )
        
        try:
            with urllib.request.urlopen(req) as response:
                # SSE response
                for line in response:
                    line = line.decode('utf-8')
                    if line.startswith("data: "):
                        data_str = line[6:].strip()
                        if data_str == "[DONE]":
                            break
                        if not data_str:
                            continue
                        try:
                            chunk = json.loads(data_str)
                            if "candidates" in chunk and chunk["candidates"]:
                                parts = chunk["candidates"][0].get("content", {}).get("parts", [])
                                for part in parts:
                                    if "text" in part:
                                        sys.stdout.write(part["text"])
                                        sys.stdout.flush()
                        except json.JSONDecodeError:
                            pass
        except urllib.error.HTTPError as e:
            sys.stderr.write(f"HTTPError: {e.read().decode('utf-8')}\n")
            sys.exit(1)
            
    except Exception as e:
        sys.stderr.write(str(e) + "\n")
        sys.exit(1)

if __name__ == "__main__":
    main()
