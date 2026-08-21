# api/chat.py
import json
import os
from http.server import BaseHTTPRequestHandler
import google.generativeai as genai
from .prompts import SYSTEM_PROMPT

# API 키 설정
api_key = os.environ.get("GEMINI_API_KEY")
if api_key:
    genai.configure(api_key=api_key)

class handler(BaseHTTPRequestHandler):
    def do_POST(self):
        # CORS 헤더 설정
        self.send_response(200)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()

        try:
            content_length = int(self.headers.get("Content-Length", 0))
            post_data = self.rfile.read(content_length).decode("utf-8")
            body = json.loads(post_data) if post_data else {}
            
            user_message = body.get("message", "")
            category = body.get("category", "일반")

            if not user_message:
                response_data = {"error": "메시지가 비어 있습니다."}
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))
                return

            if not api_key:
                response_data = {"error": "GEMINI_API_KEY 환경변수가 설정되지 않았습니다."}
                self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))
                return

            # 가장 안정적인 방식으로 모델 호출
            model = genai.GenerativeModel(model_name="gemini-3.5-flash")
            
            full_prompt = f"{SYSTEM_PROMPT}\n\n[카테고리: {category}]\n대상/키워드: {user_message}"
            response = model.generate_content(full_prompt)
            
            reply_text = ""
            if response and hasattr(response, 'text'):
                reply_text = response.text
            else:
                reply_text = "응답을 생성하지 못했습니다."

            response_data = {
                "reply": reply_text,
                "category": category
            }
            self.wfile.write(json.dumps(response_data, ensure_ascii=False).encode("utf-8"))

        except Exception as e:
            error_data = {"error": f"서버 오류: {str(e)}"}
            self.wfile.write(json.dumps(error_data, ensure_ascii=False).encode("utf-8"))

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "POST, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type")
        self.end_headers()